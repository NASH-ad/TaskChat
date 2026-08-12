// Check the types during the runtime

import { z } from "zod";

// Define what a valid task should look like
export const newTaskSchema = z.object({
    title: z.string().min(1, "Title mandatory"),
    dueDate: z.string().nullable().optional(),
    priority: z.enum(["haute", "normale", "basse"]).default("normale"),
    note: z.string().optional()
});

export type NewTaskInput = z.infer<typeof newTaskSchema>;