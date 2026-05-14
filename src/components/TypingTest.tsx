import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { RefreshCw, Trophy } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

const QUOTES: Record<Difficulty, string[]> = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "To be, or not to be, that is the question.",
    "All that glitters is not gold."
  ],
  medium: [
    "A journey of a thousand miles begins with a single step.",
    "That's one small step for a man, one giant leap for mankind.",
    "Life is what happens when you're busy making other plans."
  ],
  hard: [
    "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.",
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    "To see a World in a Grain of Sand And a Heaven in a Wild Flower, Hold Infinity in the palm of your hand And Eternity in an hour."
  ]
};

const DUNE_QUOTE = QUOTES.hard[0];

export const TypingTest: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [quote, setQuote] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startNewTest(DUNE_QUOTE);
  }, []);

  const startNewTest = (forceQuote?: string) => {
    const quotes = QUOTES[difficulty];
    const randomQuote = forceQuote || quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    const quotes = QUOTES[newDiff];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setInput(val);

    if (val.length === quote.length) {
      finishTest(val);
    }
  };

  const finishTest = async (finalInput: string) => {
    const end = Date.now();
    setEndTime(end);
    setIsFinished(true);

    const timeTaken = Math.max((end - (startTime || end)) / 1000, 0.1); // in seconds
    const timeInMinutes = timeTaken / 60;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < quote.length; i++) {
      if (finalInput[i] === quote[i]) {
        correctChars++;
      }
    }
    const acc = Math.round((correctChars / quote.length) * 100);
    
    // Calculate WPM (standard: 5 chars = 1 word)
    const wordsTyped = (correctChars / 5);
    let calculatedWpm = Math.round(wordsTyped / timeInMinutes);
    if (calculatedWpm > 300) calculatedWpm = 300;

    setAccuracy(acc);
    setWpm(calculatedWpm);

    if (user) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            wpm: calculatedWpm,
            accuracy: acc,
            time: Number(timeTaken.toFixed(2)),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save score');
        }

        onComplete();
      } catch (error) {
        console.error('Error saving score:', error);
        // Fallback to direct Firestore if API fails (optional, but good for stability)
        try {
          await addDoc(collection(db, 'scores'), {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            wpm: calculatedWpm,
            accuracy: acc,
            time: Number(timeTaken.toFixed(2)),
            timestamp: serverTimestamp()
          });
          onComplete();
        } catch (fsError) {
          handleFirestoreError(fsError, 'create', 'scores');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderQuote = () => {
    return quote.split('').map((char, index) => {
      let color = 'text-gray-400 dark:text-gray-500';
      if (index < input.length) {
        color = input[index] === char ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20';
      }
      return (
        <span key={index} className={`${color} transition-colors duration-100`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Typing Test</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Type the text below as fast and accurately as you can.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                difficulty === level 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 rounded-xl text-xl sm:text-2xl font-mono leading-relaxed tracking-wide shadow-inner relative overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 pointer-events-none" onClick={() => inputRef.current?.focus()}></div>
        {renderQuote()}
      </div>

      <div className="relative mb-6 sm:mb-8">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onPaste={(e) => e.preventDefault()}
          disabled={isFinished || isSubmitting}
          className="w-full p-3 sm:p-4 text-lg sm:text-xl bg-white dark:bg-gray-950 border-2 border-indigo-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 font-mono text-gray-900 dark:text-gray-100"
          placeholder="Start typing here..."
          autoFocus
        />
      </div>

      {isFinished && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-center border border-indigo-100 dark:border-indigo-500/20">
            <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-1 uppercase tracking-wider">WPM</div>
            <div className="text-3xl sm:text-4xl font-bold text-indigo-900 dark:text-indigo-100">{wpm}</div>
          </div>
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-500/10 rounded-xl text-center border border-green-100 dark:border-green-500/20">
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold mb-1 uppercase tracking-wider">Accuracy</div>
            <div className="text-3xl sm:text-4xl font-bold text-green-900 dark:text-green-100">{accuracy}%</div>
          </div>
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-center border border-blue-100 dark:border-blue-500/20">
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase tracking-wider">Time</div>
            <div className="text-3xl sm:text-4xl font-bold text-blue-900 dark:text-blue-100">{((endTime! - startTime!) / 1000).toFixed(1)}s</div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={() => startNewTest()}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex justify-center items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Restart</span>
        </button>

        {!user && isFinished && (
          <div className="w-full sm:w-auto text-center text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20 text-sm sm:text-base">
            Sign in to save your score to the leaderboard!
          </div>
        )}
        
        {user && isFinished && !isSubmitting && (
          <button
            onClick={onComplete}
            className="w-full sm:w-auto flex justify-center items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Trophy className="w-5 h-5" />
            <span>View Leaderboard</span>
          </button>
        )}
        
        {isSubmitting && (
          <div className="w-full sm:w-auto flex justify-center items-center space-x-2 px-6 py-3 bg-indigo-400 text-white rounded-xl font-medium cursor-not-allowed">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Submitting...</span>
          </div>
        )}
      </div>
    </div>
  );
};
