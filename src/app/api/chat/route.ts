import { GoogleGenAI, Content } from "@google/genai";
import { functionDeclarations } from "@/lib/tools";
import { executeTool } from "@/lib/execute-tools";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type ChatMessage = { role: "user" | "assistant", content: "string"  };

export async function POST(request: Request) {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    const today = new Date().toISOString().slice(0, 10);
    const systemInstruction =
        `You are the assistant of TaskChat, a to-do app. Today is ${today}.\n` +
        `Use the tools to create, list, complete, update or delete tasks.\n` +
        `To complete, update or delete a task that the user refers to by its text ` +
        `(e.g. "check off the report", "delete Hello"), pass a snippet of the title in the ` +
        `tool's 'query' parameter — do not try to guess an id.\n` +
        `If a tool returns an error (task not found, or several matches), explain it to the ` +
        `user and ask for clarification instead of retrying at random.\n` +
        `Convert any relative date (tomorrow, next Monday...) into an absolute AAAA-MM-JJ date ` +
        `before calling a tool.\n` +
        `After acting, briefly confirm what was done. Reply in French.`;
    
    const contents: Content[] = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user", //The correct role for gemini ai is 'model' not 'assistant' like for claude
        parts: [{ text: m.content }],
    }));

    let didMutate = false;
    let steps = 0;
    let finalText = "";

    while (steps++ < 6) {
        const response = await  ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations }],
            },
        })

        // Journal : voir CE que Gemini renvoie vraiment (à lire dans ton terminal npm run dev)
        console.log("Gemini tour", steps, {
            finishReason: response.candidates?.[0]?.finishReason,
            text: response.text ? response.text : "",
            functionCalls: response.functionCalls,
        });

        // Gemini peut parler ET appeler un outil : on garde tout texte rencontré
        if (response.text) finalText = response.text;

        const calls = response.functionCalls ?? [];

        if (calls.length > 0) {
            // We conserve the model this turn, it may contain some tool calls
            const modelContent = response.candidates?.[0]?.content;
            if (modelContent)
                contents.push(modelContent);

            // Then we execute each tool call
            const responseParts = [];
            for (const call of calls) {
                if (!call.name) continue;
                if (call.name !== "list_tasks") didMutate = true; // specify that reading != modify

                let result;
                try {
                    result = await executeTool(call.name, call.args);
                } catch (e) {
                    result = { error: e };
                }

                responseParts.push({
                    functionResponse: {
                        name: call.name,
                        id: call.id,
                        response: { result },
                    }
                });
            }

            // We resend the results to the model and loop again
            contents.push({
                role: "user",
                parts: responseParts,
            });
        } else {
            break;
        }

        // None tool calls means that this is the final reponse of the model
        
    }

    if (steps === 6) {
        return Response.json({ reply: "The model didn't accomplish the demand in the limit of loops. Try again.", didMutate });
    } else {
        const reply = finalText || (didMutate ? "C'est fait." : "Je n'ai rien à répondre.");
        return Response.json({ reply: reply, didMutate });
    }
}