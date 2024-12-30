# app.py
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

# Store the game state
games = {}

# Winning combinations
WINNING_COMBINATIONS = [
    [0, 1, 2],  # Row 1
    [3, 4, 5],  # Row 2
    [6, 7, 8],  # Row 3
    [0, 3, 6],  # Column 1
    [1, 4, 7],  # Column 2
    [2, 5, 8],  # Column 3
    [0, 4, 8],  # Diagonal \
    [2, 4, 6],  # Diagonal /
]

def check_winner(board):
    for combo in WINNING_COMBINATIONS:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != '':
            return board[combo[0]]  # Return the winner ('X' or 'O')
    if '' not in board:
        return 'Draw'  # Return 'Draw' if no empty spaces left
    return None  # No winner yet

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):
    game_id = data['game_id']
    player_symbol = data['player_symbol']
    if game_id not in games:
        games[game_id] = {'board': ['', '', '', '', '', '', '', '', ''], 'current_player': 'X'}
    emit('game_state', games[game_id], broadcast=True)

@socketio.on('make_move')
def handle_make_move(data):
    game_id = data['game_id']
    index = data['index']
    player_symbol = data['player_symbol']
    
    if games[game_id]['board'][index] == '':
        games[game_id]['board'][index] = player_symbol
        winner = check_winner(games[game_id]['board'])
        
        if winner:
            games[game_id]['winner'] = winner  # Store the winner
        else:
            games[game_id]['current_player'] = 'O' if player_symbol == 'X' else 'X'
        
        emit('game_state', games[game_id], broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)