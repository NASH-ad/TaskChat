import { FunctionDeclaration } from "@google/genai";

export const functionDeclarations: FunctionDeclaration[] = [
    {
        name: "add_tasks",
        description:
            "Create one or more tasks with due_date formatted like this YYYY-MM-DD." +
            "Leave due_date if the user didn't specify it.",
        parametersJsonSchema: {
            type: "object",
            properties: {
                tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            due_date: { type: "string", description: "YYYY-MM-DD" },
                            priority: { type: "string", enum: ["haute", "normale", "basse"] },
                            note: { type: "string" },
                        },
                        required: ["title"],
                    },
                },
            },
            required: ["tasks"],
        },
    },
    {
        name: "list_tasks",
        description:
            "List tasks. Optional filters : date (YYYY-MM-DD), status ('open'|'done'|'all').",
        parametersJsonSchema: {
            type: "object",
            properties: {
                date: { type: "string", description: "YYYY-MM-DD, optional" },
                status: { type: "string", enum: ["open", "done", "all"] },
            },
        },
    },
    {
        name: "complete_task",
        description:
            "Mark a task as done. Give either its exact id in 'id' field or an extract of its title in 'query' field " +
            "(ex: 'Hello'). Use 'query' when the user specify the task by a text representing the title",
        parametersJsonSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "exact id (uuid)" },
                query: { type: "string", description: "extract or abstraction of title" },
            },
        },
    },
    {
        name: "delete_task",
        description:
            "Delete a task. Give either the exact id in 'id' field or the extract of the title in 'query'.",
        parametersJsonSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "exact id (uuid)" },
                query: { type: "string", description: "extract or abstraction of title" },
            },
        },
    },
    {
        name: "update_task",
        description:
            "Modify a task (title, priority, due_date, note). Identify it by id or query. " +
            "Just specify the fields that should be modified.",
        parametersJsonSchema: {
            type: "object",
            properties: {
                id: { type: "string", description: "exact id (uuid)" },
                query: { type: "string", description: "extract or abstraction of title" },
                title: { type: "string" },
                due_date: { type: "string", description: "YYYY-MM-DD" },
                priority: { type: "string", enum: ["haute", "normale", "basse"] },
                note: { type: "string" },
            },
        },
    },
];