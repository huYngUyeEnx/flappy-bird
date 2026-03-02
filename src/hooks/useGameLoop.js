import { useEffect, useRef } from 'react';

const useGameLoop = (callback, isRunning) => {
    const requestRef = useRef();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!isRunning) {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            return;
        }

        let lastTime = performance.now();

        const animate = (time) => {
            // Tính toán Delta Time dựa trên mục tiêu 60FPS
            // Nếu là 60fps, deltaTime ~ 1.0
            // Nếu là 120fps, deltaTime ~ 0.5
            const deltaTime = (time - lastTime) / (1000 / 60);
            lastTime = time;

            if (callbackRef.current) {
                // Chỉ chạy callback nếu deltaTime hợp lệ (tránh nhảy vọt khi quay lại tab)
                callbackRef.current(Math.min(deltaTime, 3.0));
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isRunning]);
};

export default useGameLoop;
