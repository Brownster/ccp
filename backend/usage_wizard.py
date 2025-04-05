from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, END
from langgraph.prebuilt.tool_executor import ToolExecutor

from typing import TypedDict, List
from langchain_core.runnables import RunnableConfig

llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.4)

# Define input/output schema for LangGraph
class WizardState(TypedDict):
    resources: List[dict]
    known_usage: dict
    questions: List[str]
    answers: List[str]

# Node: Parse initial resource list
def parse_resources(state: WizardState) -> WizardState:
    return {**state, "questions": [], "answers": [], "known_usage": {}}

# Node: Check for gaps and generate questions
def check_gaps(state: WizardState) -> str:
    state["questions"] = []
    for res in state["resources"]:
        if res.get("resource_type") == "aws_instance":
            state["questions"].append("Are your EC2 instances running 24/7 or only during work hours?")
        elif res.get("resource_type") == "aws_lambda_function":
            state["questions"].append("Roughly how many invocations per month for your Lambda function?")
    return "ask" if state["questions"] else "done"

# Node: Ask questions
def ask_questions(state: WizardState) -> WizardState:
    return state  # questions are already generated

# Node: Collect answers
def collect_answers(state: WizardState) -> WizardState:
    # Simulate collecting answers (to be wired up later)
    state["answers"] = ["24/7", "1 million"]  # placeholder
    return state

# Node: Generate usage.yml content
def generate_usage_file(state: WizardState) -> WizardState:
    usage = {}
    for res in state["resources"]:
        name = res["name"]
        if res["resource_type"] == "aws_instance":
            usage[name] = {"monthly_hours": 720}
        elif res["resource_type"] == "aws_lambda_function":
            usage[name] = {"monthly_requests": 1000000}
    state["known_usage"] = usage
    return state

# Build LangGraph
builder = StateGraph(WizardState)
builder.add_node("parse", parse_resources)
builder.add_node("check", check_gaps)
builder.add_node("ask", ask_questions)
builder.add_node("collect", collect_answers)
builder.add_node("generate", generate_usage_file)

builder.set_entry_point("parse")
builder.add_edge("parse", "check")
builder.add_conditional_edges("check", check_gaps, {"ask": "ask", "done": "generate"})
builder.add_edge("ask", "collect")
builder.add_edge("collect", "generate")
builder.add_edge("generate", END)

usage_flow = builder.compile()

def run_usage_wizard(resources: List[dict]) -> dict:
    result = usage_flow.invoke({"resources": resources})
    return {
        "usage": result["known_usage"],
        "questions": result["questions"],
        "answers": result["answers"]
    }
