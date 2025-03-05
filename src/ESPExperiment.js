import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const ESPExperiment = () => {
  const [targetLetter, setTargetLetter] = useState('');
  const [guess, setGuess] = useState('');
  const [trials, setTrials] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [overallTrials, setOverallTrials] = useState(0);
  const [overallSuccesses, setOverallSuccesses] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    generateNewTarget();
  }, []);

  const generateNewTarget = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    setTargetLetter(alphabet[randomIndex]);
  };

  const handleGuess = () => {
    if (guess === '') return; // Prevent submission if input is empty

    const guessLetter = guess.toUpperCase();
    if (guessLetter === targetLetter) {
      setSuccesses(successes + 1);
      setOverallSuccesses(overallSuccesses + 1);
      setShowImage(true);
      setFeedback('Correct!');
      setTimeout(() => {
        setShowImage(false);
        setFeedback('');
      }, 2000);
    } else {
      setFeedback(`Incorrect. The correct letter was ${targetLetter}.`);
      setTimeout(() => setFeedback(''), 4000);
    }
    setTrials(trials + 1);
    setOverallTrials(overallTrials + 1);
    setGuess('');
    generateNewTarget();

    if (trials + 1 === 10) {
      setGameOver(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && guess !== '') {
      handleGuess();
    }
  };

  const calculatePValue = (observedSuccesses, totalTrials) => {
    const expectedSuccesses = totalTrials * (1 / 26);
    const variance = totalTrials * (1 / 26) * (25 / 26);
    const zScore = (observedSuccesses - expectedSuccesses) / Math.sqrt(variance);
    const pValue = 1 - normalCDF(zScore);
    return pValue;
  };

  const normalCDF = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (x > 0) prob = 1 - prob;
    return prob;
  };

  const restartGame = () => {
    setTrials(0);
    setSuccesses(0);
    setGameOver(false);
    generateNewTarget();
  };

  const renderResults = (title, trials, successes) => {
    const pValue = calculatePValue(successes, trials);
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p>Trials: {trials}</p>
        <p>Successes: {successes}</p>
        <p>Success Rate: {(successes / trials * 100).toFixed(2)}%</p>
        <p>P-value: {pValue.toFixed(4)}</p>
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Statistical Significance</AlertTitle>
          <AlertDescription>
            {pValue < 0.05
              ? "These results are statistically significant (p < 0.05). This suggests performance was better than chance."
              : "These results are not statistically significant (p ≥ 0.05). This suggests performance was not significantly different from chance."}
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">ESP Experiment</h1>
      {!gameOver ? (
        <>
          <p className="mb-2">Guess an English letter (A-Z):</p>
          <div className="flex mb-4">
            <Input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a letter"
              className="mr-2"
              maxLength={1}
            />
            <Button onClick={handleGuess} disabled={guess === ''}>Guess</Button>
          </div>
          {feedback && (
            <p className={`mb-2 ${feedback.startsWith('Correct') ? 'text-green-600' : 'text-red-600'}`}>
              {feedback}
            </p>
          )}
          <p>Current Game - Trials: {trials}/10</p>
          <p>Current Game - Successes: {successes}</p>
          <p>Overall Trials: {overallTrials}</p>
          <p>Overall Successes: {overallSuccesses}</p>
          {showImage && (
            <img 
              src={process.env.PUBLIC_URL + '/elisa.jpg'} 
              alt="Success" 
              className="mt-4 w-full max-w-xs mx-auto" 
            />
          )}
        </>
      ) : (
        <div>
          {renderResults("Current Game Results", 10, successes)}
          {renderResults("Overall Results", overallTrials, overallSuccesses)}
          <Button onClick={restartGame} className="mt-4">Start New Game</Button>
        </div>
      )}
    </div>
  );
};

export default ESPExperiment;
