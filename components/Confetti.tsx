import React, { useState, useEffect } from 'react';

const CONFETTI_COUNT = 50;
const COLORS = ['bg-yellow-300', 'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-red-400'];

const Confetti: React.FC = () => {
    const [pieces, setPieces] = useState<React.ReactNode[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const generatedPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
            };
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = Math.random() > 0.5 ? 'w-2 h-2' : 'w-1.5 h-3';
            const rotation = Math.random() > 0.5 ? 'rotate-45' : '';

            return (
                <div
                    key={i}
                    className={`confetti-piece absolute top-0 ${color} ${size} ${rotation}`}
                    style={style}
                />
            );
        });
        setPieces(generatedPieces);

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 4000); // Confetti lasts for 4 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return null;
    }

    return <div className="absolute inset-0 pointer-events-none z-10">{pieces}</div>;
};

export default Confetti;
