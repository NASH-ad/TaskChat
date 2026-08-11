import { db } from "@/db";
import { tasks } from "@/db/schema"

export async function GET() {
    const rows = await db.select().from(tasks)
    return Response.json(rows)
};
