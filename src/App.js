import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PDFViewer from './PDFViewer';
import TTSService from './TTSService';
import Avatar from './Avatar';
import Feedback from './Feedback';
import './App.css';

const AppContext = createContext();

function ChatApp() {
  const { 
    messages, setMessages, selectedAssignment, setSelectedAssignment,
    isRecording, startRecording, stopRecording,
    recordingTime, formatTime, currentRecordingSegment
  } = useContext(AppContext);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState({ isLoading: false, isSpeaking: false });
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);

  // Set up TTS service listeners for avatar state
  React.useEffect(() => {
    const handleTTSStateChange = (state) => {
      console.log('Avatar state update:', state);
      setAvatarState(state);
    };

    TTSService.addListener(handleTTSStateChange);

    return () => {
      TTSService.removeListener(handleTTSStateChange);
      TTSService.stop();
    };
  }, []);

  const stopCurrentAudio = () => {
    TTSService.stop();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputMessage;
    setInputMessage('');
    console.log('Setting isLoading to true for processing');
    setIsLoading(true);

    try {
      // Normal chat flow
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          selectedAssignment: selectedAssignment
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const aiMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, aiMessage]);
        
        // Trigger TTS for AI response
        TTSService.speak(data.response);
      } else {
        const errorMessage = { role: 'assistant', content: `Error: ${data.error}` };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: `Error: ${error.message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateFeedback = async () => {
    if (!messages.length) return;
    
    setIsLoading(true);
    try {
      // Get the latest recording from the context
      const recordingBlob = currentRecordingSegment;
      
      // Get PDF session ID and slide count from localStorage
      const pdfSessionId = localStorage.getItem('currentPDFSession');
      const pdfSlideCount = localStorage.getItem('currentPDFSlideCount');
      console.log('📄 Using PDF session ID:', pdfSessionId);
      console.log('📄 Using PDF slide count:', pdfSlideCount);
      
      if (recordingBlob) {
        // Send with recording as multipart form data
        const formData = new FormData();
        formData.append('messages', JSON.stringify(messages));
        formData.append('selectedAssignment', selectedAssignment || '');
        formData.append('recording', recordingBlob, 'presentation.wav');
        formData.append('pdfSessionId', pdfSessionId || '');
        formData.append('pdfSlideCount', pdfSlideCount || '');
        
        const response = await fetch('http://localhost:5001/api/feedback', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Feedback response:', data);
          if (data.session_id || data.slides || data.feedback) {
            // New structured format or legacy format
            const feedbackToStore = data.feedback || JSON.stringify(data);
            localStorage.setItem('pitchFeedback', feedbackToStore);
            setFeedbackGenerated(true);
            alert('Feedback generated! Navigate to /feedback to view it.');
          } else {
            alert('Error: No feedback received from server');
          }
        } else {
          console.error('Feedback error:', data);
          alert(`Error generating feedback: ${data.error || 'Unknown error'}`);
        }
      } else {
        // Send without recording as JSON
        const response = await fetch('http://localhost:5001/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages,
            selectedAssignment: selectedAssignment || '',
            pdfSessionId: pdfSessionId || ''
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Feedback response (no recording):', data);
          if (data.session_id || data.slides || data.feedback) {
            // New structured format or legacy format
            const feedbackToStore = data.feedback || JSON.stringify(data);
            localStorage.setItem('pitchFeedback', feedbackToStore);
            setFeedbackGenerated(true);
            alert('Feedback generated! Navigate to /feedback to view it.');
          } else {
            alert('Error: No feedback received from server');
          }
        } else {
          console.error('Feedback error (no recording):', data);
          alert(`Error generating feedback: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      alert(`Error generating feedback: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="chat-panel-container">
            <Avatar 
              isSpeaking={avatarState.isSpeaking} 
              isLoading={avatarState.isLoading}
              isProcessing={isLoading}
            />
            <div className="chat-container">
              <div className="chat-header">
                <h1>Humanities Tutor</h1>
                
                {/* Begin Interaction / Recording Controls */}
                <div className="interaction-controls">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording}
                      className="begin-interaction-btn"
                    >
                      🎤 Begin Interaction
                    </button>
                  ) : (
                    <div className="recording-active-header">
                      <button 
                        onClick={stopRecording}
                        className="end-interaction-btn"
                      >
                        ⏹️ End Interaction
                      </button>
                      <div className="recording-status-header">
                        <span className="recording-indicator">🔴</span>
                        <span className="recording-time">{formatTime(recordingTime)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {!feedbackGenerated && currentRecordingSegment && (
                  <button 
                    onClick={generateFeedback} 
                    disabled={isLoading}
                    className="generate-feedback-btn"
                  >
                    {isLoading ? 'Generating...' : 'Generate Feedback'}
                  </button>
                )}
                {feedbackGenerated && (
                  <span style={{marginLeft: '10px', color: 'green', fontSize: '12px'}}>
                    Feedback ready at /feedback
                  </span>
                )}
              </div>
            
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Discuss the text or ask questions..."
                disabled={isLoading}
              />
              <div className="input-controls">
                <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                  Send
                </button>
                <button 
                  onClick={stopCurrentAudio} 
                  disabled={!avatarState.isSpeaking}
                  className="stop-speech-btn"
                  title="Stop speech"
                >
                  🔇
                </button>
              </div>
            </div>
            </div>
    </div>
  );
}


function App() {
  const [messages, setMessages] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [currentRecordingSegment, setCurrentRecordingSegment] = useState(null);
  
  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use a format that's more compatible with ffmpeg
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      console.log('🎵 Using MIME type for recording:', mimeType);
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log('🎵 Created audio blob:', audioBlob.type, audioBlob.size, 'bytes');
        setCurrentRecordingSegment(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
      
      console.log('Recording started');
    } catch (error) {
      alert('Error accessing microphone: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      console.log('Recording stopped');
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppContext.Provider value={{ 
      messages, setMessages, selectedAssignment, setSelectedAssignment,
      isRecording, startRecording, stopRecording,
      recordingTime, formatTime, currentRecordingSegment
    }}>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="App">
              <div className="split-screen-container">
                <div className="pdf-panel">
                  <PDFViewer 
                    onAssignmentChange={setSelectedAssignment} 
                  />
                </div>
                
                <div className="chat-panel">
                  <ChatApp />
                </div>
              </div>
            </div>
          } />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;