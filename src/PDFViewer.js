import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use the local worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function PDFViewer({ onAssignmentChange }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/assignments');
      const data = await response.json();
      if (response.ok) {
        setAssignments(data.assignments);
      } else {
        setError(`Error fetching assignments: ${data.error}`);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  const handleAssignmentChange = (e) => {
    const filename = e.target.value;
    console.log('Selected assignment:', filename);
    setSelectedAssignment(filename);
    
    // Notify parent component about assignment change
    if (onAssignmentChange) {
      onAssignmentChange(filename);
    }
    
    if (filename) {
      setLoading(true);
      setError(null);
      setNumPages(null);
      setPageNumber(1);
    }
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(numPages, prevPageNumber + offset)));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(3.0, prevScale + 0.2));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(0.5, prevScale - 0.2));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="assignment-selector">
          <select 
            value={selectedAssignment} 
            onChange={handleAssignmentChange}
            className="assignment-dropdown"
          >
            <option value="">Select an assignment</option>
            {assignments.map((assignment, index) => (
              <option key={index} value={assignment.filename}>
                {assignment.displayName}
              </option>
            ))}
          </select>
        </div>

        {selectedAssignment && (
          <div className="pdf-toolbar">
            <div className="page-controls">
              <button 
                onClick={() => changePage(-1)} 
                disabled={pageNumber <= 1}
                className="control-btn"
              >
                Previous
              </button>
              <span className="page-info">
                Page {pageNumber} of {numPages || '?'}
              </span>
              <button 
                onClick={() => changePage(1)} 
                disabled={pageNumber >= numPages}
                className="control-btn"
              >
                Next
              </button>
            </div>

            <div className="zoom-controls">
              <button onClick={zoomOut} className="control-btn">Zoom Out</button>
              <span className="zoom-info">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="control-btn">Zoom In</button>
              <button onClick={resetZoom} className="control-btn">Reset</button>
            </div>
          </div>
        )}
      </div>

      <div className="pdf-content">
        {!selectedAssignment && (
          <div className="no-assignment">
            <p>Select an assignment from the dropdown above to view the PDF.</p>
          </div>
        )}

        {loading && (
          <div className="pdf-loading">
            <p>Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="pdf-error">
            <p>{error}</p>
          </div>
        )}

        {selectedAssignment && (
          <div className="pdf-document">
            <Document
              file={`http://localhost:5001/api/assignments/${selectedAssignment}`}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div>Loading PDF...</div>}
              error={<div>Failed to load PDF</div>}
              noData={<div>No PDF file specified</div>}
            >
              {numPages && (
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              )}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;