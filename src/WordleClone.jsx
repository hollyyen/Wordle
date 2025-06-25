import React, { useState, useEffect } from 'react';
import { AlertCircle, User } from 'lucide-react';
import './WordleClone.css';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Store the word list globally
let wordList = null;

// Utility function to get random word
const getRandomWord = async () => {
  const response = await fetch('/five_letter_words.txt');
  if (!response.ok) throw new Error('Failed to fetch word list');
  const text = await response.text();
  const words = text.split('\n')
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));
  if (words.length === 0) throw new Error('No 5-letter words found');
  wordList = words;
  const selectedWord = words[Math.floor(Math.random() * words.length)];
  console.log(selectedWord);
  return selectedWord;
};

const isValidWord = async (word) => {
  if (!wordList) {
    const response = await fetch('/five_letter_words.txt');
    if (!response.ok) throw new Error('Failed to fetch word list');
    const text = await response.text();
    wordList = text.split('\n')
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length === 5 && /^[A-Z]+$/.test(w));
  }
  return wordList.includes(word.toUpperCase());
};

// Tile Component
const Tile = ({ letter, status, delay = 0 }) => {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (status !== 'empty') {
      const timer = setTimeout(() => setAnimate(true), delay * 100);
      return () => clearTimeout(timer);
    }
  }, [status, delay]);
  const getStatusClass = () => {
    switch (status) {
      case 'correct': return 'tile-correct';
      case 'present': return 'tile-present';
      case 'absent': return 'tile-absent';
      default: return 'tile-empty';
    }
  };
  return (
    <div className={`tile ${getStatusClass()} ${animate ? 'animate-flip' : ''}`} style={{ animationDelay: `${delay * 100}ms` }}>
      {letter}
    </div>
  );
};

// Board Component
const Board = ({ guesses, currentGuess, currentRow }) => {
  const rows = [];
  for (let i = 0; i < 6; i++) {
    const row = [];
    let guess = '';
    let status = null;
    if (i < guesses.length) {
      guess = guesses[i].word;
      status = guesses[i].status;
    } else if (i === currentRow) {
      guess = currentGuess;
    }
    for (let j = 0; j < 5; j++) {
      const letter = guess[j] || '';
      const tileStatus = status ? status[j] : 'empty';
      row.push(<Tile key={`${i}-${j}`} letter={letter} status={tileStatus} delay={j} />);
    }
    rows.push(<div key={i} className="board-row">{row}</div>);
  }
  return <div className="game-board">{rows}</div>;
};

// Keyboard Component
const Keyboard = ({ onKeyPress, letterStatuses }) => {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const getKeyClass = (letter) => {
    const status = letterStatuses[letter];
    switch (status) {
      case 'correct': return 'key-correct';
      case 'present': return 'key-present';
      case 'absent': return 'key-absent';
      default: return 'key-default';
    }
  };
  const Key = ({ children, onClick, className = '' }) => (
    <button className={`keyboard-key ${className}`} onClick={onClick}>{children}</button>
  );
  return (
    <div className="keyboard">
      <div className="keyboard-row">{topRow.map(letter => <Key key={letter} className={getKeyClass(letter)} onClick={() => onKeyPress(letter)}>{letter}</Key>)}</div>
      <div className="keyboard-row">{middleRow.map(letter => <Key key={letter} className={getKeyClass(letter)} onClick={() => onKeyPress(letter)}>{letter}</Key>)}</div>
      <div className="keyboard-row">
        <Key className="key-default key-large" onClick={() => onKeyPress('ENTER')}>ENTER</Key>
        {bottomRow.map(letter => <Key key={letter} className={getKeyClass(letter)} onClick={() => onKeyPress(letter)}>{letter}</Key>)}
        <Key className="key-default key-large" onClick={() => onKeyPress('BACKSPACE')}>⌫</Key>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Stats Component
const Stats = ({ stats, onPlayAgain }) => (
  <div className="stats-container">
    <div className="stats-grid">
      <div className="stat-item"><div className="stat-number">{stats.gamesPlayed}</div><div className="stat-label">Played</div></div>
      <div className="stat-item"><div className="stat-number">{Math.round(stats.winPercentage)}</div><div className="stat-label">Win %</div></div>
      <div className="stat-item"><div className="stat-number">{stats.currentStreak}</div><div className="stat-label">Current Streak</div></div>
      <div className="stat-item"><div className="stat-number">{stats.maxStreak}</div><div className="stat-label">Max Streak</div></div>
    </div>
    {onPlayAgain && <button onClick={onPlayAgain} className="btn-primary">Play Again</button>}
  </div>
);

const WelcomePage = ({ onPlay, onSignIn, onSignOut, user, stats, onShowRules }) => (
  <div className="welcome-container">
    <img src="/assets/logo-gOPfg7VJ.png" alt="" className="welcome-logo" />
    <h1 className="welcome-title">WORDLE</h1>
    <p className="welcome-subtitle">Get 6 chances to guess a 5-letter word.</p>
    {user ? (
      <div className="welcome-user">
        <p>Welcome, {user.displayName}!</p>
        <Stats stats={stats} />
        <div className="welcome-buttons">
          <button onClick={onPlay} className="btn-primary">Play</button>
          <button onClick={onSignOut} className="btn-primary">Sign Out</button>
        </div>
      </div>
    ) : (
      <div className="welcome-buttons">
        <button onClick={onShowRules} className="btn-primary">Rules</button>
        <button onClick={onSignIn} className="btn-primary">Log in</button>
        <button onClick={onPlay} className="btn-primary">Play as Guest</button>
      </div>
    )}
    <footer className="welcome-footer">
      <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} : Edited by Kanak Shri</p>
    </footer>
  </div>
);

// Rules Component
const Rules = () => (
  <div className="rules-container">
    <p>Guess the 5-letter word in 6 tries.</p>
    <ul>
      <li>Each guess must be a valid 5-letter word.</li>
      <li>Green: Letter is correct and in the right position.</li>
      <li>Yellow: Letter is in the word but in the wrong position.</li>
      <li>Gray: Letter is not in the word.</li>
    </ul>
  </div>
);

// Main App Component
const WordleClone = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [letterStatuses, setLetterStatuses] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validatingWord, setValidatingWord] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0
  });
  const [showGame, setShowGame] = useState(false);
  const auth = getAuth();

  // Generate guest ID if no user
  const getUserId = () => user ? user.uid : `guest-${Math.random().toString(36).substr(2, 9)}`;

  // Load stats from localStorage
  useEffect(() => {
    const userId = getUserId();
    const savedStats = localStorage.getItem(`wordle-stats-${userId}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [user]);

  // Save stats to localStorage
  const saveStats = (newStats) => {
    const userId = getUserId();
    localStorage.setItem(`wordle-stats-${userId}`, JSON.stringify(newStats));
    setStats(newStats);
  };

  // Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  // Load target word
  useEffect(() => {
    const loadWord = async () => {
      setLoading(true);
      try {
        const word = await getRandomWord();
        setTargetWord(word);
        setError('');
      } catch (err) {
        setError('Failed to load word. Please try again.');
        console.error('Word load error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (showGame) loadWord();
  }, [showGame]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameStatus !== 'playing') return;
      const key = event.key.toUpperCase();
      if (key === 'ENTER') handleKeyPress('ENTER');
      else if (key === 'BACKSPACE') handleKeyPress('BACKSPACE');
      else if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameStatus]);

  // Check guess
  const checkGuess = (guess) => {
    const result = [];
    const newLetterStatuses = { ...letterStatuses };
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    guessLetters.forEach((letter, index) => {
      if (letter === targetLetters[index]) {
        result[index] = 'correct';
        newLetterStatuses[letter] = 'correct';
        targetLetters[index] = null;
      }
    });
    guessLetters.forEach((letter, index) => {
      if (result[index]) return;
      const targetIndex = targetLetters.indexOf(letter);
      if (targetIndex !== -1) {
        result[index] = 'present';
        if (newLetterStatuses[letter] !== 'correct') newLetterStatuses[letter] = 'present';
        targetLetters[targetIndex] = null;
      } else {
        result[index] = 'absent';
        if (!newLetterStatuses[letter]) newLetterStatuses[letter] = 'absent';
      }
    });
    setLetterStatuses(newLetterStatuses);
    return result;
  };

  // Handle key press
  const handleKeyPress = async (key) => {
    if (gameStatus !== 'playing' || validatingWord) return;
    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setError('Word must be 5 letters long');
        setTimeout(() => setError(''), 2000);
        return;
      }
      setValidatingWord(true);
      setError('Checking word...');
      try {
        const isValid = await isValidWord(currentGuess);
        setValidatingWord(false);
        setError('');
        if (!isValid) {
          setError('Not a valid word');
          setTimeout(() => setError(''), 2000);
          return;
        }
        const status = checkGuess(currentGuess);
        const newGuess = { word: currentGuess, status };
        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');
        if (currentGuess === targetWord) {
          setGameStatus('won');
          updateStats(true, newGuesses.length);
          setTimeout(() => setShowModal(true), 1000);
        } else if (newGuesses.length >= 6) {
          setGameStatus('lost');
          updateStats(false, 6);
          setTimeout(() => setShowModal(true), 1000);
        }
      } catch (err) {
        setValidatingWord(false);
        setError('Error validating word');
        setTimeout(() => setError(''), 2000);
        console.error('Word validation error:', err);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  };

  // Update stats
  const updateStats = (won, guessCount) => {
    setStats(prev => {
      const newStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
        currentStreak: won ? prev.currentStreak + 1 : 0,
        maxStreak: won ? Math.max(prev.maxStreak, prev.currentStreak + 1) : prev.maxStreak,
        winPercentage: 0
      };
      newStats.winPercentage = newStats.gamesPlayed ? (newStats.gamesWon / newStats.gamesPlayed) * 100 : 0;
      saveStats(newStats);
      return newStats;
    });
  };

  // Reset game
  const resetGame = async () => {
    console.log('Resetting game...');
    setLoading(true);
    try {
      const word = await getRandomWord();
      setTargetWord(word);
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('playing');
      setLetterStatuses({});
      setShowModal(false);
      setShowStatsModal(false);
      setError('');
      console.log('Game reset with new word:', word);
    } catch (err) {
      setError('Failed to load new word. Please try again.');
      console.error('Reset game error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(`Sign-in failed: ${error.message}`);
      console.error('Sign-in error:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowGame(false);
      setShowStatsModal(false);
      console.log('User signed out');
    } catch (error) {
      setError(`Sign-out failed: ${error.message}`);
      console.error('Sign-out error:', error);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Start game
  const startGame = () => {
    console.log('Starting new game...');
    setShowGame(true);
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!showGame) {
    return (
      <div className="game-container">
        <header className="game-header">
          <div className="header-content">
            <h1 className="header-title">WORDLE</h1>
            <div className="header-icons">
              {user && (
                <button onClick={() => setShowStatsModal(true)} className="btn-icon btn-profile">
                  <User size={24} />
                </button>
              )}
            </div>
          </div>
        </header>
        <WelcomePage onPlay={startGame} onSignIn={handleSignIn} onSignOut={handleSignOut} user={user} stats={stats} onShowRules={() => setShowRules(true)} />
        <Modal isOpen={showRules} onClose={() => setShowRules(false)} title="How to Play">
          <Rules />
        </Modal>
        <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="Your Stats">
          <Stats stats={stats} />
          <button onClick={handleSignOut} className="btn-primary">Sign Out</button>
        </Modal>
      </div>
    );
  }

  return (
    <div className="game-container dark">
      <header className="game-header">
        <div className="header-content">
          <h1 className="header-title">WORDLE</h1>
          <div className="header-icons">
            {user && (
              <button onClick={() => setShowStatsModal(true)} className="btn-icon btn-profile">
                <User size={24} />
              </button>
            )}
          </div>
        </div>
      </header>
      {error && (
        <div className="message-container">
          <div className={`error-message ${error === 'Checking word...' ? 'error-info' : 'error-danger'}`}>
            <AlertCircle size={18} />{error}
          </div>
        </div>
      )}
      {validatingWord && (
        <div className="message-container">
          <div className="error-message error-info">
            <div className="loading-spinner"></div>
            Validating word...
          </div>
        </div>
      )}
      <main className="main-content">
        <Board guesses={guesses} currentGuess={currentGuess} currentRow={guesses.length} />
        <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
      </main>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={gameStatus === 'won' ? '🎉 Congratulations!' : '😞 Game Over'}>
        <div className="modal-message">
          {gameStatus === 'won' ? (
            <>
              <p className="modal-text">You guessed the word in {guesses.length} tries!</p>
              <p className="modal-word">{targetWord}</p>
            </>
          ) : (
            <>
              <p className="modal-text">The word was:</p>
              <p className="modal-word">{targetWord}</p>
            </>
          )}
        </div>
        <Stats stats={stats} onPlayAgain={resetGame} />
      </Modal>
      <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title="Your Stats">
        <Stats stats={stats} />
        <button onClick={handleSignOut} className="btn-primary">Sign Out</button>
      </Modal>
    </div>
  );
};

export default WordleClone;