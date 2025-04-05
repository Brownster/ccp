
from typing import TypedDict, List, Dict
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json

llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

# --- STATE ---
class UsageAssumptionState(TypedDict):
    resources: List[Dict]
    questions: List[Dict]
    answers: List[Dict]
    usage_json: Dict

# --- NODE 1: Clarify ---
question_prompt = ChatPromptTemplate.from_template("""
You are a Terraform usage assistant. For each resource, generate 1-2 clarifying questions to understand usage.

Format JSON like:
[
  { "resource_name": "aws_lambda.my_func", "question": "..." },
  ...
]

Resources:
{resources}
""")

def clarify_usage(state: UsageAssumptionState) -> UsageAssumptionState:
    chain = question_prompt | llm | StrOutputParser()
    response = chain.invoke({ "resources": json.dumps(state["resources"]) })
    try:
        parsed = json.loads(response)
        return { **state, "questions": parsed }
    except Exception:
        return { **state, "questions": [] }

# --- NODE 2: Generate Usage JSON ---
usage_prompt = ChatPromptTemplate.from_template("""
You are a cloud cost expert. Use the user's answers to generate a usage assumptions JSON for Infracost.

Format:
{
  "aws_lambda.my_func": {
    "monthly_requests": 1000000
  },
  ...
}

Resources:
{resources}

Answers:
{answers}
""")

def generate_usage(state: UsageAssumptionState) -> UsageAssumptionState:
    chain = usage_prompt | llm | StrOutputParser()
    result = chain.invoke({
        "resources": json.dumps(state["resources"]),
        "answers": json.dumps(state["answers"])
    })
    try:
        usage = json.loads(result)
    except Exception:
        usage = {}
    return { **state, "usage_json": usage }

# --- FLOW OPTIONS ---

def get_full_flow():
    builder = StateGraph(UsageAssumptionState)
    builder.add_node("clarify", clarify_usage)
    builder.add_node("generate", generate_usage)
    builder.set_entry_point("clarify")
    builder.add_edge("clarify", "generate")
    builder.add_edge("generate", END)
    return builder.compile()

# Split flow entry points for frontend flexibility
def clarify_only(resources: List[Dict]) -> List[Dict]:
    return clarify_usage({ "resources": resources, "questions": [], "answers": [], "usage_json": {} })["questions"]

def generate_from_answers(resources: List[Dict], answers: List[Dict]) -> Dict:
    return generate_usage({ "resources": resources, "questions": [], "answers": answers, "usage_json": {} })["usage_json"]

def run_usage_assumption_flow(resources: List[Dict]) -> Dict:
    flow = get_full_flow()
    state = flow.invoke({ "resources": resources })
    return {
        "questions": state["questions"],
        "usage": state["usage_json"]
    }
