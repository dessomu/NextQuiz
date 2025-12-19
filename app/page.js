"use client";
import React, { useState, useEffect, useContext } from "react";
import QuizCard from "./components/QuizCard/QuizCard";
import UseContext from "./context/UseContext";

export default function Home() {
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizData, setQuizData] = useState([]);

  const { topic, setTopic, quizStarted, setQuizStarted } =
    useContext(UseContext);

  useEffect(() => {
    const randomNumber = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
    setNumQuestions(randomNumber);
  }, [setTopic]);

  async function generateQuiz() {
    if (!topic) return alert("Please enter a topic first!");

    setLoading(true);
    setError("");

    const apiKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

    try {
      const prompt = `Generate ${numQuestions} quiz questions about ${topic} with 4 options and correct answer. Respond with valid JSON only. Do not include comments, explanations, or extra characters. The response should strictly be a JSON object or array. Format as JSON array:
      [{
        id: "unique number",
        question: "question text",
        options: ["a", "b", "c", "d"],
        correctAnswer: "answer index",
        explanation: "explanation text"
      }]`;

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`, // Replace with your OpenRouter API key
            "HTTP-Referer": "https://magenta-raindrop-e04d1a.netlify.app/", // Optional. Site URL for rankings on openrouter.ai.
            "X-Title": "scholarsquiz", // Optional. Site title for rankings on openrouter.ai.
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const markdownText =
        data.choices?.[0]?.message?.content || "No response received.";
      console.log("Markdown Text:", markdownText);

      function sanitizeJSON(responseText) {
        // Remove LaTeX boxed syntax
        responseText = responseText.replace(/\\boxed\{([\s\S]*?)\}/g, "$1");

        // Remove Markdown code block indicators (```json ... ```)
        responseText = responseText.replace(/```json|```/g, "").trim();

        // Try parsing the cleaned JSON
        try {
          return JSON.parse(responseText);
        } catch (error) {
          console.error("Invalid JSON data:", error);
          return null;
        }
      }

      // Usage:
      const cleanJson = sanitizeJSON(markdownText);

      setQuizData(cleanJson);
      setQuizStarted(true);
    } catch (error) {
      setError(`Error generating quiz, sorry for inconvenience`);
      console.log(error.message);
    }
    setLoading(false);
  }

  return (
    <>
      {quizStarted ? (
        <div className="quiz-shell">
          <QuizCard quizData={quizData} />
        </div>
      ) : (
        <div className="quiz-shell">
          <div className="quiz-card">
            <header className="quiz-header">
              <div className="logo">🧠</div>

              <h1 className="title">
                Hi, I&apos;m <span>Nemo</span>
              </h1>

              <p className="description">
                I create thoughtful quizzes and break down your understanding
                with clear insights.
              </p>
            </header>

            <section className="quiz-form">
              <input
                type="text"
                value={topic || ""}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Diabetes, Disney, Democracy"
                className="input"
              />

              <button
                onClick={generateQuiz}
                className={`btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Crafting…" : "Start Quiz"}
                {loading && <span className="spinner">⏳</span>}
              </button>
            </section>

            <footer className="quiz-footer">
              <p>“Learning never really ends.”</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
