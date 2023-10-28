import React from 'react';
import { player } from '../common/types';

interface PropsTypes {
    player1: player | null,
    player2: player | null,
    disabled?: boolean,
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function Select({ player1, player2, disabled = false, handleSelectChange }: PropsTypes): React.JSX.Element {
    return (
        <div className="selmain">
            <div className="selection">

                <div className="players">
                    {player1 && <div className={player1.isOnline ? "player online" : "player offline"}>
                        <div className='b' >
                            {player1.name}
                        </div>
                        <select data-label="player1" value={player1.choice}
                            className={disabled ? 'disabled' : 'nornaml'}
                            disabled={disabled}
                            onChange={handleSelectChange}
                        >
                            <option value="X">X</option>
                            <option value="O">O</option>
                        </select>
                    </div>}
                    {player2 && <div className={player2.isOnline ? "player online" : "player offline"}>
                        <div className="b">
                            {player2.name}
                        </div>

                        <select data-label="player2" value={player2.choice}
                            className={disabled ? 'disabled' : 'nornaml'}
                            disabled={disabled}
                            onChange={handleSelectChange}
                        >
                            <option value="X">X</option>
                            <option value="O">O</option>
                        </select>
                    </div>}
                </div>
            </div>
        </div>
    )
}

export default Select