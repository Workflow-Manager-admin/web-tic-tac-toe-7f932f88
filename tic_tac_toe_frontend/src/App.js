import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Minimalistic Tic Tac Toe app with a light, centered layout.
 * Features:
 *  - Play against another user or computer
 *  - Display game board and moves
 *  - Status, win/lose/draw messages, restart button
 */

/** Helpers **/
const EMPTY_BOARD = Array(9).fill(null);
const players = { human: 'X', computer: 'O', X: 'X', O: 'O' };

// PUBLIC_INTERFACE
function checkWinner(board) {
  /** Returns "X", "O", or null, and indices of the winning line, or "draw". */
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a, b, c] of lines) {
    if (
      board[a] && board[a] === board[b] && board[a] === board[c]
    ) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(square => square)) {
    return { winner: "draw" };
  }
  return { winner: null };
}

// PUBLIC_INTERFACE
function getAvailableMoves(board) {
  /** Returns array of empty cell indices */
  return board.map((cell, idx) => cell ? null : idx).filter(idx => idx !== null);
}

// PUBLIC_INTERFACE
function getStatusText(gameMode, board, xIsNext, winnerObj, computerIsPlaying) {
  /** Returns user-friendly game status text */
  if (winnerObj && winnerObj.winner === "draw") return "It's a draw!";
  if (winnerObj && winnerObj.winner) {
    return `Winner: ${winnerObj.winner === "X" ? "X" : "O"} 🎉`;
  }
  if (gameMode === "pvp") {
    return xIsNext ? "Player X's turn" : "Player O's turn";
  } else {
    return xIsNext ? "Your turn (X)" : (computerIsPlaying ? "Computer thinking..." : "Computer's turn (O)");
  }
}

/** Component: Square */
function Square({ value, onClick, isWinning }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      style={{
        color: value === "X" ? "#1976D2" : "#FF9800",
        background: isWinning ? "#FFEB3B33" : "transparent",
        fontWeight: isWinning ? "bold" : "normal"
      }}
      aria-label={value ? `Square ${value}` : "Empty square"}
    >
      {value}
    </button>
  );
}

/** Component: Board */
function Board({ board, onPlay, winningLine, disabled }) {
  // Minimalistic: 3x3 grid, gap, centered
  function renderSquare(idx) {
    return (
      <Square
        key={idx}
        value={board[idx]}
        isWinning={winningLine && winningLine.includes(idx)}
        onClick={() => !board[idx] && !disabled && onPlay(idx)}
      />
    );
  }
  return (
    <div className="ttt-board">
      {[0,3,6].map(row =>
        <div className="ttt-board-row" key={row}>
          { [0,1,2].map(offset => renderSquare(row + offset)) }
        </div>
      )}
    </div>
  );
}

function App() {
  // Game state
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState("pvp"); // "pvp" or "computer"
  const [winnerObj, setWinnerObj] = useState({ winner: null });
  const [computerIsPlaying, setComputerIsPlaying] = useState(false);

  // Effect: Check for winner after board updates
  useEffect(() => {
    const result = checkWinner(board);
    setWinnerObj(result);

    // Initiate computer move if appropriate
    if (
      gameMode === "computer"
      && !result.winner
      && !xIsNext
      && !computerIsPlaying
    ) {
      setComputerIsPlaying(true);
      setTimeout(() => {
        const move = getComputerMove(board);
        if (move !== undefined) {
          handleMove(move);
        }
        setComputerIsPlaying(false);
      }, 550); // make computer "think" a bit
    }
  // eslint-disable-next-line
  }, [board, xIsNext, gameMode]); // ignore computerIsPlaying

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    // If the game is over or square taken, ignore
    if (winnerObj && winnerObj.winner) return;
    if (board[idx]) return;

    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  /** Very simple AI: Pick first available cell, or block win if possible. */
  // PUBLIC_INTERFACE
  function getComputerMove(currentBoard) {
    // Block or win move
    const empty = getAvailableMoves(currentBoard);
    // Try to win
    for (const idx of empty) {
      const test = currentBoard.slice();
      test[idx] = "O";
      if (checkWinner(test).winner === "O") return idx;
    }
    // Try to block X
    for (const idx of empty) {
      const test = currentBoard.slice();
      test[idx] = "X";
      if (checkWinner(test).winner === "X") return idx;
    }
    // Otherwise, pick center, then corners, then anything
    if (empty.includes(4)) return 4;
    const corners = empty.filter(i => [0,2,6,8].includes(i));
    if (corners.length > 0) return corners[0];
    return empty[0];
  }

  function handleRestart() {
    setBoard(EMPTY_BOARD);
    setXIsNext(true);
    setWinnerObj({ winner: null });
    setComputerIsPlaying(false);
  }

  function handleModeChange(e) {
    setGameMode(e.target.value);
    handleRestart();
  }

  // UI layout: centered, status on top, board, action buttons
  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="ttt-root" style={{
        margin: "auto",
        padding: "2rem",
        background: "var(--bg-secondary)",
        borderRadius: 18,
        boxShadow: "0 4px 24px 0 #e9ecef7c",
        maxWidth: 340,
        minWidth: 280
      }}>
        <h2 style={{ marginBottom: "0.7em", fontWeight: 700, letterSpacing: 1 }}>Tic Tac Toe</h2>
        <div className="ttt-status" style={{
          minHeight: 32,
          fontSize: 18,
          color: "var(--text-primary)",
          marginBottom: "1em"
        }}>{getStatusText(gameMode, board, xIsNext, winnerObj, computerIsPlaying)}</div>
        <Board 
          board={board}
          onPlay={handleMove}
          winningLine={winnerObj.line}
          disabled={winnerObj.winner || (gameMode === "computer" && !xIsNext)}
        />
        <div style={{display: "flex", justifyContent: "center", gap: 14, marginTop: 24}}>
          <button className="ttt-btn" style={{ background: "#1976D2", color: "#fff" }} onClick={handleRestart}>Restart</button>
          <select
            className="ttt-mode-select"
            value={gameMode}
            style={{
              appearance: "none",
              background: "#f8f9fa",
              border: "1px solid #dadada",
              borderRadius: 5,
              padding: "7.5px 2.5em 7.5px 0.9em",
              color: "#282c34",
              fontWeight: 500,
              fontSize: "1em",
              cursor: "pointer"
            }}
            onChange={handleModeChange}
            disabled={computerIsPlaying}
            aria-label="Game mode"
          >
            <option value="pvp">2 Players</option>
            <option value="computer">vs Computer</option>
          </select>
        </div>
      </div>

      {/* Minimalistic footer */}
      <footer style={{ textAlign: "center", marginTop: 40, color: "#a3a3a3", fontSize: 13 }}>
        &copy; {new Date().getFullYear()} Minimal Tic Tac Toe
      </footer>
    </div>
  );
}

export default App;
