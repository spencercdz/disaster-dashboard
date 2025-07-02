import MenuItem from './MenuItem';
import { AiFillHome } from 'react-icons/ai';
import { AiFillMessage } from "react-icons/ai";
import { AiFillFilePdf } from "react-icons/ai";

export default function Header() {
    return (
        <div className="flex container-default justify-between p-2">
            <div className="font-semibold flex gap-4 items-center">
                <MenuItem title="Home" address="/" Icon={AiFillHome}/>
                <MenuItem title="Chatbot" address="/" Icon={AiFillMessage}/>
                <MenuItem title="Reports" address="/" Icon={AiFillFilePdf}/>
            </div>
            <div className="flex gap-1 items-center">
                <span className="font-bold text-2xl rounded-lg">Dashboard Home</span>
            </div>
        </div>
    );
}