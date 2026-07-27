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

  const priceMoney = [
    1000, 2000, 3000, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000,
    1250000, 2500000, 5000000, 10000000,
  ];

  const currentPrize = priceMoney[currentQuestionIndex];

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
        throw new Error(`No ${difficulty} questions found.`);
      }

      return data.results;
    }

    throw new Error("API rate limit exceeded. Please try again.");
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
    <div className="min-h-screen bg-slate-200 flex justify-center items-center p-6">
      <div className="flex gap-8 w-full max-w-7xl">
        <div className="flex-1 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Quiz Game</h1>

          <h2 className="text-center text-gray-500 mb-6">{categoryName}</h2>

          {loading && <p className="text-center">Loading...</p>}

          {!loading && error && (
            <>
              <p className="text-red-600 text-center">{error}</p>

              <button
                onClick={fetchQuestions}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Retry
              </button>
            </>
          )}

          {!loading && !error && quizFinished && (
            <h2 className="text-center text-2xl text-green-600">
              Congratulations! You finished the quiz.
            </h2>
          )}

          {!loading && !error && !quizFinished && currentQuestion && (
            <>
              <p className="text-gray-500 mb-3">
                Question {currentQuestionIndex + 1} / {questions.length}
              </p>

              <p className="font-bold text-blue-600 mb-5">
                Current Prize: ₹{currentPrize.toLocaleString()}
              </p>

              <div className="bg-blue-50 rounded-lg p-5 mb-6">
                <h2
                  className="text-xl font-semibold"
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.question,
                  }}
                />
              </div>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <button
                    key={index}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleAnswerClick(option)}
                    className={`w-full p-4 rounded-lg border transition ${
                      selectedAnswer === option
                        ? "bg-blue-500 text-white"
                        : "hover:bg-blue-100"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: option,
                    }}
                  />
                ))}
              </div>

              {answerResult && (
                <div className="mt-6 text-center">
                  <p
                    className={`font-semibold text-lg mb-5 ${
                      answerResult === "Correct!"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {answerResult}
                  </p>

                  <button
                    onClick={handleNextClick}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Finish"
                      : "Next Question"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-72 bg-gray-800 text-white rounded-xl p-5">
          <h2 className="text-center text-2xl font-bold mb-6">Prize Ladder</h2>

          {[...priceMoney].reverse().map((money) => {
            const originalIndex = priceMoney.indexOf(money);

            return (
              <div
                key={money}
                className={`p-3 rounded-lg mb-2 text-center font-semibold ${
                  originalIndex === currentQuestionIndex
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-700"
                }`}
              >
                ₹{money.toLocaleString()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Game;
