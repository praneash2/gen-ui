from dotenv import load_dotenv
from google.adk.agents import Agent
import httpx
from pydantic import BaseModel, Field
import os

# Load environment variables
load_dotenv()

MODEL = os.getenv("MODEL", "gemini-2.0-flash")
FASTAPI_URL = os.getenv("FASTAPI_URL")

class LogoAgentResponse(BaseModel):
    status: str = Field(..., description="Status of the image generation process.")
    detail: str = Field(..., description="Detailed message about the generation process.")
    filename: str = Field(..., description="Name of the saved/generated image file.")
    logo_url: str = Field(..., description="The URL of the generated logo image.")


async def generate_image(prompt: str) -> LogoAgentResponse:
    """
    Generate an image based on the provided prompt using Google Gemini API via FastAPI.

    Args:
        prompt (str): The text prompt for image generation.

    Returns:
        LogoAgentResponse: Response containing status, filename, and image URL.
    """
    files = {
        "prompt": (None, prompt),
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(FASTAPI_URL, files=files)

        if response.status_code == 200:
            return LogoAgentResponse(**response.json())
        else:
            raise Exception(f"FastAPI error {response.status_code}: {response.text}")


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
