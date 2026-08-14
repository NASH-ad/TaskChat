"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

type Msg = { role: "user" | "assistant"; content: string };

export function Chat() {
    const router = useRouter();
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const { supported, listening, transcript, start, stop } = useSpeechRecognition();

    // The only useEffect affected to the voice: write the transcript in the field
    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);

    async function send() {
        const text = input.trim();
        if (!text || loading) return;

        const next: Msg[] = [...messages, { role: "user", content: text }];
        setMessages(next);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: next }),
            });
            const data = await res.json();
            setMessages([...next, { role: "assistant", content: data.reply }]);
            if (data.didMutate) router.refresh();
        } catch (e) {
            console.error("Erreur d'envoi:", e);
            setMessages([
                ...next,
                { role: "assistant", content: "Désolé, une erreur est survenue." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-6 flex flex-col gap-3 border-t pt-4">
            <div className="space-y-2">
                {messages.map((m, i) => (
                    <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                        <span
                            className={
                                "inline-block rounded-lg px-3 py-2 text-sm " +
                                (m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100")
                            }
                        >
                            {m.content}
                        </span>
                    </div>
                ))}
                {loading && <p className="text-sm text-gray-400">L'assistant réfléchit…</p>}
            </div>

            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="écris ou dicte une tâche…"
                    className="flex-1 rounded border px-3 py-2"
                />
                {supported && (
                    <button
                        type="button"
                        onClick={listening ? stop : start}
                        className={
                            "rounded px-3 text-sm " +
                            (listening ? "bg-red-600 text-white" : "border border-gray-300")
                        }
                        title="Dicter une tâche"
                    >
                        {listening ? "● Écoute…" : "Parler"}
                    </button>
                )}
            <button
                onClick={send}
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                Envoyer
            </button>
            </div>
        </div>
    );
}