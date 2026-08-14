import { useEffect, useRef, useState } from "react";

// --- Types minimaux pour l'API Web Speech (absente des types TS standard) ---
type SpeechResultEvent = {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
};
type Recognition = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((e: SpeechResultEvent) => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

// Récupère le constructeur, quel que soit le préfixe navigateur
function getRecognitionCtor(): RecognitionCtor | null {
    const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
    const [supported, setSupported] = useState(false);
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<Recognition | null>(null);

  // Au montage : vérifie si le navigateur supporte la reconnaissance vocale
    useEffect(() => {
        setSupported(getRecognitionCtor() !== null);
    }, []);

    function start() {
        const Ctor = getRecognitionCtor();
        if (!Ctor || listening) return;

        const recognition = new Ctor();
        recognition.lang = "fr-FR";          // reconnaissance en français
        recognition.continuous = false;      // s'arrête après une phrase
        recognition.interimResults = true;   // renvoie le texte au fil de la parole

        recognition.onresult = (e) => {
            let text = "";
            for (let i = 0; i < e.results.length; i++) {
                text += e.results[i][0].transcript; // [0] = meilleure hypothèse
            }
            setTranscript(text);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);

        recognitionRef.current = recognition;
        setTranscript("");
        setListening(true);
        recognition.start();
    }

    function stop() {
        recognitionRef.current?.stop();
        setListening(false);
    }

    return { supported, listening, transcript, start, stop };
}