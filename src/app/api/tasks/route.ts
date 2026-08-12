import { db } from "@/db";
import { tasks } from "@/db/schema"
import { newTaskSchema } from "@/lib/validation"

export async function GET() {
    const rows = await db.select().from(tasks)
    return Response.json(rows);
};

export async function POST(request: Request) {
    const body = await request.json();
    const result = newTaskSchema.safeParse(body);  // Validate the content type of the request during runtime

    if (!result.success) {
        return Response.json({error: result.error.issues}, { status: 400});
    }

    const [created] = await db
    .insert(tasks)
    .values(result.data)
    .returning();

    return Response.json(created, { status: 201 });
};