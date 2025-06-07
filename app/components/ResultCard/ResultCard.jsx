'use client'

import React, { useState, useEffect, useContext } from "react";
import "./result.css";
import UseContext from "../../context/UseContext";

const AnimatedCircle = ({percentage}) => {
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
      <div className="quiz-result-content">
        <div className="circle-container">
          <svg className="circle-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} className="circle-background" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`circle-progress ${
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
            className={`percentage-text ${
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

// Demo App
const ResultCard = ({ correctAnswers, totalQuestions, resetQuiz }) => {
  const { topic } = useContext(UseContext);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Get celebration emoji based on score
  const getCelebrationEmoji = (score) => {
    if (score >= 90) return "🎉";
    if (score >= 80) return "🎊";
    if (score >= 70) return "👏";
    if (score >= 60) return "👍";
    return "💪";
  };
  const getEncouragementMessage = (score) => {
    if (score >= 90) return "Outstanding! You've mastered this topic! 🌟";
    if (score >= 80) return "Excellent work! You're doing great! 🎉";
    if (score >= 70) return "Good job! You're on the right track! 👍";
    if (score >= 60) return "Nice effort! Keep practicing! 📚";
    return "Don't give up! Practice makes perfect! 💪";
  };

  // Get analysis based on score
  const getAnalysis = (score) => {
    if (score >= 80) {
      return {
        status: "Nailed It! ✅",
        message: "You have a solid understanding of this topic.",
        tip: "Try more challenging questions to deepen your knowledge.",
      };
    } else if (score >= 60) {
      return {
        status: "Good Progress 📈",
        message: "You're making progress but there&apos;s room for improvement.",
        tip: "Review the concepts you missed and practice similar questions.",
      };
    } else {
      return {
        status: "Need More Practice 📖",
        message: "This topic needs more attention.",
        tip: "Focus on fundamentals and practice regularly to improve.",
      };
    }
  };

  const analysis = getAnalysis(percentage);

  return (
    <>
      <div className="completion-section">
        <div className="completion-icon">{getCelebrationEmoji(percentage)}</div>
        <h2 className="completion-title">Another Step Forward</h2>
        <h3>{topic}</h3>
        <AnimatedCircle percentage={percentage} />
        <div className="score-info">
          <p className="score-text">
            You got <strong style={{color:"#10b981"}}>{correctAnswers}</strong>/
            <strong>{totalQuestions}</strong> correct.
          </p>
          <p className="encouragement">{getEncouragementMessage(percentage)}</p>
        </div>
        <div className="sections-container">
          {/* Analysis Section */}
          <div className="section">
            <h3 className="section-title">
              <span className="section-icon">🎯</span>
              Analysis
            </h3>
            <div className="analysis-status">{analysis.status}</div>
            <p className="analysis-message">{analysis.message}</p>
            <p className="analysis-tip">{analysis.tip}</p>
          </div>
        </div>
        <button onClick={resetQuiz} className="restart-button">
        Challenge Me Again
        </button>
      </div>
    </>
  );
};

export default ResultCard;
