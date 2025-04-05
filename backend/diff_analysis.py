
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

diff_prompt = ChatPromptTemplate.from_template("""
You are a cloud cost analyst reviewing Terraform Infracost diff output.

Your goal is to:
- Summarize overall cost changes
- Highlight services with large increases (> 20%)
- Recommend optimizations where possible

Respond in markdown format.

Diff:
{diff}
""")

def analyze_diff(diff_text: str) -> str:
    chain = diff_prompt | llm | StrOutputParser()
    return chain.invoke({ "diff": diff_text })
