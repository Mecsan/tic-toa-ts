import React, { useState } from 'react'
import "../css/form.css"
import OnlineForm from '../components/onlineform';
import OfflineForm from '../components/offlineform';
type MODE = 'online' | 'offline' | 'none';

function Form(): React.JSX.Element {

    let [mode, setmode] = useState<MODE>('none');

    let setOnline = () => setmode('online');
    let setOfline = () => setmode('offline');


    return (
        <div className="mainform">
            <div className="online">
                <button className='pointer' onClick={setOnline}>online</button>
                {
                    mode == 'online' &&
                    <OnlineForm />
                }
            </div>
            <div className="offline">
                <button className='pointer' onClick={setOfline}>offline</button>
                {mode == 'offline' &&
                    <OfflineForm />
                }
            </div>
        </div>
    )
}

export default Form