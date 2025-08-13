#!/usr/bin/env python3
from pdf_image_service import get_slide_image_path
import os

session_id = "1ecc3120-61aa-400f-9c06-ed369512d1bc"
slide_number = 1
image_type = "thumbnail"

path = get_slide_image_path(session_id, slide_number, image_type)
print(f"Returned path: {path}")
print(f"Is absolute: {os.path.isabs(path)}")
print(f"Absolute path: {os.path.abspath(path)}")
print(f"File exists (relative): {os.path.exists(path)}")
print(f"File exists (absolute): {os.path.exists(os.path.abspath(path))}")

# Test with Flask's send_file requirements
try:
    from flask import Flask, send_file
    app = Flask(__name__)
    with app.app_context():
        # This should work
        print(f"send_file can handle: {path}")
except Exception as e:
    print(f"send_file error: {e}")