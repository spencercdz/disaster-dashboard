import MenuItem from './MenuItem';
import { AiFillHome } from 'react-icons/ai';
import { AiFillMessage } from "react-icons/ai";
import { AiFillFilePdf } from "react-icons/ai";

export default function Header() {
    return (
        <div className="flex container-default justify-between p-2 font-[family-name:var(--font-geist-mono)]">
            <div className="flex gap-4 items-center">
                <MenuItem title="Home" address="/" Icon={AiFillHome}/>
                <MenuItem title="Chatbot" address="/" Icon={AiFillMessage}/>
                <MenuItem title="Reports" address="/" Icon={AiFillFilePdf}/>
            </div>
            <div className="flex gap-1 items-center">
                <span className="text-2xl font-bold py-1 px-2 rounded-lg">SENTIMENT MONITORING</span>
            </div>
        </div>
    );
}