import React, { useEffect, useState } from 'react'
import "../css/game.css"
import { Navigate, useSearchParams } from 'react-router-dom'
import Board from '../components/board';
import { Choice, Player, board, player } from '../common/types';
import Select from '../components/select';
import toast from 'react-hot-toast';

type gameStatus = "initial" | "playing" | "finished";

let initBoard = new Array<Choice>(9).fill('') as board;
let initTurn: Choice = 'O';

function Offline(): React.JSX.Element {
    let [query] = useSearchParams();
    let players = query.get('players')?.split(",");

    if (!players) {
        return <Navigate to='/' />
    }

    if (players.length != 2) {
        return <Navigate to='/' />
    }

    if (players[0] == players[1]) {
        console.log("players name should be different");
        return <Navigate to='/' />
    }

    let [player1, setplayer1] = useState<player>(new Player(players[0], 'X'));
    let [player2, setplayer2] = useState<player>(new Player(players[1], 'O'));

    let [board, setboard] = useState<board>(initBoard);

    let [turn, setturn] = useState<Choice>(initTurn);
    let [status, setStatus] = useState<gameStatus>('initial');
    let [winner, setWinner] = useState<Choice | null>(null);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (status !== 'initial') return;
        let target = e.target;
        let curr = target.value as Choice;
        if (target.dataset.label == 'player1') {
            setplayer1((prev) => ({ ...prev, choice: curr }));
            setplayer2((prev) => ({ ...prev, choice: curr == 'X' ? 'O' : 'X' }));
        } else {
            setplayer2((prev) => ({ ...prev, choice: curr }));
            setplayer1((prev) => ({ ...prev, choice: curr == 'X' ? 'O' : 'X' }));
        }
    }

    //@ts-ignore
    function handleBoardChange(e: React.MouseEvent<HTMLDivElement>, idx: number): void {
        if (status == 'initial' || status == 'finished') return;

        if (board[idx] != '') return;

        setboard((prev): board => {
            let newboard = [...prev];
            newboard[idx] = turn;
            return newboard as board;
        });
        setturn((prev) => prev == 'X' ? 'O' : 'X');
    }

    function checkWinner(board: board): string | null {
        let winner = null;
        let winningCombination = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
            [0, 4, 8], [2, 4, 6] // diagonal

        ];
        winningCombination.forEach((curr) => {
            if (board[curr[0]] == board[curr[1]] && board[curr[1]] == board[curr[2]] && board[curr[0]] != '') {
                winner = board[curr[0]];
            }
        });
        return winner;
    }

    function getWinner(winner: Choice): string {
        return winner == player1.choice ? player1.name : player2.name;
    }

    function reStart() {
        setturn(initTurn);
        setboard(initBoard);
        setStatus('initial');
        setWinner(null);
    }

    function start() {
        setStatus('playing');
    }

    useEffect(() => {
        let winner = checkWinner(board) as Choice;
        if (winner != null) {
            setStatus('finished');
            setWinner(winner);
            toast(`${getWinner(winner)} won`, {
                icon: '👏',
            });
        }

        if (winner == null && board.every((curr) => curr != '')) {
            setStatus('finished');
            toast(`game drawn`, {
                icon: '🤝',
            });
        }

    }, [board]);

    return (
        <div className="game">
            <div>

                <div className="lhs">

                    <div className="selmain">
                        <div className="selection">

                            <div className="players">

                                <Select
                                    disabled={status != 'initial'}
                                    lable='player1'
                                    player={player1}
                                    handleSelectChange={handleSelectChange}
                                />

                                <Select
                                    disabled={status != 'initial'}
                                    lable='player2'
                                    player={player2}
                                    handleSelectChange={handleSelectChange}
                                />

                            </div>
                        </div>
                    </div>


                    {
                        status == 'initial' &&
                        <div className='btn' onClick={start}>Start game</div>
                    }


                    {
                        status == 'playing' &&
                        <>
                            <div className='btn' onClick={reStart}>Re-start game</div>
                            <div className="msg">
                                {
                                    turn == player1.choice ? `${player1.name}'s turn` : `${player2.name}'s turn`
                                }
                            </div>
                        </>
                    }

                    {status == 'finished' ?
                        winner != null ?
                            <div className="winnermsg">{getWinner(winner)} won</div>
                            :
                            <div className="msg">game drawn</div>
                        : null
                    }

                    {
                        status == "finished"
                        &&
                        <div className='btn' onClick={reStart}>Play again</div>
                    }


                    <div></div>
                </div>

                <div className="rhs">
                    <Board
                        handleChange={handleBoardChange}
                        board={board}
                    />
                </div>

            </div>

        </div>
    )
}

export default Offline