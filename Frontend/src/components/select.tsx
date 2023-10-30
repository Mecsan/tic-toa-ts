import React from 'react';
import { player } from '../common/types';

interface PropsTypes {
    player: player | null,
    lable?: string,
    disabled?: boolean,
    handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function Select({ player, disabled = false, lable = '', handleSelectChange, }: PropsTypes) {
    return <>
        {player && <div className={player.isOnline ? "player online" : "player offline"}>
            <div className='b' >
                {player.name}
            </div>
            <select data-label={lable} value={player.choice}
                className={disabled ? 'disabled' : 'nornaml'}
                disabled={disabled}
                onChange={handleSelectChange}
            >
                <option value="X">X</option>
                <option value="O">O</option>
            </select>
        </div>}
    </>
}

export default Select