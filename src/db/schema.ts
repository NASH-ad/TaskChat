import { pgTable, uuid, text, date, boolean, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    duedate: date("due_date"),
    priority: text("priority").notNull().default("normale"),
    note: text("note"),
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true}).notNull().defaultNow()
});

// Drizzle finds out the TS types basing on the table above
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert