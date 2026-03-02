import { useState, useCallback, useRef } from 'react';
import { GRAVITY, JUMP_STRENGTH, BIRD_START_Y } from '../constants';

/**
 * Hook quản lý logic của chim (vật lý, vị trí, nhảy)
 */
const useBird = () => {
    // y: Tọa độ chiều dọc của chim (0 là đỉnh màn hình)
    const [y, setY] = useState(BIRD_START_Y);

    // velocityRef: Vận tốc rơi hiện tại (dùng ref để cập nhật liên tục mà không gây re-render thừa)
    const velocityRef = useRef(0);

    /**
     * Cập nhật vị trí chim dựa trên vận tốc và áp dụng trọng lực
     * @param {number} delta - Hệ số thời gian để ổn định tốc độ trên mọi màn hình
     */
    const update = useCallback((delta = 1) => {
        setY((prevY) => {
            const nextY = prevY + velocityRef.current * delta;
            velocityRef.current += GRAVITY * delta; // Tốc độ rơi tăng dần theo trọng lực
            return nextY;
        });
    }, []);

    /**
     * Đưa vận tốc về giá trị nhảy (âm) và cập nhật Y ngay lập tức để có phản hồi tức thì
     */
    const jump = useCallback(() => {
        velocityRef.current = JUMP_STRENGTH;
        setY((prevY) => prevY + JUMP_STRENGTH); // Nhích lên ngay lập tức
    }, []);

    /**
     * Đưa chim về vị trí ban đầu và dừng rơi (dùng khi restart game)
     */
    const reset = useCallback(() => {
        setY(BIRD_START_Y);
        velocityRef.current = 0;
    }, []);

    return { y, velocity: velocityRef.current, update, jump, reset };
};

export default useBird;
