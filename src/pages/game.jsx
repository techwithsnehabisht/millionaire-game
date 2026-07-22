import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function Game() {
  const location = useLocation();

  const { categoryId, categoryName } = location.state;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchQuestionsForDifficulty = async (difficulty, retries = 3) => {
    const url = `https://opentdb.com/api.php?amount=5&category=${categoryId}&difficulty=${difficulty}&type=multiple`;

    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(url);

      if (response.status === 429) {
        await wait(5500);
        continue;
      }

      const data = await response.json();

      if (data.response_code !== 0) {
        throw new Error(
          `No ${difficulty} questions available for this category.`,
        );
      }

      return data.results;
    }

    throw new Error("The quiz API is rate-limited. Please try again.");
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const easyResults = await fetchQuestionsForDifficulty("easy");
      const mediumResults = await fetchQuestionsForDifficulty("medium");
      const hardResults = await fetchQuestionsForDifficulty("hard");

      setQuestions([...easyResults, ...mediumResults, ...hardResults]);
    } catch (err) {
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const options = currentQuestion
    ? [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers,
      ].sort(() => Math.random() - 0.5)
    : [];

  const handleAnswerClick = (selectedOption) => {
    setSelectedAnswer(selectedOption);

    if (selectedOption === currentQuestion.correct_answer) {
      setAnswerResult("Correct!");
    } else {
      setAnswerResult(`Correct Answer: ${currentQuestion.correct_answer}`);
    }
  };

  const handleNextClick = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswerResult("");
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Quiz Game</h1>

        <h2 className="text-center text-gray-600 mb-6">
          Category: {categoryName}
        </h2>

        {loading && (
          <p className="text-center text-gray-500">Loading questions...</p>
        )}

        {!loading && error && (
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && quizFinished && (
          <p className="text-center text-lg font-semibold text-blue-600">
            You completed the quiz!
          </p>
        )}

        {!loading && !error && !quizFinished && currentQuestion && (
          <>
            <p className="text-sm text-gray-500 mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            <h2 className="text-2xl font-semibold mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswerClick(option)}
                  className={`w-full p-4 rounded-lg border text-left transition
                    ${
                      selectedAnswer === option
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-blue-100"
                    }
                    `}
                >
                  {option}
                </button>
              ))}
            </div>

            {answerResult && (
              <div className="mt-6 text-center">
                <p
                  className={`text-lg font-semibold mb-4 ${
                    answerResult === "Correct!"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {answerResult}
                </p>

                <button
                  onClick={handleNextClick}
                  className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  {currentQuestionIndex < questions.length - 1
                    ? "Next"
                    : "Finish"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Game;
