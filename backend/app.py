from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
from ai_service import chat_with_ai, generate_feedback
from pdf_utils import get_assignment_text

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        selected_assignment = data.get('selectedAssignment')
        
        if not messages:
            return jsonify({'error': 'Messages are required'}), 400
        
        # Extract PDF context if assignment is selected
        pdf_context = None
        if selected_assignment:
            pdf_context = get_assignment_text(selected_assignment)
        
        response = chat_with_ai(messages, pdf_context)
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def feedback():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'Messages are required'}), 400
        
        feedback_report = generate_feedback(messages)
        return jsonify({'feedback': feedback_report})
    
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)