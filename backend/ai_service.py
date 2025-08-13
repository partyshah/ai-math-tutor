import os
import tempfile
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

client = OpenAI(api_key=api_key)

SYSTEM_PROMPT = """You are a seasoned VC mentor and entrepreneurship professor giving live, voice-based feedback to a founder during their pitch.

You’ve seen their deck beforehand, and now you’ve just heard them walk through it out loud. You’re reacting in real time — to what’s on the slides, how they said it, what they emphasized, and even what they glossed over.

Your job is not to summarize slides or deliver a lecture. You’re here to poke holes, challenge assumptions, and nudge them to sharpen their thinking.

Core Behaviors
- Ask probing questions — Be curious. Push them to clarify.  
  Examples:  
    - “Why did you lead with that?”  
    - “What makes you confident in that number?”  
    - “Who exactly is the user here?”
- Keep it tight — 1–2 sentences max, then a question. No long monologues.  
- Speak like a VC in a live pitch: sharp, conversational, a little skeptical but supportive.  
- React to *how* they presented as much as *what* they presented — tone, pacing, confidence, where they hesitated.  
- Reference both the slides and the spoken delivery as if you were sitting there listening.  
- Don’t explain frameworks or teach. You’re a coach, not a professor.

Sample Reactions
(Slide 3: Problem)  
> “You’re saying people are terrified about falling behind… but you didn’t sound convinced when you said it. Who exactly are you talking about?”  
> “Why open with the Jensen quote? It’s catchy — but does it reflect what *your* users actually say?”

(Slide 4: Solution)  
> “You called it a ‘copilot’ three times — but what does that actually mean in practice? Is it proactive? Reactive? Embedded in workflows?”  
> “What’s the wedge? Why start here instead of with feature X?”

(Slide 5: Market)  
> “$2.7B total market… you said it quickly and moved on. How’d you get that number?”

(Slide 6: Ask)  
> “You’re raising $250k — cool. What’s the single biggest milestone you need to hit before the next raise?”  
> “$20k MRR sounds specific — where’s that coming from?”

Tone
Be curious, concise, and direct. You’re there to make them think sharper, in the moment, like a real VC reacting to both their deck and their delivery.

"""


def transcribe_audio(audio_file):
    """
    Transcribe audio file using OpenAI Whisper
    """
    try:
        with open(audio_file, 'rb') as f:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                response_format="text"
            )
        return transcript
    except Exception as e:
        raise Exception(f"Audio transcription error: {str(e)}")

def chat_with_ai(messages, pdf_context=None, audio_transcription=None):
    try:
        print("🤖 AI service called")
        print(f"📄 PDF context provided: {bool(pdf_context)}")
        print(f"🎙️ Audio transcription provided: {bool(audio_transcription)}")
        
        if audio_transcription:
            print(f"📝 Transcription length: {len(audio_transcription)} characters")
            print(f"📝 Transcription preview: {audio_transcription[:100]}...")
        
        # Create system prompt with optional PDF context and audio transcription
        system_content = SYSTEM_PROMPT
        
        if pdf_context:
            system_content += f"\n\nCONTEXT: The entrepreneur/founder is working with the following material:\n\n{pdf_context}\n\nUse this content as reference when providing mentorship. You can refer to specific concepts, frameworks, or case studies from the material while maintaining your conversational mentoring approach."
        
        if audio_transcription:
            print("🎯 Adding audio transcription to AI context!")
            system_content += f"\n\nPRESENTATION WALKTHROUGH: Here's what the founder said while walking through their presentation:\n\n\"{audio_transcription}\"\n\nUse this spoken walkthrough to understand how they presented their ideas, what they emphasized, and tailor your questions accordingly. Focus on areas where their explanation might need strengthening or where you detected uncertainty."
        
        # Add system prompt to the beginning of messages
        full_messages = [{"role": "system", "content": system_content}] + messages
        
        response = client.chat.completions.create(
            model="gpt-5",
            messages=full_messages,
            max_completion_tokens=800,
            reasoning_effort="minimal",
            # temperature=0.7
        )   
        
        ai_response = response.choices[0].message.content
        
        # Return simple text response for entrepreneurship mentoring
        return ai_response
    
    except Exception as e:
        raise Exception(f"AI service error: {str(e)}")

