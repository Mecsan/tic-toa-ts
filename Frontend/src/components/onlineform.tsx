import React, {  useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function OnlineForm(): React.JSX.Element {
    let [name, setname] = useState<string>('');
    let [room, setroom] = useState<string>('');

    const navigate = useNavigate();
    const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setname(e.target.value)
    }

    const changeRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
        setroom(e.target.value);
    }

    const createRoom = async (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        let id = toast.loading('Creating room');
        let body = {
            userName: name,
            roomName: room
        }

        try {
            let res = await fetch("/api/room/create", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });
            let data = await res.json();
            if (!res.ok) {
                toast.error(data.error, { id });
                return;
            }
            toast.success('Room Created', { id });
            localStorage.setItem("tictoken", name);
            navigate("/online/" + room);
        } catch (e) {
            toast.error("Something went wrong", { id });
        }
    }

    const joinRoom = async (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        let id = toast.loading('Joining room');

        let body = {
            userName: name,
            roomName: room
        }

        try {
            let res = await fetch("/api/room/join", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });
            let data = await res.json();
            if (!res.ok) {
                toast.error(data.error, { id });
                return;
            }
            toast.success('Joined room', { id });
            localStorage.setItem("tictoken", name);
            navigate("/online/" + room);
        } catch (e) {
            toast.error("Something went wrong", { id });
        }
    }


    return (
        <form className='onlineform'>
            <div>
                <label htmlFor="p1">your name : </label>
                <input type="text"
                    value={name}
                    onChange={changeName}
                ></input>
            </div>
            <div>
                <label htmlFor="p1">Room name : </label>
                <input type="text"
                    value={room}
                    onChange={changeRoom}
                ></input>
            </div>
            <div className='flex'>
                <input type="submit" className='submit' onClick={createRoom} value="Create">
                </input>
                <input type="submit" className='submit' onClick={joinRoom} value="Join">
                </input>
            </div>
        </form>
    )
}

export default OnlineForm