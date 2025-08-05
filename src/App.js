import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Feedback from './Feedback';
import PDFViewer from './PDFViewer';
import MathRenderer from './MathRenderer';
import TTSService from './TTSService';
import './App.css';

const AppContext = createContext();

function ChatApp() {
  const { messages, setMessages, feedback, setFeedback, selectedAssignment, setSelectedAssignment } = useContext(AppContext);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Stop any playing audio when component unmounts or new message is being sent
  React.useEffect(() => {
    return () => {
      TTSService.stop();
    };
  }, []);

  const stopCurrentAudio = () => {
    TTSService.stop();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Stop any currently playing audio when sending new message
    stopCurrentAudio();

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
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
        
        // Auto-play TTS for AI response
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
    if (messages.length === 0) {
      alert('No conversation to analyze yet!');
      return;
    }

    try {
      setFeedback(null);
      navigate('/feedback');
      
      const response = await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFeedback(data.feedback);
      } else {
        setFeedback(`Error generating feedback: ${data.error}`);
      }
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className="split-screen-container">
        <div className="pdf-panel">
          <PDFViewer onAssignmentChange={setSelectedAssignment} />
        </div>
        
        <div className="chat-panel">
          <div className="chat-container">
            <div className="chat-header">
              <h1>AI Math Tutor</h1>
            </div>
            
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    <MathRenderer content={message.content} />
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
                placeholder="Ask me anything about the assignment..."
                disabled={isLoading}
              />
              <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                Send
              </button>
            </div>
            
            <div className="feedback-section">
              <button 
                onClick={generateFeedback} 
                className="feedback-button"
                disabled={messages.length === 0}
              >
                Generate Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackPage() {
  const { feedback } = useContext(AppContext);
  return <Feedback feedback={feedback} />;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState('');

  return (
    <AppContext.Provider value={{ messages, setMessages, feedback, setFeedback, selectedAssignment, setSelectedAssignment }}>
      <Router>
        <Routes>
          <Route path="/" element={<ChatApp />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;