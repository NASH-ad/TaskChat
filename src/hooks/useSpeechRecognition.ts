import { useRef, useState, useEffect } from "react";

type SpeechResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((e: SpeechResultEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: unknown) => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
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

    useEffect(() => {
        setSupported(getCtor() !== null);
    }, []);

    function start() {
        const Ctor = getCtor();
        if (!Ctor || listening) return;

        const recognition = new Ctor();
        recognition.lang = "fr-FR";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (e) => {
            let text = "";
            for (let i = 0; i < e.results.length; i++)
                text += e.results[i][0].transcript;
            setTranscript(text);
        };
        recognition.onend = () => {
            setListening(false);
        };
        recognition.onerror = (ev) => {
            setListening(false);
        };

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