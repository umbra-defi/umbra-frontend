import React from 'react';

interface CornerBordersProps {
    color?: string;
    size?: number; // Size in pixels for corner length
    thickness?: number; // Thickness of the border lines
}

const CornerBorders: React.FC<CornerBordersProps> = ({
    color = 'white',
    size = 8,
    thickness = 2,
}) => {
    const horizontalStyle = {
        backgroundColor: color,
        width: size,
        height: thickness,
    };

    const verticalStyle = {
        backgroundColor: color,
        width: thickness,
        height: size,
    };

    return (
        <>
            {/* Top-left */}
            <div style={{ ...horizontalStyle }} className="absolute top-0 left-0" />
            <div style={{ ...verticalStyle }} className="absolute top-0 left-0" />

            {/* Top-right */}
            <div style={{ ...horizontalStyle }} className="absolute top-0 right-0" />
            <div style={{ ...verticalStyle }} className="absolute top-0 right-0" />

            {/* Bottom-left */}
            <div style={{ ...horizontalStyle }} className="absolute bottom-0 left-0" />
            <div style={{ ...verticalStyle }} className="absolute bottom-0 left-0" />

            {/* Bottom-right */}
            <div style={{ ...horizontalStyle }} className="absolute bottom-0 right-0" />
            <div style={{ ...verticalStyle }} className="absolute bottom-0 right-0" />
        </>
    );
};

export default CornerBorders;
