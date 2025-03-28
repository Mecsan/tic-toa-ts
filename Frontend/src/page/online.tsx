import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast';
import { Choice, board, Player as player } from '../common/types';
import Select from '../components/select';
import Board from '../components/board';
import { Socket, io } from 'socket.io-client';
import "../css/game.css"

type gameStatus = "initial" | "playing" | "finished";

let initBoard = new Array<Choice>(9).fill('') as board;
let initTurn: Choice = 'O';

interface gameState {
    room: string,
    players: player[],
    board: board,
    turn: Choice,
    status: gameStatus,
}

function Online(): React.JSX.Element {
    let { room } = useParams();
    let name = localStorage.getItem("tictoken");

    if (!name) {
        return <Navigate to='/' />
    }

    let [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io(
            {
                transports: ["websocket"],
                auth: {
                    token: name,
                    room: room
                }
            });
        setSocket(socket);
    }, [])

    let [loading, setloading] = useState<boolean>(true);

    const navigate = useNavigate();
    let [player1, setplayer1] = useState<player | null>(null);
    let [player2, setplayer2] = useState<player | null>(null);

    let [board, setboard] = useState<board>(initBoard);

    let [turn, setturn] = useState<Choice>(initTurn);
    let [status, setStatus] = useState<gameStatus>('initial');
    let [winner, setWinner] = useState<Choice | null>(null);

    useEffect(() => {
        const playerJoined = (data: string) => {
            if (data == player1?.name) return;
            setplayer2(
                {
                    choice: player1?.choice == 'O' ? 'X' : 'O',
                    name: data,
                    isOnline: true
                }
            );
        };

        socket?.on('joined', playerJoined);

        return () => {
            socket?.off('joined', playerJoined);
        }

    }, [player1])

    useEffect(() => {
        if (socket) {

            const moved = (data: { board: board, turn: Choice }) => {
                setboard(data.board);
                setturn(data.turn);
            }

            const started = () => {
                setStatus('playing');
            }

            const restarted = () => {
                setturn(initTurn);
                setboard(initBoard);
                setStatus('initial');
                setWinner(null);
            }

            const selected = (players: player[]) => {
                let player1 = players[0] || null;
                let player2 = players[1] || null;

                if (player1) {
                    //@ts-ignore
                    player1.isOnline = player1?.isOnline === '1';
                }
                if (player2) {
                   //@ts-ignore
                    player2.isOnline = player2?.isOnline === '1';
                }

                if (player1.name == name) {
                    setplayer1(player1);
                    setplayer2(player2);
                } else {
                    setplayer1(player2);
                    setplayer2(player1);
                }
            }

            const handleError = (err: any) => {
                console.log(err);
                toast.error(err.message);
                navigate("/");
            }

            const roomData = (data: gameState) => {
                setloading(false);
                setturn(data.turn);
                setboard(data.board);
                setStatus(data.status);

                if (data?.players[0]?.name == name) {
                    setplayer1(data.players[0]);
                    setplayer2(data.players[1]);
                } else {
                    setplayer1(data.players[1]);
                    setplayer2(data.players[0]);
                }
            }

            const handleDisconnect = () => {
                //@ts-ignore
                setplayer2((pre) => ({ ...pre, isOnline: false }));
            }

            if (import.meta.env.MODE == 'development') {
                socket.onAny((event, ...args) => {
                    console.log(event, args);
                })

                socket.onAnyOutgoing((event, ...args) => {
                    console.log(event, args);
                });
            }

            socket.on("disconnected", handleDisconnect);

            socket.on('roomData', roomData);


            socket.on('selected', selected);

            socket.on('moved', moved);

            socket.on('started', started);

            socket.on('restarted', restarted);

            socket.on('connect_error', handleError);

            return () => {
                socket?.off('selected', selected);
                socket?.off('moved', moved);
                socket?.off('started', started);
                socket?.off('restarted', restarted);
                socket?.off('connect_error', handleError);
                socket?.off('roomData', roomData);
                socket?.off('disconnected', handleDisconnect);
            }
        }
    }, [socket])

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let target = e.target;
        let label = target.dataset.label;
        let value = target.value as Choice;

        let p1: player, p2: player;

        if (label == 'player1') {
            p1 = { ...player1, choice: value } as player
            p2 = { ...player2, choice: value == 'O' ? 'X' : 'O' } as player;
        } else {
            p2 = { ...player2, choice: value } as player;
            p1 = { ...player1, choice: value == 'O' ? 'X' : 'O' } as player;
        }
        console.log(player1, p1, player2, p2)
        setplayer1(p1);
        if (player2) setplayer2(p2);

        // for redis compatibility
        //@ts-ignore
        p1.isOnline = p1.isOnline ? '1' : '0';
        //@ts-ignore
        p2.isOnline = p2.isOnline ? '1' : '0';
        socket?.emit('select', player2 ? [p1, p2] : [p1])
    }

    //@ts-ignore
    function handleBoardChange(e: React.MouseEvent<HTMLDivElement>, idx: number): void {
        if (status == 'initial' || status == 'finished') return;

        if (player1?.choice != turn) return;

        if (board[idx] != '') return;

        let newboard = [...board];
        newboard[idx] = turn;

        let newTurn = turn == 'X' ? 'O' : 'X';
        setboard(newboard as board);
        setturn(newTurn as Choice);

        socket?.emit('move', { board: newboard, turn: newTurn })
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
        // @ts-ignore
        return winner == player1.choice ? player1.name : player2.name;
    }

    function reStart() {
        setturn(initTurn);
        setboard(initBoard);
        setStatus('initial');
        setWinner(null);
        socket?.emit('restart');
    }

    function start() {
        if (!player1 || !player2) {
            toast.error("wait for other player to join");
            return;
        }
        setStatus('playing');
        socket?.emit('start');
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

    if (loading) {
        return <div className="loading">Loading...</div>
    }

    return (
        <div className="game">
            <div>
                <div className="lhs">

                    <div className="selmain">
                        <div className="selection">

                            <div className="players">

                                <Select
                                    lable='player1'
                                    disabled={status !== 'initial' || name !== player1?.name}
                                    player={player1}
                                    handleSelectChange={handleSelectChange}
                                />

                                <Select
                                    lable='player2'
                                    disabled={status !== 'initial' || name !== player2?.name}
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
                                    // @ts-ignore
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

export default Online






