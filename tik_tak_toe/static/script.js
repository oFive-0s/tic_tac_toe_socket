// static/script.js
const socket = io();

let playerSymbol;
let gameId;
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer;

document.getElementById('hostButton').onclick = function() {
    gameId = prompt("Enter a game ID to host:");
    playerSymbol = 'X';
    socket.emit('join', { game_id: gameId, player_symbol: playerSymbol });
    hideButtons();
};

document.getElementById('joinButton').onclick = function() {
    gameId = prompt("Enter a game ID to join:");
    playerSymbol = 'O';
    socket.emit('join', { game_id: gameId, player_symbol: playerSymbol });
    hideButtons();
};

function hideButtons() {
    document.getElementById('hostButton').style.display = 'none';
    document.getElementById('joinButton').style.display = 'none';
}

socket.on('game_state', function(data) {
    board = data.board;
    currentPlayer = data.current_player;
    updateBoard();
    checkGameStatus(data);
});

function updateBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    board.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        cellDiv.innerText = cell;
        cellDiv.onclick = () => makeMove(index);
        boardDiv.appendChild(cellDiv);
    });
}

function makeMove(index) {
    if (board[index] === '' && currentPlayer === playerSymbol) {
        socket.emit('make_move', { game_id: gameId, index: index, player_symbol: playerSymbol });
    }
}

function checkGameStatus(data) {
    const statusDiv = document.getElementById('status');
    if (data.winner) {
        if (data.winner === 'Draw') {
            statusDiv.innerText = "It's a Draw!";
        } else {
            statusDiv.innerText = `${data.winner} wins!`;
        }
        // Restart the game after a short delay
        setTimeout(() => {
            restartGame();
        }, 2000); // 2 seconds delay before restarting
    } else {
        statusDiv.innerText = `${currentPlayer}'s turn`;
    }
}

function restartGame() {
    // Reset the board and current player
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = playerSymbol === 'X' ? 'X' : 'O'; // Reset to the starting player
    socket.emit('restart_game', { game_id: gameId });
}