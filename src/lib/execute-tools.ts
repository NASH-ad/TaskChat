import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, eq, ilike, desc } from "drizzle-orm";
import { z } from "zod";

// Schema for validating tools
const addTasksInput = z.object({
    tasks: z.array(
        z.object({
            title: z.string().min(1),
            due_date: z.string().nullable().optional(),
            priority: z.enum(["haute", "normale", "basse"]).default("normale"),
            note: z.string().optional(),
        })
    ),
});

const listTasksInput = z.object({
    date: z.string().optional(),
    status: z.enum(["open", "done", "all"]).default("open"),
});

const targetInput = z.object({
    id: z.uuid().optional(),
    query: z.string().optional(),
});

const updateInput = targetInput.extend({
    title: z.string().min(1).optional(),
    due_date: z.string().nullable().optional(),
    priority: z.enum(["haute", "normale", "basse"]).optional(),
    note: z.string().optional(),
});

// Find a task by its id or title
// return { task } if found and { error } if not
async function findOne(id?: string, query?: string) {
    if (id) {
        const [ t ] = await db.select().from(tasks).where(eq(tasks.id, id));
        return t ? { task: t } : { error: "None task with this id" };
    }
    if (query) {
        const rows = await db
            .select()
            .from(tasks)
            .where(ilike(tasks.title, `%${query}%`))
            .orderBy(desc(tasks.createdAt));
        if (rows.length === 0)
            return { error: `None of the tasks contains a title with << ${query} >>.` };
        if (rows.length > 1) {
            return { 
                error: `Multiple tasks have a title containing << ${query} >>:
                    ${rows.map((r) => r.title).join(", ")}. Need more precision.`
                };
        }
        return { task: rows[0]};
    }
    return { error: "Specify an id or a part of title (query)." };
}

// Receive a tool name and the raw input and return a result
export async function executeTool(name: string, rawInput: unknown) {
    switch (name) {
        case "add_tasks": {
            const { tasks: toAdd } = addTasksInput.parse(rawInput);
            const created = await db
                .insert(tasks)
                .values(
                    toAdd.map((t) => ({
                        title: t.title,
                        duedate: t.due_date,
                        priority: t.priority,
                        note: t.note,
                    }))
                )
                .returning();
            return { added: created.length, tasks: created };
        }

        case "list_tasks": {
            const input = listTasksInput.parse(rawInput);
            const conditions = [];
            
            if (input.date) 
                conditions.push(eq(tasks.duedate, input.date));
            if (input.status === "open")
                conditions.push(eq(tasks.done, false));
            if (input.status === "done")
                conditions.push(eq(tasks.done, true));

            const rows = conditions.length
                ? await db.select().from(tasks).where(and(...conditions))
                : await db.select().from(tasks);
            return { count: rows.length, tasks: rows };
        }

        case "complete_task": {
            const { id, query } = targetInput.parse(rawInput);
            const found = await findOne(id, query);
            if ("error" in found) return found;
            try {
                const [updated] = await db
                .update(tasks)
                .set({ done: true, doneAt: new Date(), updatedAt: new Date() })
                .where(eq(tasks.id, found.task.id))
                .returning();
                return { ok: true, task: updated };
            } catch (e) {
                console.error("ERREUR complete_task:", e);   // <- le vrai message dans le terminal
                return { error: String(e) };
            }
        }

        case "delete_task": {
            const { id, query } = targetInput.parse(rawInput);
            const found = await findOne(id, query);
            if ("error" in found)
                return found;
            await db.delete(tasks).where(eq(tasks.id, found.task.id));
            return {
                ok: true,
                deleted: found.task.title,
            };
        }

        case "update_task": {
            const { id, query, title, due_date, priority, note } = updateInput.parse(rawInput);
            const found = await findOne(id, query);

            if ("error" in found)
                return found;

            const [updated] = await db
                .update(tasks)
                .set({
                    ...(title !== undefined ? { title } : {}),
                    ...(due_date !== undefined ? { duedate: due_date } : {}),
                    ...(priority !== undefined ? { priority } : {}),
                    ...(note !== undefined ? { note } : {}),
                    updatedAt: new Date(),
                })
                .where(eq(tasks.id, found.task.id))
                .returning();

            return { ok: true, task: updated };
        }

        default:
            return { error: `Unknown tool : ${name}` };
    }
}
