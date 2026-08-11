import { db } from "@/db";
import { tasks } from "@/db/schema";

export default async function Home() {
  const rows = await db.select().from(tasks);   // lecture directe, côté serveur

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">TaskChat</h1>
      <p className="mb-4 text-gray-600">{rows.length} tâche(s)</p>
      <ul className="space-y-2">
        {rows.map((t) => (
          <li key={t.id} className="rounded border p-3">
            <span className={t.done ? "line-through text-gray-400" : ""}>
              {t.title}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {t.priority}
              {t.duedate ? ` · ${t.duedate}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
