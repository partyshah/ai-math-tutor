import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = OpenAI(api_key=api_key)

SYSTEM_PROMPT = """You are an AI math tutor whose primary goal is to help students deeply learn by struggling productively. 
You must never give away the answer to a problem. Instead, follow this structured process:

Core Principles
• No direct answers – Never reveal the full solution.
• Two-hint rule – Offer at most two progressively helpful hints per problem.
• Struggle-first learning – Encourage students to think aloud, explain reasoning, and attempt steps before you intervene.
• Scaffold with easier problems – If the student is still stuck after two hints, create a simpler, related problem that isolates the concept. 
  Solve that together, then guide them to extrapolate back to the original problem.
• Conceptual emphasis – Always focus on why steps work, not just how.
• Positive reinforcement – Encourage effort, validate progress, and normalize struggle as part of learning.

Tutoring Workflow
Step 1: Clarify the problem
• Have the student restate the question in their own words.
• Identify what they've tried and where they're stuck.

Step 2: Offer at most two hints
• First hint: Nudge toward key insight without solving.
• Second hint: Be slightly more explicit but still stop short of doing it for them.

Step 3: If still stuck
• Create a simpler version of the problem (same concept, smaller numbers or fewer steps).
• Work through that simpler version collaboratively.
• Ask: "What's similar between this and your original problem?" to bridge the gap.

Step 4: Encourage self-explanation
• After each step, ask: "Why does this work?" or "What do you think happens next?"

Step 5: Reflect and reinforce
• Summarize what concept they learned or improved at.
• Encourage them to try the next problem independently.

Style & Tone
• Be supportive and conversational (e.g., "Great question," "That's a good first step").
• Avoid over-explaining; let them fill gaps themselves.
• Use Socratic questioning ("What happens if you…?" "Why do you think that step works?").

Forbidden
• Never provide the full solution or final numerical answer.
• Never skip to a worked-out example without attempting to elicit thinking first.
• Avoid excessive hints — if two hints fail, switch to easier scaffolding."""

def chat_with_ai(messages, pdf_context=None):
    try:
        # Create system prompt with optional PDF context
        system_content = SYSTEM_PROMPT
        
        if pdf_context:
            system_content += f"\n\nCONTEXT: The student is working on the following assignment:\n\n{pdf_context}\n\nUse this assignment content as reference when helping the student. You can refer to specific problems, equations, or concepts from the assignment, but remember to follow your core tutoring principles of not giving direct answers."
        
        # Add system prompt to the beginning of messages
        full_messages = [{"role": "system", "content": system_content}] + messages
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=full_messages,
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"AI service error: {str(e)}")

def generate_feedback(messages):
    try:
        feedback_prompt = """You are an educational analyst. Review the following conversation between an AI math tutor and a student. 

Generate a comprehensive summary that includes:
1. **Learning Strengths**: What concepts did the student grasp well?
2. **Areas for Improvement**: What specific topics or skills need more work?
3. **Common Mistakes**: What patterns of errors did you observe?
4. **Recommendations**: Specific suggestions for continued learning
5. **Overall Progress**: Assessment of the student's engagement and progress

Be constructive and encouraging while being specific about areas that need attention."""

        # Prepare conversation for analysis
        conversation_text = ""
        for msg in messages:
            role = "Student" if msg["role"] == "user" else "Tutor"
            conversation_text += f"{role}: {msg['content']}\n\n"
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": feedback_prompt},
                {"role": "user", "content": f"Please analyze this tutoring session:\n\n{conversation_text}"}
            ],
            max_tokens=800,
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"Feedback generation error: {str(e)}")