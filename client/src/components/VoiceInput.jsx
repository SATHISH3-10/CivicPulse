import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Mic, MicOff, Volume2, Sparkles, Check } from 'lucide-react';

export default function VoiceInput({ onTranscription, onCategoryDetect }) {
  const { lang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

    recognition.onresult = (event) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);

      if (onTranscription) {
        onTranscription(current);
      }

      // Simple keyword-based category auto-detection in both English & Tamil
      const lower = current.toLowerCase();
      if (onCategoryDetect) {
        if (lower.includes('pothole') || lower.includes('road') || lower.includes('சாலை') || lower.includes('குழி') || lower.includes('தார்')) {
          onCategoryDetect('Roads');
        } else if (lower.includes('light') || lower.includes('lamp') || lower.includes('விளக்கு') || lower.includes('மின்சாரம்') || lower.includes('தெருவிளக்கு')) {
          onCategoryDetect('Streetlights');
        } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('குப்பை') || lower.includes('கழிவு') || lower.includes('தூய்மை')) {
          onCategoryDetect('Garbage');
        } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('குடிநீர்') || lower.includes('தண்ணீர்') || lower.includes('குழாய்')) {
          onCategoryDetect('Water');
        } else if (lower.includes('drain') || lower.includes('sewage') || lower.includes('சாக்கடை') || lower.includes('கழிவுநீர்') || lower.includes('மழைநீர்')) {
          onCategoryDetect('Drainage');
        } else if (lower.includes('traffic') || lower.includes('signal') || lower.includes('போக்குவரத்து')) {
          onCategoryDetect('Traffic');
        } else if (lower.includes('danger') || lower.includes('safety') || lower.includes('ஆபத்து') || lower.includes('பாதுகாப்பு')) {
          onCategoryDetect('Public Safety');
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang, onTranscription, onCategoryDetect]);

  function toggleListening() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }

  if (!supported) {
    return null;
  }

  return (
    <div
      style={{
        background: isListening ? 'var(--primary-50)' : 'var(--gray-50)',
        border: `2px dashed ${isListening ? 'var(--primary-400)' : 'var(--gray-300)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        marginBottom: 20,
        transition: 'all 0.3s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={toggleListening}
            className={`btn ${isListening ? 'btn-danger' : 'btn-teal'} btn-sm`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{isListening ? t('listening') : t('voiceInput')}</span>
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            🎙️ {lang === 'ta' ? 'தமிழ் குரல் உள்ளீடு (Tamil)' : 'English Voice Input (en-IN)'}
          </span>
        </div>

        {isListening && (
          <span className="badge badge-red" style={{ fontSize: '0.75rem', animation: 'pulse 1s infinite' }}>
            ● REC LIVE
          </span>
        )}
      </div>

      {/* Real-time transcribed text preview */}
      {isListening && (
        <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--primary-800)', fontStyle: 'italic' }}>
          "{transcript || 'Listening to your voice...'}"
        </div>
      )}

      {!isListening && (
        <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--gray-400)' }}>
          💡 {t('voicePrompt')}
        </div>
      )}
    </div>
  );
}
