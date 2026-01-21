"use client";
import React, { useState, useContext } from "react";
import "./QuizCard.css";
import UseContext from "../../context/UseContext";
import ResultCard from "../ResultCard/ResultCard";

const QuizCard = (quizData) => {
  // Sample quiz data - in a real app, this would come from props or API
  const {
    topic,
    setTopic,
    setQuizStarted,
    userResultAnalysis,
    setUserResultAnalysis,
  } = useContext(UseContext);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [usersResults, setUsersResults] = useState([]);

  const currentQ = quizData.quizData[currentQuestion];
  const totalQuestions = quizData.quizData.length;

  const handleAnswerSelect = (index) => {
    console.log("option clicked:", index);
    if (!isAnswered) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    console.log(selectedAnswer);
    console.log(typeof selectedAnswer);

    setIsAnswered((prev) => !prev);
    setShowAnswer(true);

    const userResultObj = {
      question: currentQ.question,
      userAnswer: currentQ.options[selectedAnswer],
      correctAnswer: currentQ.options[currentQ.correctAnswer],
      explanation: currentQ.explanation,
    };
    setUsersResults((prev) => [...prev, userResultObj]);

    if (selectedAnswer === currentQ.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }
  };

  async function getAIAnalysis() {
    const apiKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
    const jsonString = JSON.stringify(usersResults, null, 2);

    const prompt = `Analyze these answers ${jsonString} of a quiz taker on the topic: ${topic}. Provide analysis in this JSON format: {
  "analysis": {
    "solidKnowledge": [
      "knowledge pointn 1",
      "knowledge point 2",
      "knowledge point 3"
    ],
    "areasToImprove": [
      "improvement point 1",
      "improvement point 2",
      "improvement point 3"
    ],
    "actionPlan": [
      "action plan 1",
      "action plan 2",
      "action plan 3"
      
    ]
  }
}
.Do not include comments, explanations, or extra characters. Each point should be within 3-5 words. The response should strictly be a JSON object or array.`;

    try {
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
      const analysisData = await response.json();
      console.log(analysisData);

      let analysisText =
        analysisData.choices?.[0]?.message?.content || "No response received.";

      // Clean known unwanted markdown wrappers
      analysisText = analysisText.replace(/```json|```/g, "").trim();
      console.log("Analysis Text:", analysisText);

      // parsing the response text to extract JSON data
      const analysis = JSON.parse(analysisText);

      return analysis;
    } catch (error) {
      console.error("Error fetching analysis:", error.message);
      return "Error fetching analysis.";
    }
  }

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setIsAnswered((prev) => !prev);
    } else {
      try {
        setAnalysisLoading(true);
        console.log(usersResults);

        const fetchedAnalysis = await getAIAnalysis();
        setUserResultAnalysis(fetchedAnalysis);
        setQuizCompleted(true);
      } catch (error) {
        console.error("Failed to get analysis:", error);
      } finally {
        setAnalysisLoading(false);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setShowAnswer(false);
    setIsAnswered(false);
    setQuizCompleted(false);
    setQuizStarted(false);
    setTopic("");
    setUserResultAnalysis("");
    setUsersResults([]);
    setAnalysisLoading(false);
  };

  if (quizCompleted && userResultAnalysis) {
    return (
      <div className="quiz-play-card">
        <ResultCard
          resetQuiz={resetQuiz}
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
        />
      </div>
    );
  }

  return (
    <div className="quiz-play-card">
      {/* TOP BAR */}
      <header className="quiz-top">
        <div className="progress">
          <span className="counter">
            {currentQuestion + 1} / {totalQuestions}
          </span>

          <div className="scores">
            <span className="score correct">✓ {correctAnswers}</span>
            <span className="score incorrect">✗ {incorrectAnswers}</span>
          </div>
        </div>

        <span className="topic-chip">{topic}</span>
      </header>

      {/* QUESTION */}
      <section className="quiz-body">
        <h2 className="question">{currentQ.question}</h2>

        {/* OPTIONS */}
        <div className="options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`option-btn
              ${selectedAnswer === index ? "selected" : ""}
              ${showAnswer && index === currentQ.correctAnswer ? "correct" : ""}
              ${
                showAnswer &&
                selectedAnswer === index &&
                index !== currentQ.correctAnswer
                  ? "incorrect"
                  : ""
              }
            `}
            >
              <span className="option-key">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {/* ANSWER EXPLANATION */}
        {showAnswer && (
          <div className="explanation">
            <div className="explanation-head">
              💡 <span>Explanation</span>
            </div>
            <p>{currentQ.explanation}</p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="actions">
          {!showAnswer ? (
            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              Confirm Answer
            </button>
          ) : (
            <button className="primary-btn" onClick={handleNext}>
              {currentQuestion < totalQuestions - 1
                ? "Next Question →"
                : "Show Analysis "}
              {analysisLoading && <span className="spinner"> ⏳</span>}
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuizCard;
