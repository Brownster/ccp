from typing import Dict, List, Any, Optional
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    # Mock class for testing
    class ChatGoogleGenerativeAI:
        def __init__(self, **kwargs):
            self.model = kwargs.get('model', 'gemini-pro')
            self.temperature = kwargs.get('temperature', 0.3)
        
        def invoke(self, text):
            # Return a mock response for testing
            class MockResponse:
                def __init__(self, content):
                    self.content = content
            
            if 'usage' in text:
                return MockResponse('50')
            elif 'question' in text:
                return MockResponse('This is a mock answer for testing')
            else:
                return MockResponse('Test response')
try:
    from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
except ImportError:
    # Mock prompt templates for testing
    class PromptTemplate:
        def __init__(self, input_variables=None, template=""):
            self.input_variables = input_variables or []
            self.template = template
            
        def format(self, **kwargs):
            return self.template
    
    class ChatPromptTemplate:
        @classmethod
        def from_template(cls, template):
            return cls(template)
            
        def __init__(self, template):
            self.template = template
            
        def __or__(self, other):
            return other
try:
    from langchain_core.output_parsers import StrOutputParser
except ImportError:
    # Mock output parser for testing
    class StrOutputParser:
        def __call__(self, *args, **kwargs):
            return self
            
        def invoke(self, text):
            if isinstance(text, str):
                return text
            elif hasattr(text, 'content'):
                return text.content
            return str(text)
import json

class LLMService:
    """
    Service for LLM interactions using LangChain and Google Generative AI
    """
    def __init__(self, model: str = "gemini-pro", temperature: float = 0.3):
        """
        Initialize the LLM service with specified model and temperature
        """
        self.model = model
        self.temperature = temperature
        self._llm = None # Lazy initialization
    
    @property
    def llm(self):
        """
        Lazy-loaded LLM instance
        """
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model=self.model, 
                temperature=self.temperature
            )
        return self._llm
    
    def suggest_usage_percentage(self, resource: Dict[str, Any]) -> int:
        """
        Suggest a reasonable default usage percentage for a resource
        
        Args:
            resource: Resource configuration dictionary
            
        Returns:
            Integer percentage between 0-100
        """
        prompt_template = PromptTemplate(
            input_variables=["resource"],
            template=(
                "You are a cloud cost expert. Based on the following Terraform resource configuration, "
                "suggest a reasonable default monthly usage percentage (0-100%) for cost prediction.\n"
                "Resource: {resource}\n"
                "Only return the number."
            )
        )
        
        prompt = prompt_template.format(resource=resource)
        
        try:
            response = self.llm.invoke(prompt)
            percent = int(''.join(filter(str.isdigit, response.content)))
            return min(percent, 100)  # Cap at 100%
        except Exception as e:
            print(f"LLM error in suggest_usage_percentage: {e}")
            return 100  # Default to 100% on errors
    
    def copilot_response(self, question: str, resources: List[Dict[str, Any]]) -> str:
        """
        Generate a copilot response to a user question
        
        Args:
            question: User's question about resources or costs
            resources: List of resources to provide context
            
        Returns:
            AI-generated response as a string
        """
        # Format resources as a simple list
        context = self._format_resource_summary(resources)
        
        prompt = ChatPromptTemplate.from_template("""
        You are an expert cloud cost assistant helping users understand infrastructure costs.
        Use the provided Terraform resource list to answer user questions clearly and concisely.
        If asked for help reducing cost, make realistic recommendations.
        
        Context:
        {context}
        
        User Question:
        {question}
        """)
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            return chain.invoke({ "question": question, "context": context })
        except Exception as e:
            print(f"LLM error in copilot_response: {e}")
            return "I'm sorry, I couldn't process your question at this time."
    
    def _format_resource_summary(self, resources: List[Dict[str, Any]]) -> str:
        """
        Format resources into a simple text summary for LLM context
        """
        lines = []
        for r in resources:
            name = r.get("name", "unnamed")
            type_ = r.get("resource_type", "unknown")
            cost = r.get("monthlyCost", "?")
            lines.append(f"- {name} ({type_}) costs approx ${cost}/mo")
        return "\n".join(lines)
    
    def analyze_diff(self, diff_text: str) -> str:
        """
        Analyze a terraform diff and provide insightful comments
        
        Args:
            diff_text: Diff output text from Terraform
            
        Returns:
            Markdown-formatted analysis
        """
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
        
        chain = diff_prompt | self.llm | StrOutputParser()
        
        try:
            return chain.invoke({ "diff": diff_text })
        except Exception as e:
            print(f"LLM error in analyze_diff: {e}")
            return "I couldn't analyze the diff at this time."
    
    def clarify_usage_questions(self, resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate clarifying questions for resource usage
        
        Args:
            resources: List of Terraform resources
            
        Returns:
            List of question objects with resource name and question text
        """
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
        
        chain = question_prompt | self.llm | StrOutputParser()
        
        try:
            response = chain.invoke({ "resources": json.dumps(resources) })
            return json.loads(response)
        except Exception as e:
            print(f"LLM error in clarify_usage_questions: {e}")
            return []
    
    def generate_usage_assumptions(self, 
                                resources: List[Dict[str, Any]], 
                                answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate usage assumptions based on resources and user answers
        
        Args:
            resources: List of Terraform resources
            answers: List of user answers to questions
            
        Returns:
            Dictionary of usage assumptions by resource name
        """
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
        
        chain = usage_prompt | self.llm | StrOutputParser()
        
        try:
            result = chain.invoke({
                "resources": json.dumps(resources),
                "answers": json.dumps(answers)
            })
            return json.loads(result)
        except Exception as e:
            print(f"LLM error in generate_usage_assumptions: {e}")
            return {}
