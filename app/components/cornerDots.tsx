import React from 'react';

interface CornerDotsProps {
    color?: string;
    size?: number; // Dot size in pixels
}

const CornerDots: React.FC<CornerDotsProps> = ({ color = 'white', size = 4 }) => {
    const dotStyle = {
        backgroundColor: color,
        width: size,
        height: size,
    };

    return (
        <>
            {/* Top-left */}
            <div className="absolute  -top-1 -left-1" style={dotStyle} />
            {/* Top-right */}
            <div className="absolute  -top-1 -right-1" style={dotStyle} />
            {/* Bottom-left */}
            <div className="absolute  -bottom-1 -left-1" style={dotStyle} />
            {/* Bottom-right */}
            <div className="absolute  -bottom-1 -right-1" style={dotStyle} />
        </>
    );
};

export default CornerDots;
