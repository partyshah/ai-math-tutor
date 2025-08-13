#!/usr/bin/env python3
"""
Test audio splitting functionality with ffmpeg installed
"""
import tempfile
import os
from pydub import AudioSegment
from feedback_service import split_audio_by_timestamps

def create_test_audio():
    """Create a simple test audio file"""
    print("📀 Creating test audio file...")
    
    # Create a simple 10-second silent audio for testing
    duration_ms = 10000  # 10 seconds
    audio = AudioSegment.silent(duration=duration_ms)
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        audio.export(temp_file.name, format="wav")
        print(f"✅ Test audio created: {temp_file.name}")
        print(f"📏 Duration: {len(audio)/1000:.1f} seconds")
        return temp_file.name

def test_audio_splitting():
    """Test the audio splitting function"""
    print("\n🔧 Testing audio splitting...")
    
    # Create test audio
    audio_file = create_test_audio()
    
    # Create test timestamps (4 slides over 10 seconds)
    test_timestamps = [
        {"slideNumber": 1, "timestamp": 0.0},
        {"slideNumber": 2, "timestamp": 2.5},
        {"slideNumber": 3, "timestamp": 5.0},
        {"slideNumber": 4, "timestamp": 7.5}
    ]
    
    print(f"📊 Test timestamps: {test_timestamps}")
    
    try:
        # Test the splitting function
        segments = split_audio_by_timestamps(audio_file, test_timestamps)
        
        print(f"\n✅ Audio splitting completed!")
        print(f"📊 Number of segments returned: {len(segments)}")
        
        for i, segment in enumerate(segments):
            print(f"  Segment {i+1}:")
            print(f"    - Slide: {segment['slideNumber']}")
            print(f"    - Start: {segment['start_time']:.1f}s")
            print(f"    - End: {segment.get('end_time', 'EOF')}")
            print(f"    - File: {segment['audio_path']}")
            print(f"    - File exists: {os.path.exists(segment['audio_path'])}")
            
            if os.path.exists(segment['audio_path']):
                # Check file size
                size = os.path.getsize(segment['audio_path'])
                print(f"    - File size: {size} bytes")
                
                # Try to load with pydub to verify it's valid
                try:
                    test_audio = AudioSegment.from_file(segment['audio_path'])
                    duration = len(test_audio) / 1000
                    print(f"    - Audio duration: {duration:.1f}s")
                except Exception as e:
                    print(f"    - ❌ Audio file invalid: {e}")
        
        # Cleanup test files
        os.unlink(audio_file)
        for segment in segments:
            if os.path.exists(segment['audio_path']):
                os.unlink(segment['audio_path'])
        
        if len(segments) > 1:
            print(f"\n🎉 SUCCESS: Audio splitting is working! Got {len(segments)} segments.")
            return True
        else:
            print(f"\n❌ FAILURE: Audio splitting still not working - only got {len(segments)} segment(s).")
            return False
            
    except Exception as e:
        print(f"\n❌ EXCEPTION: Audio splitting failed with error: {e}")
        import traceback
        traceback.print_exc()
        
        # Cleanup
        if os.path.exists(audio_file):
            os.unlink(audio_file)
        
        return False

def check_ffmpeg_availability():
    """Check if ffmpeg tools are available"""
    print("🔧 Checking ffmpeg availability...")
    
    import subprocess
    
    tools = ['ffmpeg', 'ffprobe']
    
    for tool in tools:
        try:
            result = subprocess.run([tool, '-version'], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=5)
            if result.returncode == 0:
                version_line = result.stdout.split('\n')[0]
                print(f"✅ {tool}: {version_line}")
            else:
                print(f"❌ {tool}: Not working properly")
        except FileNotFoundError:
            print(f"❌ {tool}: Not found")
        except Exception as e:
            print(f"❌ {tool}: Error - {e}")

if __name__ == "__main__":
    print("🎵 Audio Splitting Test")
    print("=" * 50)
    
    check_ffmpeg_availability()
    
    success = test_audio_splitting()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 RESULT: Audio processing is working correctly!")
        print("📝 Next step: Generate new feedback to create audio segments")
    else:
        print("❌ RESULT: Audio processing still has issues")
        print("🔧 Need to debug audio splitting further")