from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
from dotenv import load_dotenv
from ai_service import chat_with_ai, transcribe_audio
from pdf_utils import get_assignment_text, get_assignment_slides_range

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        print("🌐 API /chat endpoint called")
        print(f"📋 Content-Type: {request.content_type}")
        
        # Check if this is a multipart request (with audio file)
        if request.content_type and 'multipart/form-data' in request.content_type:
            print("🎵 Multipart request detected - checking for audio...")
            
            # Handle multipart request with audio
            messages_json = request.form.get('messages')
            if not messages_json:
                return jsonify({'error': 'Messages are required'}), 400
            
            import json
            messages = json.loads(messages_json)
            selected_assignment = request.form.get('selectedAssignment')
            
            # Handle audio file if present
            audio_transcription = None
            if 'audio' in request.files:
                audio_file = request.files['audio']
                print(f"🎙️ Audio file received: {audio_file.filename}")
                print(f"📏 Audio file size: {audio_file.content_length} bytes")
                
                if audio_file and audio_file.filename:
                    # Save audio file temporarily
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                        audio_file.save(temp_audio.name)
                        print(f"💾 Audio saved to temporary file: {temp_audio.name}")
                        
                        try:
                            # Transcribe audio
                            print("🔊 Starting audio transcription with Whisper...")
                            audio_transcription = transcribe_audio(temp_audio.name)
                            print(f"✅ Audio transcription successful!")
                            print(f"📝 Transcription: {audio_transcription}")
                        except Exception as transcribe_error:
                            print(f"❌ Transcription failed: {transcribe_error}")
                        finally:
                            # Clean up temporary file
                            os.unlink(temp_audio.name)
                            print("🗑️ Temporary audio file cleaned up")
            else:
                print("⚠️ No audio file found in multipart request")
            
        else:
            # Handle regular JSON request
            data = request.get_json()
            messages = data.get('messages', [])
            selected_assignment = data.get('selectedAssignment')
            audio_transcription = None
            
            if not messages:
                return jsonify({'error': 'Messages are required'}), 400
        
        # Extract PDF context if assignment is selected
        pdf_context = None
        if selected_assignment:
            pdf_context = get_assignment_text(selected_assignment)
        
        ai_response = chat_with_ai(messages, pdf_context, audio_transcription)
        
        # Return simple response for entrepreneurship mentoring
        return jsonify({'response': ai_response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    try:
        assignments_dir = os.path.join(os.path.dirname(__file__), 'assignments')
        
        if not os.path.exists(assignments_dir):
            return jsonify({'assignments': []}), 200
            
        pdf_files = []
        for filename in os.listdir(assignments_dir):
            if filename.endswith('.pdf'):
                pdf_files.append({
                    'filename': filename,
                    'displayName': filename.replace('.pdf', '').replace('_', ' ').title()
                })
        
        return jsonify({'assignments': pdf_files})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assignments/<filename>', methods=['GET'])
def get_assignment_file(filename):
    try:
        assignments_dir = os.path.join(os.path.dirname(__file__), 'assignments')
        file_path = os.path.join(assignments_dir, filename)
        
        if not os.path.exists(file_path) or not filename.endswith('.pdf'):
            return jsonify({'error': 'File not found'}), 404
            
        return send_file(file_path, mimetype='application/pdf')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assignments/<filename>/slides', methods=['POST'])
def get_assignment_slides(filename):
    try:
        data = request.get_json()
        start_slide = data.get('start_slide')
        end_slide = data.get('end_slide')
        
        if not start_slide or not end_slide:
            return jsonify({'error': 'start_slide and end_slide are required'}), 400
            
        slide_content = get_assignment_slides_range(filename, start_slide, end_slide)
        full_content = get_assignment_text(filename)
        
        if slide_content is None:
            return jsonify({'error': 'Could not extract slide content'}), 404
            
        return jsonify({
            'slide_range': f"{start_slide}-{end_slide}",
            'focused_content': slide_content,
            'full_content': full_content
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)