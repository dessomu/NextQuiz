'use client'

import React, { useState } from "react";
import UseContext from "./UseContext";

function UseContextProvider({ children }) {
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [topic, setTopic] = useState("");

  return (
    <UseContext.Provider value={{ showResult,setShowResult, questions,setQuestions, quizStarted,setQuizStarted, topic,setTopic }}>
      {children}
    </UseContext.Provider>
  );
}

export default UseContextProvider;