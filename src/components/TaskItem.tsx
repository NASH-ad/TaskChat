"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/db/schema";

export function TaskItem({ task }: { task: Task }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function toggle() {
        setBusy(true);
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: !task.done })
            });
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    async function remove() {
        setBusy(true);
        try {
            await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
            router.refresh();
        } finally {
            setBusy(false);
        }
    };

    return (
        <li className="flex items-center gap-3 rounded border p-3">
            <input type="checkbox" checked={task.done} onChange={toggle} disabled={busy} />
            <span className={task.done ? "flex-1 text-gray-400 line-through" : "flex-1"}>
                {task.title}
                <span className="ml-2 text-xs text-gray-500">
                    {task.priority}
                    {task.duedate ? ` · ${task.duedate}` : ""}
                </span>
            </span>
            <button onClick={remove} disabled={busy} className="text-sm text-red-600">
                Delete
            </button>
        </li>
    );
}