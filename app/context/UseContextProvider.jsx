'use client'

import React, { useState } from "react";
import UseContext from "./UseContext";

function UseContextProvider({ children }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [usersResults, setUsersResults] = useState([]);
  const [userResultAnalysis, setUserResultAnalysis] = useState("");


  return (
    <UseContext.Provider value={{ quizStarted,setQuizStarted, topic,setTopic, usersResults, setUsersResults,userResultAnalysis, setUserResultAnalysis }}>
      {children}
    </UseContext.Provider>
  );
}

export default UseContextProvider;