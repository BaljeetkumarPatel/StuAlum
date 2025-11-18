// src/components/chatbot/hooks/useVoiceRecorder.js
import { useState } from "react";

export default function useVoiceRecorder({ onText }) {
  const [listening, setListening] = useState(false);

  const Speech =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const rec = Speech ? new Speech() : null;

  const startListening = () => {
    if (!rec) return;
    setListening(true);
    rec.start();
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      onText(txt);
    };
    rec.onend = () => setListening(false);
  };

  const stopListening = () => {
    try {
      rec?.stop();
    } catch {}
    setListening(false);
  };

  return { listening, startListening, stopListening };
}
