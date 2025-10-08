import React, { useEffect, useState } from 'react';
import getInitialsApi from './utils/getInitialsApi';

const Avatar = ({ name, size = "w-14 h-14", textSize = "text-xl" }) => {
    const [initials, setInitials] = useState('');
    const [loading, setLoading] = useState(true);
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-indigo-100 text-indigo-700',
        'bg-purple-100 text-purple-700',
        'bg-amber-100 text-amber-700',
        'bg-red-100 text-red-700',
        'bg-sky-100 text-sky-700',
        'bg-teal-100 text-teal-700',
    ];
    const colorClass = colors[Math.abs(hash) % colors.length];

    useEffect(() => {
        setLoading(true);
        getInitialsApi(name, 1000).then((result) => {
            setInitials(result);
            setLoading(false);
        });
    }, [name]);

    return (
        <div className={`${size} rounded-full flex items-center justify-center font-bold ${textSize} ${colorClass}`}>
            {loading ? <span className="animate-pulse text-gray-400">...</span> : initials}
        </div>
    );
};
export default Avatar;
