#!/usr/bin/env python3
"""
Debug the current feedback to see what's actually being generated
"""

def check_recent_feedback():
    """Check what's in the most recent feedback generation"""
    print("🔍 Checking recent feedback generation...")
    
    # Check the most recent server logs for feedback generation
    try:
        with open('server_debug.log', 'r') as f:
            lines = f.readlines()
        
        # Find the most recent feedback generation
        feedback_start = None
        for i, line in enumerate(lines):
            if "📝 Generating slide-specific feedback..." in line:
                feedback_start = i
        
        if feedback_start is None:
            print("❌ No recent feedback generation found in logs")
            return
        
        print(f"📝 Found feedback generation starting at line {feedback_start}")
        
        # Extract the relevant log section
        relevant_logs = lines[feedback_start:feedback_start+100]
        
        print("\n📋 Recent feedback generation logs:")
        print("=" * 50)
        
        for line in relevant_logs:
            line = line.strip()
            if any(emoji in line for emoji in ["📝", "🎙️", "🔊", "📊", "🎵", "💾", "❌", "⚠️", "✅"]):
                print(line)
        
        print("=" * 50)
        
        # Look for specific issues
        audio_issues = []
        for line in relevant_logs:
            if "❌" in line and "audio" in line.lower():
                audio_issues.append(line.strip())
            elif "⚠️" in line and ("audio" in line.lower() or "segment" in line.lower()):
                audio_issues.append(line.strip())
        
        if audio_issues:
            print(f"\n🚨 Found {len(audio_issues)} audio issues:")
            for issue in audio_issues:
                print(f"  - {issue}")
        else:
            print("\n✅ No obvious audio issues found in logs")
            
    except FileNotFoundError:
        print("❌ Server log file not found")
    except Exception as e:
        print(f"❌ Error reading logs: {e}")

def check_audio_sessions():
    """Check what audio sessions exist"""
    print("\n📁 Checking audio sessions...")
    
    import os
    import json
    
    sessions_dir = "audio_sessions"
    if not os.path.exists(sessions_dir):
        print("❌ Audio sessions directory doesn't exist")
        return
    
    sessions = [d for d in os.listdir(sessions_dir) if os.path.isdir(os.path.join(sessions_dir, d))]
    print(f"📊 Found {len(sessions)} audio sessions")
    
    for session in sessions:
        session_path = os.path.join(sessions_dir, session)
        print(f"\n📁 Session: {session}")
        
        # Check metadata
        metadata_path = os.path.join(session_path, "metadata.json")
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                print(f"  📅 Created: {metadata.get('created_at', 'unknown')}")
                print(f"  📊 Slide count: {metadata.get('slide_count', 'unknown')}")
                print(f"  🎵 Slides: {metadata.get('slides', [])}")
            except Exception as e:
                print(f"  ❌ Error reading metadata: {e}")
        
        # Check audio files
        audio_files = [f for f in os.listdir(session_path) if f.endswith('.wav')]
        print(f"  🎵 Audio files: {len(audio_files)}")
        for audio_file in audio_files[:5]:  # Show first 5
            file_path = os.path.join(session_path, audio_file)
            size = os.path.getsize(file_path)
            print(f"    - {audio_file}: {size} bytes")

def check_transcription_vs_audio():
    """Check if there's a mismatch between transcription and actual audio"""
    print("\n🔍 Checking transcription vs audio mismatch...")
    
    # This would require checking the actual feedback data structure
    # For now, let's check if we can find any signs of the issue
    
    print("💡 Key questions to investigate:")
    print("  1. Is the recording file actually being received by the backend?")
    print("  2. Is the audio splitting working but transcription failing?")
    print("  3. Are the saved audio files the right content?")
    print("  4. Is there a session ID mismatch between images and audio?")

if __name__ == "__main__":
    print("🔍 Current Feedback Debug")
    print("=" * 50)
    
    check_recent_feedback()
    check_audio_sessions()
    check_transcription_vs_audio()
    
    print("\n📝 Next steps to debug:")
    print("  1. Check if frontend is sending the right recording")
    print("  2. Verify backend receives the actual audio data")
    print("  3. Check if saved audio files contain the right content")