class TTSService {
  constructor() {
    this.currentAudio = null;
    this.apiKey = process.env.REACT_APP_ELEVENLABS_API_KEY || 'your-api-key-here';
    this.voiceId = process.env.REACT_APP_ELEVENLABS_VOICE_ID || 'b49kxxWbYzfNv7AZOp3g';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async speak(text) {
    try {
      // Stop any currently playing audio
      this.stop();

      // Clean text for TTS (remove markdown and math notation)
      const cleanText = this.cleanTextForTTS(text);
      
      if (!cleanText.trim()) {
        return;
      }

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      this.currentAudio = new Audio(audioUrl);
      
      // Clean up blob URL when audio ends
      this.currentAudio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
      });

      // Auto-play the audio
      await this.currentAudio.play();
      
    } catch (error) {
      console.error('TTS Error:', error);
      // Fail silently - don't disrupt user experience
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  cleanTextForTTS(text) {
    return text
      // Remove LaTeX math expressions
      .replace(/\$\$[\s\S]*?\$\$/g, ' math expression ')
      .replace(/\$[^$]*?\$/g, ' math ')
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s+(.*)/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' code block ')
      // Clean up multiple spaces and newlines
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export default new TTSService();