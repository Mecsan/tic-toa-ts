import React from 'react'
import { board } from '../common/types'

interface PropsTypes {
    board: board,
    handleChange: (e: React.MouseEvent<HTMLDivElement>, idx: number) => void
}

function Board({ board, handleChange }: PropsTypes): React.JSX.Element {
    return (
        <div className="box">
            {
                board.map((val, idx) => {
                    return (
                        <div key={idx} className='boxes'>
                            <div onClick={(e) => handleChange(e, idx)}>
                                {val}
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Board