#!/usr/bin/env python3
"""
Test audio segment saving functionality
"""
import tempfile
import os
import uuid
from pydub import AudioSegment
from feedback_service import split_audio_by_timestamps, save_audio_segments, get_audio_segment_path

def test_audio_saving():
    """Test the complete audio splitting and saving pipeline"""
    print("💾 Testing audio segment saving...")
    
    # Create test audio
    print("📀 Creating test audio...")
    duration_ms = 8000  # 8 seconds
    audio = AudioSegment.silent(duration=duration_ms)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        audio.export(temp_file.name, format="wav")
        audio_file = temp_file.name
        print(f"✅ Test audio created: {audio_file}")
    
    # Create test timestamps
    test_timestamps = [
        {"slideNumber": 1, "timestamp": 0.0},
        {"slideNumber": 2, "timestamp": 2.0},
        {"slideNumber": 3, "timestamp": 4.0},
        {"slideNumber": 4, "timestamp": 6.0}
    ]
    
    print(f"📊 Test timestamps: {test_timestamps}")
    
    try:
        # Step 1: Split audio
        print("\n🔧 Step 1: Splitting audio...")
        segments = split_audio_by_timestamps(audio_file, test_timestamps)
        print(f"✅ Got {len(segments)} segments")
        
        # Step 2: Save segments
        print("\n💾 Step 2: Saving segments...")
        session_id = str(uuid.uuid4())
        print(f"📁 Using session ID: {session_id}")
        
        saved_segments = save_audio_segments(session_id, segments)
        print(f"✅ save_audio_segments returned: {saved_segments}")
        
        # Step 3: Verify saved files
        print("\n🔍 Step 3: Verifying saved files...")
        
        for slide_num, saved_path in saved_segments.items():
            print(f"  Slide {slide_num}:")
            print(f"    - Saved path: {saved_path}")
            print(f"    - File exists: {os.path.exists(saved_path)}")
            
            if os.path.exists(saved_path):
                size = os.path.getsize(saved_path)
                print(f"    - File size: {size} bytes")
                
                # Test loading with pydub
                try:
                    test_audio = AudioSegment.from_file(saved_path)
                    duration = len(test_audio) / 1000
                    print(f"    - Audio duration: {duration:.1f}s")
                except Exception as e:
                    print(f"    - ❌ Audio file invalid: {e}")
            
            # Test the get_audio_segment_path function
            retrieved_path = get_audio_segment_path(session_id, slide_num)
            print(f"    - Retrieved path: {retrieved_path}")
            print(f"    - Paths match: {saved_path == retrieved_path}")
        
        # Step 4: Test API endpoint paths
        print("\n🌐 Step 4: Testing API endpoint paths...")
        for slide_num in saved_segments.keys():
            api_url = f"/api/audio-segment/{session_id}/{slide_num}"
            print(f"  Slide {slide_num} API URL: {api_url}")
        
        # Cleanup temp files
        os.unlink(audio_file)
        for segment in segments:
            if os.path.exists(segment['audio_path']):
                os.unlink(segment['audio_path'])
        
        if len(saved_segments) == len(test_timestamps):
            print(f"\n🎉 SUCCESS: All {len(saved_segments)} segments saved correctly!")
            return True, session_id
        else:
            print(f"\n❌ FAILURE: Expected {len(test_timestamps)} segments, got {len(saved_segments)}")
            return False, session_id
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: Audio saving failed: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup
        if os.path.exists(audio_file):
            os.unlink(audio_file)
        
        return False, None

if __name__ == "__main__":
    print("💾 Audio Saving Test")
    print("=" * 50)
    
    success, session_id = test_audio_saving()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 RESULT: Audio saving is working correctly!")
        print(f"📁 Test session: {session_id}")
        print("📝 Next step: Test new feedback generation")
    else:
        print("❌ RESULT: Audio saving has issues")
        print("🔧 Need to debug audio saving further")