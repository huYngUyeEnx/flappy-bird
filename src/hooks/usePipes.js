import { useState, useCallback, useRef } from 'react';
import { PIPE_SPEED, PIPE_SPAWN_RATE, GAME_WIDTH, GAME_HEIGHT, PIPE_GAP } from '../constants';

/**
 * Hook quản lý danh sách và chuyển động của các ống nước
 */
const usePipes = () => {
    // pipes: Mảng chứa thông tin các cặp ống đang hiển thị [{x, topHeight, id}, ...]
    const [pipes, setPipes] = useState([]);

    // lastSpawnTime: Lưu mốc thời gian cuối cùng tạo ống để kiểm tra tần suất sinh ống
    const lastSpawnTime = useRef(0);

    /**
     * Cập nhật logic ống nước: di chuyển sang trái và tạo ống mới
     * @param {number} delta: Hệ số thời gian
     * @param {number} time: Thời gian từ requestAnimationFrame
     */
    const update = useCallback((delta = 1, time = 0) => {
        setPipes((prevPipes) => {
            let newPipes = prevPipes;

            // 1. Kiểm tra nếu đến lúc cần tạo cặp ống mới
            if (time - lastSpawnTime.current > PIPE_SPAWN_RATE) {
                const minPipeHeight = 50;
                const maxPipeHeight = GAME_HEIGHT - PIPE_GAP - minPipeHeight - 40;

                // topHeight: Chiều cao ngẫu nhiên của ống phía trên
                const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

                newPipes = [...prevPipes, { x: GAME_WIDTH, topHeight, id: Date.now() }];
                lastSpawnTime.current = time;
            }

            // 2. Di chuyển tất cả ống sang trái dựa trên PIPE_SPEED * delta
            return newPipes
                .map((pipe) => ({ ...pipe, x: pipe.x - (PIPE_SPEED * delta) }))
                .filter((pipe) => pipe.x > -100);
        });
    }, []);

    /**
     * Xóa sạch danh sách ống (dùng khi restart game)
     */
    const reset = useCallback(() => {
        setPipes([]);
        lastSpawnTime.current = 0;
    }, []);

    return { pipes, update, reset };
};

export default usePipes;
