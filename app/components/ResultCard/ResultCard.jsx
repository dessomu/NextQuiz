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
      <div className="completion-section">
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
            {/* <ReactMarkdown remarkPlugins={remarkGfm} >{userResultAnalysis}</ReactMarkdown> */}
            <div className="analysis-content">
              <h3>✅ Solid knowledge of:</h3>
              <ul className="analysis-list">
                {solidKnowledge.map((item, index) => (
                  <li key={index} className="analysis-point">{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-content">
              <h3>⚠️ Areas to improve:</h3>
              <ul className="analysis-list">
                {areasToImprove.map((item, index) => (
                  <li key={index} className="analysis-point">{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-content">
              <h3>💡 Action plan:</h3>
              <ul className="analysis-list">
                {actionPlan.map((item, index) => (
                  <li key={index} className="analysis-point">{item}</li>
                ))}
              </ul>
            </div>
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
