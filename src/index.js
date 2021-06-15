import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classNames = 'square ' +
    ('square-' + props.id) +
    ((props.isWinningSquare) ? ' winning' : '');

  return (
    <button
      className={classNames}
      onClick={props.onClick}>
        {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        id={i}
        isWinningSquare={(this.props.winningSquares.indexOf(i) >= 0)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = Array(3).fill().map((item, i) => i);
    const cols = Array(3).fill().map((item, i) => i);

    return (
      <div>
      {
        rows.map( (row) => {
          return (
            <div className="board-row">
            {
              cols.map( (col) => {
                const squareId = ((row) * cols.length) + col;
                return this.renderSquare(squareId);
              })
            }
            </div>
          );
        })
      }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        moveSquareId: 0,
      }],
      xIsNext: true,
      stepNumber: 0,
      reverseHistory: false,
    };
  }

  reverseHistory(i) {
    this.setState({
      reverseHistory: !this.state.reverseHistory,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0,
      this.state.stepNumber + 1);
    
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const moveSquareId = i;

    // Do not change states when the game already has been won
    // or when the given square is already filled
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        moveSquareId: moveSquareId,
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
      reverseHistory: this.state.reverseHistory,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: ((step % 2) === 0),
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    var winningSquares = {squares: []};
    const winner = calculateWinner(current.squares, winningSquares);
    const outOfMoves = current.squares.every(s => s);

    const moves = history.map((step, move) => {
      const moveSelected =
        (move === this.state.stepNumber) ? 'selected' : '';
      const moveCol = step.moveSquareId % 3;
      const moveRow = Math.floor(step.moveSquareId / 3);

      const label = move ?
        'Go to move #' + move + ' (row:'+ moveRow + ',col:' + moveCol + ')':
        'Go to game start';
      return (
        <li key={move} className={moveSelected}>
          <button onClick={() => this.jumpTo(move)}>{label}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (outOfMoves) {
      status = 'It\'s a draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winningSquares.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{this.state.reverseHistory ? moves.reverse() : moves}</ol>
          <div>
            <small>
              <button onClick={(i) => this.reverseHistory(i)}>
                reverse history
              </button>
            </small>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares, winningSquares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      if (winningSquares) {
        winningSquares.squares = [a, b, c];
      }

      return squares[a];
    }
  }
  return null;
}
