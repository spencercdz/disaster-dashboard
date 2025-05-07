import MenuItem from './MenuItem';
import { AiFillHome } from 'react-icons/ai';
import { AiFillInfoCircle } from 'react-icons/ai';

export default function Header() {
    return (
        <div className="flex justify-between p-4 font-[family-name:var(--font-geist-sans)]">
            <div className="flex gap-4 items-center">
                <MenuItem title="Home" address="/" Icon={AiFillHome}/>
                <MenuItem title="About" address="/" Icon={AiFillInfoCircle}/>
            </div>
            <div className="flex gap-1 items-center">
                <span className="text-2xl font-bold py-1 px-2 rounded-lg">DISASTER RESPONSE</span>
            </div>
        </div>
    );
}