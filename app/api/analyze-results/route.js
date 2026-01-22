import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request) {
  try {
    const { topic, usersResults } = await request.json();

    if (!topic || !usersResults) {
      return NextResponse.json(
        { error: "Topic and usersResults are required" },
        { status: 400 }
      );
    }

    const jsonString = JSON.stringify(usersResults, null, 2);

    const prompt = `
    You are a strict JSON generator.
    
    Analyze the quiz taker's answers provided below.
    Topic: "${topic}"
    
    INPUT ANSWERS (JSON):
    ${jsonString}
    
    OUTPUT RULES (STRICT):
    - Respond with VALID JSON ONLY.
    - Do NOT include markdown, comments, labels, or extra text.
    - Do NOT wrap the response in code blocks.
    - Output MUST be a single JSON object.
    - Do NOT add or remove any keys.
    - Use plain English only.
    
    REQUIRED JSON FORMAT:
    {
      "analysis": {
        "solidKnowledge": [string, string, string],
        "areasToImprove": [string, string, string],
        "actionPlan": [string, string, string]
      }
    }
    
    CONTENT RULES:
    - Each array MUST contain exactly 3 items.
    - Each item MUST be 3 to 5 words long.
    - Base the analysis strictly on the provided answers.
    - Avoid repeating the same idea across sections.
    - Do NOT mention scores, percentages, or grades.
    
    IMPORTANT:
    If you cannot follow all rules, return this exact JSON:
    {
      "analysis": {
        "solidKnowledge": [],
        "areasToImprove": [],
        "actionPlan": []
      }
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      extraHeaders: {
        "HTTP-Referer": "https://magenta-raindrop-e04d1a.netlify.app/",
        "X-Title": "scholarsquiz",
      },
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Sanitize and extract JSON
    let analysisText = responseText || "";

    // Find first '{' and last '}' to handle nested objects correctly
    const firstOpen = analysisText.indexOf("{");
    const lastClose = analysisText.lastIndexOf("}");

    if (firstOpen === -1 || lastClose === -1 || lastClose <= firstOpen) {
      throw new Error("No valid JSON found in analysis response");
    }

    const jsonChunk = analysisText.substring(firstOpen, lastClose + 1);
    const analysis = JSON.parse(jsonChunk);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing results:", error);
    return NextResponse.json(
      {
        analysis: {
          solidKnowledge: [],
          areasToImprove: [],
          actionPlan: [],
        },
      },
      { status: 500 }
    );
  }
}
