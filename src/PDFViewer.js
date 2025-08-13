import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use the local worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

function PDFViewer({ onAssignmentChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  

  // Fetch available assignments on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/assignments');
      const data = await response.json();
      if (response.ok) {
        setAvailableAssignments(data.assignments);
      } else {
        console.error('Failed to fetch assignments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };
  

  const handleAssignmentSelect = async (event) => {
    const filename = event.target.value;
    if (!filename) {
      // Clear selection
      setSelectedFile(null);
      setPdfUrl(null);
      setSelectedFileName('');
      setNumPages(null);
      setPageNumber(1);
      return;
    }
    
    setSelectedAssignment(filename);
    setLoading(true);
    setError(null);
    setNumPages(null);
    setPageNumber(1);
    
    try {
      // Simply load the PDF directly from the assignments endpoint
      console.log('📄 Loading PDF:', filename);
      
      // Set the PDF URL for display
      const pdfUrl = `http://localhost:5001/api/assignments/${filename}`;
      setPdfUrl(pdfUrl);
      setSelectedFile(filename);
      setSelectedFileName(filename.replace('.pdf', '').replace('_', ' ').title());
      
      // Notify parent component about file selection
      if (onAssignmentChange) {
        onAssignmentChange(filename);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setError('Failed to load PDF: ' + error.message);
      setLoading(false);
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

  // Remove handleAssignmentChange since we're using file upload

  const changePage = (offset) => {
    const newPageNumber = Math.max(1, Math.min(numPages, pageNumber + offset));
    setPageNumber(newPageNumber);
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(3.0, prevScale + 0.2));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(0.5, prevScale - 0.2));
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="assignment-selection-section">
          <div className="assignment-selector">
            <label htmlFor="assignment-select" className="assignment-label">
              Select Assignment:
            </label>
            <select
              id="assignment-select"
              value={selectedAssignment}
              onChange={handleAssignmentSelect}
              className="assignment-dropdown"
              disabled={loading}
            >
              <option value="">-- Choose an assignment --</option>
              {availableAssignments.map((assignment) => (
                <option key={assignment.filename} value={assignment.filename}>
                  {assignment.displayName}
                </option>
              ))}
            </select>
          </div>
          {selectedFile && (
            <div className="selected-file-info">
              <span className="file-name">📄 {selectedFileName}</span>
            </div>
          )}
        </div>

        {selectedFile && (
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
            </div>
          </div>
        )}
      </div>

      <div className="pdf-content">
        {!pdfUrl && (
          <div className="no-assignment">
            <p>Select a PDF assignment above to get started.</p>
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

        {pdfUrl && (
          <div className="pdf-document">
            <Document
              file={pdfUrl}
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