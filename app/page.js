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
    const randomNumber = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
    setNumQuestions(randomNumber);
  }, [setTopic]);

  async function generateQuiz() {
    if (!topic) return alert("Please enter a topic first!");

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          numQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      setQuizData(data.quizData);
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
              <h1 className="title">
                 <span>Nemo</span> Here
              </h1>
            </header>

            <section className="quiz-form">
              <input
                type="text"
                value={topic || ""}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn?"
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
          </div>
        </div>
      )}
    </>
  );
}
