import os
from google.oauth2 import service_account
import google.auth.transport.requests
from fastapi import FastAPI, Form ,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai.types import GenerateContentConfig
from dotenv import load_dotenv
from fastapi.responses import JSONResponse,PlainTextResponse
from io import BytesIO
from pydantic import BaseModel, Field
from PIL import Image
import PIL.Image
import httpx


load_dotenv()
app = FastAPI()


# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set specific domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load credentials from JSON key file
SERVICE_ACCOUNT_FILE = "keys/service_account.json"
SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]
IMG_MODEL = os.getenv("IMG_MODEL", "gemini-2.0-flash-preview-image-generation")

class UIContentRequest(BaseModel):
    content: str = Field(..., description="The content for which the UI is to be generated.")

class LogoAgentResponse(BaseModel):
    status: str = Field(..., description="Status of the image generation process.")
    detail: str = Field(..., description="Detailed message about the generation process.")
    filename: str = Field(..., description="Name of the saved/generated image file.")
    logo_url: str = Field(..., description="The URL of the generated logo image.")

def get_image() -> Image:
    """
    Get an image from the local file system.
    
    Returns:
        Image: The image loaded from the local file system.
    """
    return PIL.Image.open('image.png')

def upload_image_to_cloudinary() -> str:
    """
    Uploads an image to Cloudinary and returns the URL.
    
    Returns:
        str: The URL of the uploaded image.
    """
    import cloudinary
    from cloudinary import uploader, api
    from cloudinary.exceptions import NotFound

    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    )

    image_path = "generated-image.png"
    public_id = "resolutes_genUI_img"

    try:
        existing_image = cloudinary.api.resource(public_id)
        print("Image already exists. URL:", existing_image['secure_url'])

        if existing_image:
            response = cloudinary.uploader.upload(image_path, public_id=public_id, overwrite=True)
            print("Image replaced. New URL:", response['secure_url'])
            return response['secure_url']

    except NotFound:
        response = cloudinary.uploader.upload(image_path, public_id=public_id)
        print("Image uploaded. URL:", response['secure_url'])
        return response['secure_url']

def fetch_gcp_access_token():
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        auth_req = google.auth.transport.requests.Request()
        credentials.refresh(auth_req)
        return credentials.token
    except Exception as e:
        raise RuntimeError(f"Failed to fetch GCP token: {e}")  
    

# List and delete sessions
async def list_and_delete_sessions(access_token: str, user_id: str):
    vertex_query_url = os.getenv("VERTEX_QUERY_URL")
    try:
        async with httpx.AsyncClient() as client:
            # List sessions
            list_res = await client.post(vertex_query_url, json={
                "class_method": "list_sessions",
                "input": {"user_id": user_id}
            }, headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            })
            list_data = list_res.json()
            sessions = list_data.get("output", {}).get("sessions", [])

            if not isinstance(sessions, list):
                print("❌ Invalid response: 'sessions' is not an array.")
                print("Full response:", list_data)
                return

            # Delete sessions
            for session in sessions:
                session_id = session.get("id")
                delete_res = await client.post(vertex_query_url, json={
                    "class_method": "delete_session",
                    "input": {
                        "user_id": user_id,
                        "session_id": session_id
                    }
                }, headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {access_token}"
                })
                if delete_res.status_code != 200:
                    print(f"❌ Failed to delete session {session_id}")

    except Exception as e:
        print("❌ Error during session handling:", e)

    
@app.get("/health")
def get_health():
    return {"message": "Health check successful!"}

@app.get("/api/access-token")
def get_gcp_token():
    try:
        token = fetch_gcp_access_token()
        return JSONResponse(content={"access_token": token})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/generate-logo",response_model=LogoAgentResponse)
async def generate_logo(prompt: str = Form(...)):
    """
    Generate a logo based on the provided prompt using Google GenAI.
    Args:
        prompt (str): The prompt describing the logo to be generated.
    Returns:
        LogoAgentResponse: A response containing the status, detail, filename, and logo URL."""
    
    client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
    image = get_image()

    response = client.models.generate_content(
        model=IMG_MODEL,
        contents=["Hi, This is a picture of logo. Please edit, modify and inpaint the logo according to the theme - " + prompt + ". Ensure that the image is inpainted and aligns with the original logo's structure. Don't reinvent the image rather modify by using your creativity and inpainting on the image.", image],
        config=GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
        )
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            image.save('generated-image.png')

            url = upload_image_to_cloudinary()

            return LogoAgentResponse(
                status="success",
                detail="Image generated successfully and stored in artifacts.",
                filename="generated-image.png",
                logo_url=url
            )
    return JSONResponse(
        status_code=500,
        content={"status": "failed", "detail": "No valid image found in response"}
    )



@app.post("/api/generate-ui")
async def generate_ui(data: UIContentRequest):
    access_token = fetch_gcp_access_token()
    if not access_token:
        raise HTTPException(status_code=500, detail="Failed to fetch access token")

    vertex_stream_url = os.getenv("VERTEX_STREAM_URL")
    user_id = os.getenv("USER_ID")

    message_payload = {
        "class_method": "stream_query",
        "input": {
            "user_id": user_id,
            "message": {
                "role": "user",
                "parts": [
                    { "text": data.content }
                ]
            }
        }
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            response = await client.post(vertex_stream_url, json=message_payload, headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            })
            response.raise_for_status()
            print("Response status code:", response)
            return PlainTextResponse(content=response.text)
    except Exception as e:
        print("❌ Error during stream query:", e)
        raise HTTPException(status_code=500, detail="Failed to fetch UI content")
    finally:
        await list_and_delete_sessions(access_token, user_id)

# For running directly
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)