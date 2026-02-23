const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function getJarvisResponse(prompt: string, history: ChatMessage[] = []) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        return "I'm sorry, but my AI core is not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    ...history,
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                systemInstruction: {
                    parts: [{ text: "You are J.A.R.V.I.S., a highly intelligent and helpful AI study assistant. Your goal is to help students manage their studies, summarize chapters, explain complex topics, and motivate them. Keep your tone professional yet encouraging, similar to Iron Man's JARVIS. Be concise but thorough." }]
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return "I encountered an error while processing your request, sir/ma'am. Please check the console for details.";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("JARVIS Service Error:", error);
        return "I'm having trouble connecting to my central processing unit. Please ensure you have a stable internet connection.";
    }
}
