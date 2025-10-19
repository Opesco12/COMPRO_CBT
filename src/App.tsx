import { useState, useEffect } from 'react';
import questionsData from '../questions.json';

// Type definitions
interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Question {
  questionNumber: number;
  question: string;
  options: QuestionOptions;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface ExamData {
  examTitle: string;
  category: string;
  questions: Question[];
}

interface UserAnswers {
  [key: number]: 'A' | 'B' | 'C' | 'D';
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60); // 50 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    // Extract questions from the JSON structure
    // Handle both array wrapper and direct object formats
    const data: ExamData = Array.isArray(questionsData) 
      ? (questionsData[0] as ExamData)
      : (questionsData as ExamData);
    const allQuestions = data.questions || [];
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(100, shuffled.length));
    setQuestions(selected);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionNumber: number, answer: 'A' | 'B' | 'C' | 'D'): void => {
    setUserAnswers((prev) => ({ ...prev, [questionNumber]: answer }));
  };

  const handleNext = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = (): void => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.questionNumber] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setIsSubmitted(true);
  };

  if (questions.length === 0) {
    return <div className="text-center p-4 text-lg">Loading questions...</div>;
  }

  if (isSubmitted) {
    const percentage = ((score / questions.length) * 100).toFixed(2);
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Exam Results</h1>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 text-center">
            <p className="text-2xl font-bold mb-2">Your Score: {score} / {questions.length}</p>
            <p className="text-xl text-gray-700">Percentage: {percentage}%</p>
            <p className="mt-4 text-lg font-semibold">
              {parseFloat(percentage) >= 70 ? '🎉 Congratulations! You passed!' : '📚 Keep studying and try again!'}
            </p>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Answer Review:</h2>
          <div className="space-y-6">
            {questions.map((q, index) => {
              const userAnswer = userAnswers[q.questionNumber];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-semibold text-gray-800">
                      Question {q.questionNumber}: {q.question}
                    </p>
                    {isCorrect ? (
                      <span className="text-green-600 font-bold text-sm">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 font-bold text-sm">✗ Wrong</span>
                    )}
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {(Object.entries(q.options) as [keyof QuestionOptions, string][]).map(([key, value]) => {
                      const isUserChoice = userAnswer === key;
                      const isCorrectAnswer = q.correctAnswer === key;
                      
                      let bgColor = 'bg-gray-50';
                      let textColor = 'text-gray-800';
                      let label = '';
                      
                      if (isCorrectAnswer) {
                        bgColor = 'bg-green-100';
                        textColor = 'text-green-800';
                        label = '(Correct Answer)';
                      }
                      if (isUserChoice && !isCorrect) {
                        bgColor = 'bg-red-100';
                        textColor = 'text-red-800';
                        label = '(Your Answer)';
                      }
                      if (isUserChoice && isCorrect) {
                        label = '(Your Answer ✓)';
                      }
                      
                      return (
                        <div key={key} className={`p-2 rounded ${bgColor} ${textColor}`}>
                          <strong>{key}.</strong> {value} {label && <span className="font-semibold ml-2">{label}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Take Test Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          {(Array.isArray(questionsData) 
            ? (questionsData[0] as ExamData).examTitle 
            : (questionsData as ExamData).examTitle) || 'Civil Service Promotion CBT Simulator'}
        </h1>
        
        <div className="flex justify-between items-center mb-6 p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <p className="text-sm text-gray-600">Answered: {answeredCount} / {questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</p>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xl font-semibold mb-4 text-gray-800">
            {currentQuestion.question}
          </p>
          
          <div className="space-y-3">
            {(Object.entries(currentQuestion.options) as [keyof QuestionOptions, string][]).map(([key, value]) => {
              const isSelected = userAnswers[currentQuestion.questionNumber] === key;
              
              return (
                <label
                  key={key}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionNumber}`}
                    value={key}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(currentQuestion.questionNumber, key as 'A' | 'B' | 'C' | 'D')}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-800">
                    <strong>{key}.</strong> {value}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question navigation grid */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold mb-3 text-gray-700">Question Navigator:</p>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.questionNumber] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded font-semibold text-sm transition ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-200 text-green-800 hover:bg-green-300'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;