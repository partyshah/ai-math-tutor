import React from 'react';
import './Feedback.css';

function Feedback({ feedback }) {
  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>Learning Feedback</h1>
        <button onClick={() => window.history.back()} className="back-button">
          ← Back to Chat
        </button>
      </div>
      
      <div className="feedback-content">
        {feedback ? (
          <div className="feedback-report">
            <pre>{feedback}</pre>
          </div>
        ) : (
          <div className="loading">
            Generating your personalized feedback...
          </div>
        )}
      </div>
    </div>
  );
}

export default Feedback;