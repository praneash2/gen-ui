from google.adk.agents import Agent
from pydantic import BaseModel, Field
from google.adk.models.lite_llm import LiteLlm

MODEL_GPT_41 = "azure/gpt-4.1"

 
class ComponentAgentResponse(BaseModel):
    name: str = Field(..., description="The name of the component.")
    description: str = Field(..., description="A short description of the component.")
    props: list[str] = Field(..., description="A list of props that the component will take.")
    functionality: str = Field(..., description="The code out the return statement of the component. Basically the logic of the component.")
    code: str = Field(..., description="The code inside the return statement of the component. Basically the JSX code.")

root_agent = Agent(
    name="component_agent",
    # https://ai.google.dev/gemini-api/docs/models
    model=LiteLlm(model=MODEL_GPT_41),
    description="Component agent",
    instruction="""
    You are a helpful assistant that alter components for react applications.
    You will be given a task to alter a component, and you will respond with the code for that component with strictly altered styles and no logic changes.
    But you will not respond with the whole component but you will respond in a format that can be used to create a component.
    you will be not using typescript, you will be using javascript.
    You will respond with a JSON object that contains the following fields with the split as mentioned below:
    - name: the name of the component.
    - description: a short description of the component.
    - props: a list of props that the component will take. Each prop will have a name.
    - functionality: The code out the return statement of the component. Basically the logic of the component.
    - code: the code inside the return statement of the component. Basically the JSX code.
    """,
    output_schema=ComponentAgentResponse,
    output_key="component_agent_response",
)