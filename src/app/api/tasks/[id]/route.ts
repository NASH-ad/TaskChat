import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

// Mark and unmark a task 
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string} >}) {
    const { id } = await params;
    const body = await request.json();
    const done = Boolean(body.done);

    const [updated] = await db
        .update(tasks)
        .set({done, doneAt: done ? new Date() : null, updatedAt: new Date() })
        .where(eq(tasks.id, id))
        .returning();

    if (!updated) {
        return Response.json({ error: "Task not found" }, { status: 404 });
    }
    return Response.json(updated)
}

// Delete a task
export async function DELETE(request: Request, { params }: { params: Promise< { id: string } > } ) {
    const { id } = await params
    await db.delete(tasks).where(eq(tasks.id, id));
    return new Response(null, { status: 204 });
}
