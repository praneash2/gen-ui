from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from google.adk.agents import Agent

load_dotenv()

MODEL = "gemini-2.0-flash"
IMG_MODEL = "gemini-2.0-flash-preview-image-generation"

class LogoAgentResponse(BaseModel):
    status: str = Field(..., description="Status of the image generation process.")
    detail: str = Field(..., description="Detailed message about the generation process.")
    filename: str = Field(..., description="Name of the saved/generated image file.")
    logo_url: str = Field(..., description="The URL of the generated logo image.")


def get_image() -> Image.Image:
    """
    Get an image from the local file system.
    
    Returns:
        Image: The image loaded from the local file system.
    """
    return Image.open('image.png')


async def generate_image(prompt: str) -> LogoAgentResponse:
    """
    Generate an image based on the provided prompt using Google Gemini API.
    
    Args:
        prompt (str): The text prompt for image generation.
    
    Returns:
        Image: The generated image.
    """

    client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
    image = get_image()

    response = client.models.generate_content(
        model=IMG_MODEL,
        contents=[
            f"Hi, This is a picture of logo. Please edit, modify and inpaint the logo according to the theme - {prompt}. "
            "Ensure that the image is inpainted and aligns with the original logo's structure. "
            "Don't reinvent the image rather modify by using your creativity and inpainting on the image.",
            image
        ],
        config=types.GenerateContentConfig(response_modalities=['TEXT', 'IMAGE'])
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

    raise ValueError("Image generation failed; no inline data found.")


def image_file_to_base64(format: str = "PNG") -> str:

    """
    Reads an image from a file path and returns its Base64-encoded string.
    raise ValueError("Image generation failed; no inline data found.")

    Args:
        format (str): Format to encode the image in (e.g., "PNG", "JPEG").

    Returns:
        str: Base64-encoded string of the image.
    """
    with Image.open("generated-image.png") as image:
        buffered = BytesIO()
        image.save(buffered, format=format)
        res = base64.b64encode(buffered.getvalue()).decode("utf-8")
        with open("image_base64.txt", "w") as f:
            f.write(res)
        return res

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

logo_agent = Agent(
    model=MODEL,
    name="logo_agent",
    description="An agent that generates images based on user prompts",
    instruction="""
    You are an agent whose job is to make 'generate_image' toolcall from the key 'theme' in the input prompt and pass the 'theme' to the tool. 
    Whatever be the structure of the input prompt, you will infer the 'theme' from it and pass it to the toolcall.
     Get the LogoURL(logo_url) from the tool call response LogoAgentResponse and strictly return only the URL in the response no other texts.
    """,
    tools=[generate_image],
    output_key="logo_agent_response",
)
