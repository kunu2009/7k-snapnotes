import { GoogleGenAI } from "https://aistudiocdn.com/google-genai@^0.19.1";

// FIX: Per coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("Gemini API key is not configured. AI features will be disabled.");
}

export const isGeminiConfigured = (): boolean => !!ai;

export const summarizeText = async (text: string): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini API is not configured.");
    }
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Summarize the following notes into a few key bullet points. Be concise and clear. \n\n---\n\n${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing text with Gemini:", error);
        return "Error: Could not generate summary.";
    }
};
