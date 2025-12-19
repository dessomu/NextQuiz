"use client";

import React, { useState, useEffect, useContext } from "react";
import "./result.css";
import UseContext from "../../context/UseContext";

const AnimatedCircle = ({ percentage }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Animate the percentage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Calculate circle properties
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  return (
    <>
      <div className="result-progress">
        <div className="circle-wrapper">
          <svg className="progress-ring" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} className="ring-bg" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`ring-progress ${
                percentage >= 80
                  ? "excellent"
                  : percentage >= 60
                  ? "good"
                  : "needs-improvement"
              }`}
              style={{
                strokeDasharray,
                strokeDashoffset,
              }}
            />
          </svg>

          <div
            className={`ring-text ${
              percentage >= 80
                ? "excellent"
                : percentage >= 60
                ? "good"
                : "needs-improvement"
            }`}
          >
            {animatedPercentage}%
          </div>
        </div>
      </div>
    </>
  );
};

// ResultCard component
const ResultCard = ({ correctAnswers, totalQuestions, resetQuiz }) => {
  const { topic, userResultAnalysis } = useContext(UseContext);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Get Encouragement Message based on score
  const getEncouragementMessage = (score) => {
    if (score >= 90) return "Outstanding! You've mastered this topic! 🌟";
    if (score >= 80) return "Excellent work! You're doing great! 🎉";
    if (score >= 70) return "Good job! You're on the right track! 👍";
    if (score >= 60) return "Nice effort! Keep practicing! 📚";
    return "Don't give up! Practice makes perfect! 💪";
  };
  // Get analysis heading based on score
  const getAnalysis = (score) => {
    if (score >= 80) {
      return {
        status: "Nailed It! ✅",
      };
    } else if (score >= 60) {
      return {
        status: "Good Progress 📈",
      };
    } else {
      return {
        status: "Need More Practice 📖",
      };
    }
  };

  const analysis = getAnalysis(percentage);
  const solidKnowledge = userResultAnalysis?.analysis?.solidKnowledge || [];
  const areasToImprove = userResultAnalysis?.analysis?.areasToImprove || [];
  const actionPlan = userResultAnalysis?.analysis?.actionPlan || [];

  return (
    <>
      <div className="result-card">
        {/* HEADER */}
        <header className="result-header">
          <h2 className="result-title">Another Step Forward 🚀</h2>
          <span className="result-topic">{topic}</span>
        </header>

        {/* SCORE */}
        <section className="result-score">
          <AnimatedCircle percentage={percentage} />

          <p className="score-line">
            <span className="score-strong">{correctAnswers}</span>/
            {totalQuestions} correct
          </p>

          <p className="encouragement">{getEncouragementMessage(percentage)}</p>
        </section>

        {/* ANALYSIS */}
        <section className="result-analysis">
          <div className="analysis-header">
            🎯 <span>Performance Breakdown</span>
          </div>

          <div className="analysis-status">{analysis.status}</div>

          <div className="analysis-grid">
            {/* Solid */}
            <div className="analysis-box success">
              <h3>✅ Strengths</h3>
              <ul>
                {solidKnowledge.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Improve */}
            <div className="analysis-box warning">
              <h3>⚠️ Improve</h3>
              <ul>
                {areasToImprove.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <div className="analysis-box info">
              <h3>💡 Action Plan</h3>
              <ul>
                {actionPlan.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <button className="restart-btn" onClick={resetQuiz}>
          Challenge Me Again
        </button>
      </div>
    </>
  );
};

export default ResultCard;
