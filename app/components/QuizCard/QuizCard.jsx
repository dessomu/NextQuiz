'use client'
import React, { useState,useContext } from 'react';
import './QuizCard.css'; 
import UseContext from '../../context/UseContext';
import ResultCard from '../ResultCard/ResultCard';


const QuizCard = (quizData) => {
  // Sample quiz data - in a real app, this would come from props or API
  const {topic, setTopic, setQuizStarted } = useContext(UseContext);
  console.log(quizData);
  



  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQ =quizData.quizData[currentQuestion];
  const totalQuestions = quizData.quizData.length;

  const handleAnswerSelect = (answerIndex) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setIsAnswered(true);
    setShowAnswer(true);

    if (selectedAnswer === currentQ.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
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
  };

  

  if (quizCompleted) {
    return (
      <div className="quiz-card">
      <ResultCard resetQuiz={resetQuiz} correctAnswers={correctAnswers} totalQuestions={totalQuestions}/>
    </div>
    );
  }

  return (
      <div className="quiz-card">
        <div className="quiz-header">
          <div className="progress-info">
            <div className="question-counter">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <div className="score-tracker">
              <div className="score-item correct">
                <span className="score-icon">✓</span>
                <span>{correctAnswers}</span>
              </div>
              <div className="score-item incorrect">
                <span className="score-icon">✗</span>
                <span>{incorrectAnswers}</span>
              </div>
            </div>
          </div>
          <div className="topic-badge">{topic}</div>
        </div>

        <div className="question-section">
          <h2 className="question-text">{currentQ.question}</h2>
          
          <div className="options-container">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`option ${
                  selectedAnswer === index ? 'selected' : ''
                } ${
                  showAnswer && index === currentQ.correctAnswer ? 'correct' : ''
                } ${
                  showAnswer && selectedAnswer === index && index !== currentQ.correctAnswer ? 'incorrect' : ''
                } ${isAnswered ? 'disabled' : ''}`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="option-letter">
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>

          {showAnswer && (
            <div className="answer-section">
              <div className="answer-header">
                <span className="answer-icon">💡</span>
                <span className="answer-title">Correct Answer</span>
              </div>
              <div className="answer-explanation">
                {currentQ.explanation}
              </div>
            </div>
          )}

          <div className="action-buttons">
            {!showAnswer ? (
              <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                Confirm Answer
              </button>
            ) : (
              <button className="next-button" onClick={handleNext}>
                <span>{currentQuestion < totalQuestions - 1 ? '➡️' : ''}</span>
                {currentQuestion < totalQuestions - 1 ? 'Next, Please' : 'Show My Score'}
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default QuizCard;