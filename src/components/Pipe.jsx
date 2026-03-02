import React from 'react';
import { PIPE_WIDTH, PIPE_GAP, GAME_HEIGHT } from '../constants';

const Pipe = ({ x, topHeight }) => {
    const bottomHeight = GAME_HEIGHT - topHeight - PIPE_GAP - 40; // 40 là chiều cao ground

    return (
        <>
            {/* Top Pipe */}
            <div
                className="absolute bg-green-500 border-x-4 border-b-4 border-green-800 rounded-b-lg"
                style={{
                    left: `${x}px`,
                    top: 0,
                    width: `${PIPE_WIDTH}px`,
                    height: `${topHeight}px`,
                }}
            >
                <div className="absolute bottom-2 left-0 w-full h-4 bg-green-600 border-y-2 border-green-900"></div>
            </div>

            {/* Bottom Pipe */}
            <div
                className="absolute bg-green-500 border-x-4 border-t-4 border-green-800 rounded-t-lg"
                style={{
                    left: `${x}px`,
                    bottom: '40px', // Đặt trên ground
                    width: `${PIPE_WIDTH}px`,
                    height: `${bottomHeight}px`,
                }}
            >
                <div className="absolute top-2 left-0 w-full h-4 bg-green-600 border-y-2 border-green-900"></div>
            </div>
        </>
    );
};

export default Pipe;
