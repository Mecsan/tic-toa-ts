import React from 'react'

interface player {
    name: string,
    choice: string,
}

interface propTypes {
    players: [player, player]
}

function Players({ players }: propTypes): React.JSX.Element {
    return (
        <div className="players">
            <div className='player'>
                <div className='h'>{players[0].choice}</div>
                <div className='b'>
                    {players[0].name}
                </div>
            </div>
            <div className='player'>
                <div className='h'>{players[1].choice}</div>
                <div className='b'>
                    {players[1].name}
                </div>
            </div>
        </div>
    )
}

export default Players