import React, { useState } from 'react'
import {useNavigate} from 'react-router-dom'

function OfflineForm(): React.JSX.Element {
    let [player1, setplayer1] = useState<string>("");
    let [player2, setplayer2] = useState<string>("");

    const navigate = useNavigate();

    function handleSubmit(e:React.FormEvent<HTMLInputElement>){
        e.preventDefault();
        if(player1 == "" || player2 == "") return;
        if(player1 == player2) return;
        navigate(`offline?players=${player1},${player2}`);
    }

    return (
        <form onSubmit={() => { }}>
            <div>
                <label htmlFor="player1">Player 1's name : </label>
                <input type="text" name="player1" id="player1"
                    value={player1}
                    onChange={(e) => {
                        setplayer1(e.target.value);
                    }}
                >

                </input>
            </div>
            <div>
                <label htmlFor="player2">player 2's name : </label>
                <input type="text" name="player2" id="player2"
                    value={player2}
                    onChange={(e) => {
                        setplayer2(e.target.value);
                    }}
                ></input>
            </div>
            <input className='submit' type="submit" name='submit' value="Play"  onClick={handleSubmit}></input>
        </form>
    )
}

export default OfflineForm