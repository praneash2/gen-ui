from google import genai
from google.genai import types
from PIL import Image
import PIL.Image
from io import BytesIO
import os
from dotenv import load_dotenv
from google.adk.agents import Agent

load_dotenv()

MODEL = "gemini-2.0-flash"
IMG_MODEL = "gemini-2.0-flash-preview-image-generation"

def get_image() -> Image:
    """
    Get an image from the local file system.
    
    Returns:
        Image: The image loaded from the local file system.
    """
    return PIL.Image.open('image.png')


def generate_image(prompt: str) -> Image:
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
        model="gemini-2.0-flash-preview-image-generation",
        contents=["Hi, This is a picture of logo. Please edit, modify and inpaint the logo according to the theme - " + prompt + ". Ensure that the image is inpainted and aligns with the original logo's structure. Don't reinvent the image rather modify by using your creativity and inpainting on the image.", image],
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
        )
    )
    
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            image.save('generated-image.png')
            return {
                "status": "success",
                "detail": "Image generated successfully and stored in artifacts.",
                "filename": "generated-image.png",
            }
    
    return {"status": "failed"}

root_agent = Agent(
    model=MODEL,
    name="multimodal_agent",
    description=(
        "An agent that generates images based on user prompts"
    ),
    instruction="""
    You are an agent whose job is to make 'generate_image' toolcall and pass the prompt to the tool.
    """,
    tools=[generate_image],
)
