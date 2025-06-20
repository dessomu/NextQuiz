'use client'
import React, { useState,useContext} from 'react';
import './QuizCard.css'; 
import UseContext from '../../context/UseContext';
import ResultCard from '../ResultCard/ResultCard';


const QuizCard = (quizData) => {
  // Sample quiz data - in a real app, this would come from props or API
  const {topic, setTopic, setQuizStarted,userResultAnalysis, setUserResultAnalysis } = useContext(UseContext);


  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [usersResults, setUsersResults] = useState([]);
  

  const currentQ =quizData.quizData[currentQuestion];
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

    setIsAnswered(prev=>!prev);
    setShowAnswer(true);

    const userResultObj= {
      question: currentQ.question,
      userAnswer: currentQ.options[selectedAnswer],
      correctAnswer: currentQ.options[currentQ.correctAnswer],
      explanation: currentQ.explanation,
    };
    setUsersResults(prev => [...prev, userResultObj]);

    if (selectedAnswer === currentQ.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }
  };

  async function getAIAnalysis() {
    const apiKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
    const jsonString =  JSON.stringify(usersResults, null, 2);
    
    const prompt = `Analyze these answers ${jsonString} of a quiz taker on the topic: ${topic}. Provide analysis in this JSON format: {
  "analysis": {
    "solidKnowledge": [
      "knowledge point 1- within 3-5 words",
      "knowledge point 2 - within 3-5 words",
      "knowledge point 3 - within 3-5 words"
    ],
    "areasToImprove": [
      "improvement point 1 - within 3-5 words",
      "improvement point 2 - within 3-5 words",
      "improvement point 3 - within 3-5 words"
    ],
    "actionPlan": [
      "action plan 1 - within 3-5 words",
      "action plan 2 - within 3-5 words",
      "action plan 3 - within 3-5 words"
      
    ]
  }
}
.Do not include comments, explanations, or extra characters. The response should strictly be a JSON object or array.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`, // Replace with your OpenRouter API key
          "HTTP-Referer": "https://magenta-raindrop-e04d1a.netlify.app/", // Optional. Site URL for rankings on openrouter.ai.
          "X-Title": "scholarsquiz", // Optional. Site title for rankings on openrouter.ai.
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528:free",
          "messages": [
            {
              "role": "user",
              "content": prompt,
            }
          ]
        })
      });
      const analysisData = await response.json();
      let analysisText =  analysisData.choices?.[0]?.message?.content || "No response received.";

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
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setIsAnswered(prev => !prev);
    }else {

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
                onClick={() => handleAnswerSelect(index)}
                className={`option ${
                  selectedAnswer === index ? 'selected' : ''
                } ${
                  showAnswer && index === currentQ.correctAnswer ? 'correct' : ''
                } ${
                  showAnswer && selectedAnswer === index && index !== currentQ.correctAnswer ? 'incorrect' : ''
                } ${isAnswered ? 'disabled' : ''}`}
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
                {currentQuestion < totalQuestions - 1 ? 'Next, Please' : 'Show Detailed Analysis '}
                {analysisLoading ? 
                  <span className="timer-icon">⏳</span> : " "
                }
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default QuizCard;