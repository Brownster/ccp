
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import Runnable
from langchain_core.output_parsers import StrOutputParser

llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

prompt = ChatPromptTemplate.from_template("""
You are an expert cloud cost assistant helping users understand infrastructure costs.
Use the provided Terraform resource list to answer user questions clearly and concisely.
If asked for help reducing cost, make realistic recommendations.

Context:
{context}

User Question:
{question}
""")

def resource_summary(resources):
    lines = []
    for r in resources:
        name = r.get("name", "unnamed")
        type_ = r.get("resource_type", "unknown")
        cost = r.get("monthlyCost", "?")
        lines.append(f"- {name} ({type_}) costs approx ${cost}/mo")
    return "\n".join(lines)

def copilot_agent(question: str, resources: list) -> str:
    context = resource_summary(resources)
    chain: Runnable = prompt | llm | StrOutputParser()
    return chain.invoke({ "question": question, "context": context })
