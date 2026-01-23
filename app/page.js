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
    const randomNumber = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
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
          <div className="quiz-card animate-enter">
            <header className="quiz-header">
              <h1 className="title">
                <span>Nemo</span>
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
                {loading ? (
                  <span>
                    Crafting{" "}
                    <span className="dots">
                      <span>. </span>
                      <span>. </span>
                      <span>.</span>
                    </span>
                  </span>
                ) : (
                  "Start Quiz"
                )}
              </button>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
