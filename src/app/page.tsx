import { db } from "@/db";
import { tasks } from "@/db/schema";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { Chat } from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await db.select().from(tasks);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">TaskChat</h1>
      <AddTaskForm />
      <ul className="space-y-2">
        {rows.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </ul>
      <Chat />
    </main>
  );
}
