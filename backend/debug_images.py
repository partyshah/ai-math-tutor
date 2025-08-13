#!/usr/bin/env python3
from pdf_image_service import get_slide_image_path
import os

session_id = "1ecc3120-61aa-400f-9c06-ed369512d1bc"
slide_number = 1
image_type = "thumbnail"

print(f"Testing slide image path resolution:")
print(f"Session ID: {session_id}")
print(f"Slide number: {slide_number}")
print(f"Image type: {image_type}")

result = get_slide_image_path(session_id, slide_number, image_type)
print(f"\nResult: {result}")

# Also manually check the path
from pdf_image_service import SLIDE_IMAGES_DIR
session_dir = os.path.join(SLIDE_IMAGES_DIR, session_id)
file_type = 'thumb' if image_type == 'thumbnail' else image_type
image_file = f"slide_{slide_number}_{file_type}.png"
image_path = os.path.join(session_dir, image_file)

print(f"\nManual calculation:")
print(f"SLIDE_IMAGES_DIR: {SLIDE_IMAGES_DIR}")
print(f"Session dir: {session_dir}")
print(f"Image file: {image_file}")
print(f"Full path: {image_path}")
print(f"File exists: {os.path.exists(image_path)}")
print(f"Absolute path: {os.path.abspath(image_path)}")

if os.path.exists(session_dir):
    print(f"\nFiles in session dir:")
    for f in os.listdir(session_dir):
        print(f"  {f}")
else:
    print(f"\nSession directory doesn't exist: {session_dir}")