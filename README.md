# AI Math Tutor - Pitch Practice Application

An AI-powered pitch practice application that helps entrepreneurs and students improve their presentation skills through interactive feedback and real-time mentoring.

## Overview

This application provides a comprehensive platform for practicing startup pitches with AI-powered feedback. Users can upload their pitch decks, practice presentations, receive real-time guidance from an AI VC mentor, and get detailed feedback on their performance.

## Architecture

### Tech Stack
- **Frontend**: React 18 with React Router
- **Backend**: Flask (Python) with OpenAI API integration
- **AI Services**: OpenAI GPT-5 for chat, Whisper for audio transcription
- **PDF Processing**: PyPDF2 for text extraction, pdf2image for slide rendering
- **Audio Processing**: pydub for audio segmentation
- **Styling**: Custom CSS with responsive design

### Project Structure

```
ai-math-tutor/
├── backend/                    # Flask backend server
│   ├── app.py                 # Main Flask application & API endpoints
│   ├── ai_service.py          # OpenAI GPT & Whisper integration
│   ├── feedback_service.py    # Pitch feedback generation & audio processing
│   ├── pdf_utils.py          # PDF text extraction utilities
│   ├── pdf_image_service.py  # PDF to image conversion & slide management
│   ├── assignments/           # Uploaded PDF storage
│   ├── slide_images/          # Generated slide images (thumbnails & full)
│   └── audio_sessions/        # Recorded audio segments per slide
├── src/                       # React frontend
│   ├── App.js                # Main app component with routing
│   ├── PDFViewer.js          # PDF display & slide navigation
│   ├── SlideRow.js           # Individual slide feedback display
│   ├── Avatar.js             # AI avatar animation component
│   ├── Feedback.js           # Feedback results display page
│   └── TTSService.js         # Text-to-speech service
├── public/                    # Static assets
│   └── pdf.worker.min.js     # PDF.js worker for rendering
├── package.json              # Frontend dependencies
└── requirements.txt          # Backend dependencies
```

## Key Components

### Backend Services

#### `app.py` (Main Flask Server)
- **Port**: 5001
- **CORS**: Enabled for localhost:3000
- **Key responsibilities**:
  - Manages all API endpoints
  - Handles file uploads and storage
  - Coordinates between different services

#### API Endpoints

1. **`POST /api/chat`**
   - Handles chat messages with AI mentor
   - Supports both text and audio input
   - Integrates PDF context when available
   - Returns AI-generated responses

2. **`GET /api/assignments`**
   - Lists available PDF assignments
   - Returns filenames and display names

3. **`GET /api/assignments/<filename>`**
   - Serves PDF files for viewing
   - Returns PDF with proper MIME type

4. **`POST /api/feedback`**
   - Generates comprehensive pitch feedback
   - Accepts conversation history and recordings
   - Processes slide timestamps for audio segmentation
   - Returns structured feedback with slide-by-slide analysis

5. **`POST /api/process-upload`**
   - Processes uploaded PDFs
   - Extracts slide images (thumbnails & full size)
   - Returns session ID and slide metadata

6. **`GET /api/slide-image/<session_id>/<slide_number>`**
   - Serves slide images (thumbnail or full)
   - Query param: `type=thumbnail|full`

7. **`GET /api/audio-segment/<session_id>/<slide_number>`**
   - Serves audio recording segments per slide
   - Used for playback in feedback view

#### Service Modules

**`ai_service.py`**
- OpenAI GPT-5 integration for chat responses
- Whisper API for audio transcription
- Custom system prompts for VC mentor persona
- Context injection from PDF content

**`feedback_service.py`**
- Comprehensive feedback generation
- Audio recording processing and segmentation
- Slide-by-slide performance analysis
- Learning objective evaluation:
  - Content structuring
  - Delivery quality
  - Impromptu response handling
  - Composure under pressure

**`pdf_utils.py`**
- PDF text extraction using PyPDF2
- Slide range extraction
- Assignment content retrieval

**`pdf_image_service.py`**
- PDF to image conversion
- Thumbnail and full-size image generation
- Session-based storage management
- Automatic cleanup of old sessions

### Frontend Components

#### Core Components

**`App.js`**
- Main application router
- Global state management via Context API
- Recording state management
- Message history tracking

**`PDFViewer.js`**
- PDF upload and display
- Slide navigation with locking mechanism
- Recording timestamp tracking
- Integration with backend processing

**`SlideRow.js`**
- Individual slide feedback display
- Audio playback per slide
- Visual status indicators
- Detailed feedback rendering

**`Avatar.js`**
- Animated AI avatar
- Visual feedback during TTS playback
- Loading and speaking states

**`Feedback.js`**
- Comprehensive feedback display
- Slide-by-slide breakdown
- Audio segment playback
- Modal for full-size slide viewing

**`TTSService.js`**
- Browser-based text-to-speech
- Queue management for responses
- State change notifications

## Data Flow

1. **PDF Upload Flow**:
   ```
   User uploads PDF → Frontend → /api/process-upload → 
   Extract images → Store in slide_images/ → Return session ID
   ```

2. **Chat Interaction Flow**:
   ```
   User message → Frontend → /api/chat → 
   AI Service (with PDF context) → GPT-5 → Response → TTS playback
   ```

3. **Feedback Generation Flow**:
   ```
   Recording + Messages + Timestamps → /api/feedback → 
   Audio segmentation → Transcription → GPT analysis → 
   Structured feedback with slide-specific insights
   ```

## Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key
- Homebrew (for macOS dependencies)

### macOS System Dependencies (via Homebrew)

**Essential brew installs required for the app to work:**
```bash
# Core dependencies for PDF processing and audio handling
brew install poppler ffmpeg

# Python (if not already installed)
brew install python@3.11

# Node.js (if not already installed) 
brew install node
```

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. **Install additional required Python packages** (these are essential for the app to work):
```bash
pip install pdf2image pillow PyPDF2 pydub
```

3. **Install system dependencies** (required for PDF and audio processing):

**macOS:**
```bash
brew install poppler ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get install poppler-utils ffmpeg
```

**Windows:**
- Download and install [poppler](https://github.com/oschwartz10612/poppler-windows/releases/) 
- Download and install [FFmpeg](https://ffmpeg.org/download.html)
- Add both to your system PATH

4. Create `.env` file in project root:
```
OPENAI_API_KEY=your_api_key_here
```

### Frontend Setup

1. Install Node dependencies:
```bash
npm install
```

2. Ensure PDF.js worker is in public directory:
   - File should exist: `public/pdf.worker.min.js`

### Running the Application

1. Start both frontend and backend together:
```bash
npm start
```
This command uses concurrently to run:
- Flask backend on port 5001
- React frontend on port 3000

Alternatively, run separately:

Backend:
```bash
python3 backend/app.py
```

Frontend:
```bash
npm run start
```

### Testing the Application

1. Navigate to http://localhost:3000
2. Upload a PDF pitch deck
3. Practice your pitch with recording enabled
4. Interact with the AI mentor for guidance
5. Generate feedback to receive comprehensive analysis

## Key Features

### For Entrepreneurs/Students
- **PDF Deck Upload**: Upload and view pitch decks directly
- **Live Recording**: Record practice sessions with timestamp tracking
- **AI VC Mentor**: Real-time conversational feedback during practice
- **Comprehensive Feedback**: Detailed analysis of presentation performance
- **Slide-by-Slide Review**: Individual feedback for each slide
- **Audio Playback**: Listen to your performance per slide

### Technical Features
- **Multimodal Input**: Support for text and audio inputs
- **Context-Aware Responses**: AI considers PDF content in responses
- **Session Management**: Unique sessions for each practice
- **Automatic Cleanup**: Old sessions cleaned up after 7 days
- **Responsive Design**: Works on desktop and tablet devices

## File Storage

### Persistent Storage
- `backend/assignments/`: Uploaded PDFs
- `backend/slide_images/`: Generated slide images per session
- `backend/audio_sessions/`: Recorded audio segments

### Session-Based Storage
Each practice session creates:
- Unique session ID
- Slide images (thumbnail + full resolution)
- Audio segments per slide
- Metadata JSON files

## Error Handling

The application includes comprehensive error handling for:
- Failed PDF uploads
- Audio recording issues
- API communication errors
- Missing files or sessions
- OpenAI API failures

## Performance Considerations

- **Image Caching**: Slide images cached per session
- **Audio Segmentation**: Efficient splitting based on timestamps
- **Cleanup**: Automatic removal of old sessions (7+ days)
- **Concurrent Processing**: Frontend and backend run in parallel
- **Optimized Rendering**: PDF.js worker for efficient PDF display

## Security Notes

- CORS restricted to localhost:3000
- File uploads validated for PDF type
- Unique session IDs prevent conflicts
- API key stored in environment variables
- No direct file system access from frontend

## Future Enhancements

Potential improvements:
- User authentication and profiles
- Practice history tracking
- Comparative analytics
- Export feedback reports
- Multi-language support
- Video recording capability
- Collaborative practice sessions