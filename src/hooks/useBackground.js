import { useState, useCallback } from 'react';
import { BG_SPEED, CLOUD_SPEED, GAME_WIDTH } from '../constants';

/**
 * Hook quản lý vị trí của các lớp nền khác nhau (Thành phố và Mây)
 */
const useBackground = () => {
    // cityOffset: Vị trí của lớp thành phố
    const [cityOffset, setCityOffset] = useState(0);
    // cloudOffset: Vị trí của lớp mây
    const [cloudOffset, setCloudOffset] = useState(0);

    /**
     * Cập nhật vị trí của cả hai lớp nền với tốc độ khác nhau
     * @param {number} delta: Hệ số thời gian
     */
    const update = useCallback((delta = 1) => {
        setCityOffset((prev) => (prev + (BG_SPEED * delta)) % GAME_WIDTH);
        setCloudOffset((prev) => (prev + (CLOUD_SPEED * delta)) % GAME_WIDTH);
    }, []);

    /**
     * Reset toàn bộ các vị trí nền
     */
    const reset = useCallback(() => {
        setCityOffset(0);
        setCloudOffset(0);
    }, []);

    return { cityOffset, cloudOffset, update, reset };
};

export default useBackground;
