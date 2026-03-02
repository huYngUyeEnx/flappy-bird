import React from 'react';
import { BIRD_SIZE } from '../constants';

/**
 * Component hiển thị chú chim với hiệu ứng xoay dựa trên vận tốc
 * @param {number} top - Tọa độ Y hiện tại
 * @param {number} velocity - Vận tốc hiện tại để tính độ nghiêng
 */
const Bird = ({ top, velocity = 0 }) => {
    // Tính toán góc xoay: Nhảy thì ngẩng lên (-20 độ), rơi thì chúi xuống (tối đa 90 độ)
    const rotation = Math.min(Math.max(velocity * 4, -20), 90);

    return (
        <div
            className="absolute bg-yellow-400 rounded-full border-2 border-black z-40 transition-transform duration-100"
            style={{
                top: `${top}px`,
                left: '50px',
                width: `${BIRD_SIZE}px`,
                height: `${BIRD_SIZE}px`,
                transform: `rotate(${rotation}deg)`,
            }}
        >
            {/* Eye - Mắt chim */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>

            {/* Pointed Beak - Mỏ chim nhọn */}
            <div
                className="absolute top-4 -right-3 w-0 h-0"
                style={{
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderLeft: '12px solid #f97316', // Màu cam (orange-500)
                }}
            ></div>

            {/* Wing - Cánh chim */}
            <div className="absolute top-5 left-1 w-5 h-3 bg-white/70 rounded-full border border-black/20"></div>
        </div>
    );
};

export default Bird;
