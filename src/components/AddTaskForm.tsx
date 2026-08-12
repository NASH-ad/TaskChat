"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddTaskForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("normale");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        if (!title.trim()) return;
        setSaving(true);
        try {
            await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, priority })
            });
            setTitle("");
            router.refresh();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New task..."
                className="flex-1 rounded border px-3 py-2"
            />

            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded border px-2"
            >
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
            </select>

            <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {saving ? "..." : "Add"}
            </button>
        </form>
    );
}