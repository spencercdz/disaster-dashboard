import Link from 'next/link';
import { IconType } from 'react-icons';

interface MenuItemProps {
    title: string;
    address: string;
    Icon: IconType;
}

export default function MenuItem({ title, address, Icon }: MenuItemProps) {
    return (
        <Link href={address} className="flex items-center gap-2">
            <Icon className="text-2xl"/>
            <p className="hidden sm:inline text-xl">{title}</p>
        </Link>
    );
}