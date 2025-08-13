#!/usr/bin/env python3
import requests
import json

# Test endpoints
base_url = "http://localhost:5001"

print("Testing AI Math Tutor Backend Endpoints")
print("=" * 50)

# Find the most recent sessions
import os
import glob

# Get most recent slide image session
slide_sessions = glob.glob("slide_images/*")
if slide_sessions:
    latest_slide_session = max(slide_sessions, key=os.path.getctime)
    session_id = os.path.basename(latest_slide_session)
    print(f"\n📸 Latest slide session: {session_id}")
    
    # Test slide image endpoints
    for slide_num in [1, 2, 3, 4]:
        thumb_url = f"{base_url}/api/slide-image/{session_id}/{slide_num}?type=thumbnail"
        full_url = f"{base_url}/api/slide-image/{session_id}/{slide_num}?type=full"
        
        thumb_response = requests.head(thumb_url)
        full_response = requests.head(full_url)
        
        print(f"  Slide {slide_num} thumbnail: {thumb_response.status_code}")
        print(f"  Slide {slide_num} full: {full_response.status_code}")

# Get most recent audio session
audio_sessions = glob.glob("audio_sessions/*")
if audio_sessions:
    latest_audio_session = max(audio_sessions, key=os.path.getctime)
    audio_session_id = os.path.basename(latest_audio_session)
    print(f"\n🎵 Latest audio session: {audio_session_id}")
    
    # Check what audio files exist
    audio_files = glob.glob(f"audio_sessions/{audio_session_id}/slide_*.wav")
    for audio_file in audio_files:
        slide_num = os.path.basename(audio_file).replace("slide_", "").replace(".wav", "")
        audio_url = f"{base_url}/api/audio-segment/{audio_session_id}/{slide_num}"
        audio_response = requests.head(audio_url)
        print(f"  Slide {slide_num} audio: {audio_response.status_code}")

print("\n✅ If you see 200 status codes, the endpoints are working!")
print("📝 To fix the frontend, generate new feedback after these backend fixes.")