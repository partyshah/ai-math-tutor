import os
import PyPDF2
from typing import Optional

def extract_pdf_text(pdf_path: str) -> Optional[str]:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file
        
    Returns:
        Optional[str]: Extracted text content or None if extraction fails
    """
    try:
        if not os.path.exists(pdf_path):
            return None
            
        text_content = ""
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract text from all pages
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text_content += page.extract_text() + "\n"
        
        return text_content.strip() if text_content.strip() else None
        
    except Exception as e:
        print(f"Error extracting PDF text: {str(e)}")
        return None

def get_assignment_text(filename: str) -> Optional[str]:
    """
    Get text content from an assignment PDF file.
    
    Args:
        filename (str): Name of the PDF file in the assignments directory
        
    Returns:
        Optional[str]: Extracted text content or None if extraction fails
    """
    assignments_dir = os.path.join(os.path.dirname(__file__), 'assignments')
    pdf_path = os.path.join(assignments_dir, filename)
    
    if not filename.endswith('.pdf'):
        return None
        
    return extract_pdf_text(pdf_path)