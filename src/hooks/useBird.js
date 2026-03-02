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
     */
    const update = useCallback(() => {
        setY((prevY) => {
            const nextY = prevY + velocityRef.current;
            velocityRef.current += GRAVITY; // Tốc độ rơi tăng dần theo trọng lực
            return nextY;
        });
    }, []);

    /**
     * Đưa vận tốc về giá trị nhảy (âm) để đẩy chim lên trên
     */
    const jump = useCallback(() => {
        velocityRef.current = JUMP_STRENGTH;
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
