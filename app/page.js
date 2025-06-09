"use client";
import React, { useState, useEffect, useContext } from "react";
import QuizCard from "./components/QuizCard/QuizCard";
import UseContext from "./context/UseContext";

export default function Home() {
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizData, setQuizData] = useState([]);

  const {  topic, setTopic, quizStarted, setQuizStarted } = useContext(UseContext);

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
      const prompt = `Generate ${numQuestions} quiz questions about ${topic} with 4 options and correct answer. Format as pure JSON array:
      [{
        id: "unique number",
        question: "question text",
        options: ["a", "b", "c", "d"],
        correctAnswer: "index",
        explanation: "explanation text"
      }]`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`, // Replace with your OpenRouter API key
          "HTTP-Referer": "https://magenta-raindrop-e04d1a.netlify.app/", // Optional. Site URL for rankings on openrouter.ai.
          "X-Title": "scholarsquiz", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528-qwen3-8b:free",
          "messages": [
            {
              "role": "user",
              "content": prompt,
            }
          ]
        })
      });

      const data = await response.json();
      
      const markdownText =
        data.choices?.[0]?.message?.content || "No response received.";
        
        
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
        <div className="quiz-container">
          <div className="floating-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="orb orb-4"></div>
            <div className="orb orb-5"></div>
            <div className="orb orb-6"></div>
          </div>
          <QuizCard quizData={quizData}/>
        </div>
      ) : (
        <div className="quiz-container">
          <div className="floating-orbs">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="orb orb-4"></div>
            <div className="orb orb-5"></div>
            <div className="orb orb-6"></div>
          </div>
          <div className="quiz-card">
            <div className="header-section">
              <div className="icon-wrapper">
                <div className="brain-icon">🧠</div>
              </div>
              <h1 className="main-title">Welcome, Scholar</h1>
              <p className="subtitle">Let&apos;s challange your curious mind.</p>
            </div>

            <div className="form-section">
              <div className="input-group">
                <label htmlFor="topic" className="input-label">
                  Topic: {""}
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic || ""}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Diabetes, Disney, or Democracy - what&apos;s on your mind!"
                  className="topic-input"
                />
              </div>

              <button onClick={generateQuiz} className={`${loading ? "start-button loading" : "start-button"}`}>
                {!loading && <span className="button-icon">⚡</span>}
                {loading ? "Get Ready.." : "Test My Knowledge"}
                {loading && <span className="timer-icon">⏳</span>}
              </button>
            </div>

            <div className="features-section">
              {/* <p className="features-label">Features</p> */}
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <span>Context-Aware</span>
              </div>
              <div className="feature">
                <div className="feature-icon">🚀</div>
                <span>AI Powered</span>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <span>Insightful</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
