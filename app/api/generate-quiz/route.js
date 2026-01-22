import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request) {
  try {
    const { topic, numQuestions } = await request.json();

    if (!topic || !numQuestions) {
      return NextResponse.json(
        { error: "Topic and numQuestions are required" },
        { status: 400 }
      );
    }

    const prompt = `
      You are a JSON generator.
      
      Generate exactly ${numQuestions} quiz questions about "${topic}".
      
      OUTPUT RULES (STRICT):
      - Respond with VALID JSON ONLY.
      - Do NOT include markdown, comments, explanations outside JSON, or extra text.
      - Do NOT wrap the response in code blocks.
      - Output MUST be a JSON array.
      - Each object MUST contain ONLY the keys defined below.
      - Use plain English only.
      - Do NOT add any extra keys.
      
      SCHEMA (FOLLOW EXACTLY):
      [
        {
          "id": number,
          "question": string,
          "options": [string, string, string, string],
          "correctAnswer": number,
          "explanation": string
        }
      ]
      
      FIELD RULES:
      - "id": unique integer starting from 1.
      - "question": clear, concise quiz question.
      - "options": exactly 4 answer choices.
      - "correctAnswer": index of the correct option (0-based).
      - "explanation": short explanation in plain English.
      
      IMPORTANT:
      - Ensure the correctAnswer index matches the options array.
      - Do NOT include anything outside the JSON array.
      `;

    const completion = await openai.chat.completions.create({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      // OpenRouter specific headers if needed, though usually just header is needed
      extraHeaders: {
        "HTTP-Referer": "https://magenta-raindrop-e04d1a.netlify.app/",
        "X-Title": "scholarsquiz",
      },
    });
    console.log(completion);

    const responseText = completion.choices[0]?.message?.content || "";

    console.log("OpenRouter response:", responseText.substring(0, 500)); // Log first 500 chars for debugging

    // Sanitize JSON response
    function sanitizeJSON(text) {
      if (!text) throw new Error("Empty response");

      // Find first '[' and last ']' to handle nested arrays correctly
      const firstOpen = text.indexOf("[");
      const lastClose = text.lastIndexOf("]");

      if (firstOpen === -1 || lastClose === -1 || lastClose <= firstOpen) {
        console.error("No JSON array bounds found");
        throw new Error("No JSON found");
      }

      const jsonString = text.substring(firstOpen, lastClose + 1);

      try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
          throw new Error("Response is not an array");
        }
        return parsed;
      } catch (err) {
        console.error("JSON parse failed:", err.message);
        console.error("Attempted to parse:", jsonString.substring(0, 500));
        throw err;
      }
    }

    const quizData = sanitizeJSON(responseText);

    return NextResponse.json({ quizData });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz. Please try again." },
      { status: 500 }
    );
  }
}
