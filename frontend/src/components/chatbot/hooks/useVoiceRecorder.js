// // src/components/chatbot/hooks/useVoiceRecorder.js
// import { useEffect, useRef, useState } from "react";

// export default function useVoiceRecorder(inputRef) {
//   const [listening, setListening] = useState(false);

//   // Stable recognizer reference (DO NOT recreate)
//   const recRef = useRef(null);

//   // Auto-send callback stored here
//   const autoSendRef = useRef(null);

//   useEffect(() => {
//     const Speech =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!Speech) return;

//     recRef.current = new Speech();
//     recRef.current.continuous = false;
//     recRef.current.interimResults = false;
//     recRef.current.lang = "en-US";

//     recRef.current.onresult = (e) => {
//       const transcript = e.results[0][0].transcript.trim();

//       // Insert voice text directly into actual input box
//       if (inputRef.current) {
//         inputRef.current.value =
//           (inputRef.current.value + " " + transcript).trim();
//       }
//     };

//     recRef.current.onend = () => {
//       setListening(false);

//       // Auto-send after speaking
//       if (autoSendRef.current) {
//         const finalText = inputRef.current?.value.trim();
//         if (finalText) autoSendRef.current(finalText);
//       }
//     };
//   }, []);

//   const startListening = () => {
//     if (!recRef.current) return;
//     setListening(true);

//     try {
//       recRef.current.start();
//     } catch (e) {
//       console.warn("Speech already started");
//     }
//   };

//   const stopListening = () => {
//     if (!recRef.current) return;

//     try {
//       recRef.current.stop();
//     } catch (_) {}

//     setListening(false);
//   };

//   return {
//     listening,
//     startListening,
//     stopListening,

//     // Parent can call: registerAutoSend(sendMessage)
//     registerAutoSend: (fn) => (autoSendRef.current = fn),
//   };
// }


// src/components/chatbot/hooks/useVoiceRecorder.js
import { useEffect, useRef, useState } from "react";

export default function useVoiceRecorder(inputRef) {
  const [listening, setListening] = useState(false);

  const recRef = useRef(null);
  const autoSendRef = useRef(null);
  const silenceTimerRef = useRef(null); // 🟢 silence timer

  useEffect(() => {
    const Speech =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Speech) return;

    recRef.current = new Speech();
    recRef.current.continuous = false;
    recRef.current.interimResults = false;
    recRef.current.lang = "en-US";

    recRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();

      // Put voice text into input box
      if (inputRef.current) {
        inputRef.current.value =
          (inputRef.current.value + " " + transcript).trim();
      }

      // 🟢 reset silence timer when speech detected
      resetSilenceTimer();
    };

    recRef.current.onend = () => {
      setListening(false);

      // Auto-send message when voice ends
      if (autoSendRef.current) {
        const finalText = inputRef.current?.value.trim();
        if (finalText) autoSendRef.current(finalText);
      }

      clearSilenceTimer();
    };
  }, []);

  /* -----------------------------------------------------------
     Silence Timeout — stop mic after 5 seconds of no speech
  ----------------------------------------------------------- */
  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      stopListening(); // auto-stop
    }, 5000); // 5 seconds
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startListening = () => {
    if (!recRef.current) return;

    setListening(true);

    try {
      recRef.current.start();
    } catch (e) {
      /* recognition already started */
    }

    resetSilenceTimer();
  };

  const stopListening = () => {
    if (!recRef.current) return;

    try {
      recRef.current.stop();
    } catch (_) {}

    setListening(false);
    clearSilenceTimer();
  };

  return {
    listening,
    startListening,
    stopListening,

    // Parent can auto-send with: registerAutoSend(sendMessage)
    registerAutoSend: (fn) => (autoSendRef.current = fn),
  };
}
