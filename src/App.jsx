import React, { useState, useEffect, useRef } from 'react';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import GameOver from './components/GameOver';
import useBird from './hooks/useBird';
import usePipes from './hooks/usePipes';
import useBackground from './hooks/useBackground';
import useGameLoop from './hooks/useGameLoop';
import { GAME_WIDTH, GAME_HEIGHT, BIRD_SIZE, BIRD_START_X, PIPE_WIDTH, PIPE_GAP } from './constants';

/**
 * Component chính điều phối toàn bộ logic và giao diện Game
 */
function App() {
  // gameStarted: Boolean kiểm soát game đang chạy hay ở màn hình chờ
  const [gameStarted, setGameStarted] = useState(false);

  // gameOver: Boolean kiểm soát trạng thái thua cuộc
  const [gameOver, setGameOver] = useState(false);

  // score: Điểm số hiện tại của người chơi
  const [score, setScore] = useState(0);

  // Các custom hooks để quản lý riêng biệt Bird và Pipes
  const { y, velocity, update: updateBird, jump, reset: resetBird } = useBird();
  const { pipes, update: updatePipes, reset: resetPipes } = usePipes();
  const { cityOffset, cloudOffset, update: updateBG, reset: resetBG } = useBackground();

  // passedPipes: Lưu trữ ID các ống đã vượt qua để tính điểm một lần duy nhất mỗi ống
  const passedPipes = useRef(new Set());

  // scale: Tỷ lệ co giãn để vừa với màn hình Mobile
  const [scale, setScale] = useState(1);

  // Tính toán lại tỷ lệ khi màn hình thay đổi
  useEffect(() => {
    const calcScale = () => {
      const padding = 20; // Chừa lề một chút
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - padding;

      const widthScale = availableWidth / GAME_WIDTH;
      const heightScale = availableHeight / GAME_HEIGHT;

      // Chọn tỷ lệ nhỏ hơn để đảm bảo khung game luôn nằm trọn trong màn hình
      const newScale = Math.min(widthScale, heightScale, 1);
      setScale(newScale);
    };

    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  /**
   * Vòng lặp chính của Game (chạy 60 lần/giây)
   */
  useGameLoop((delta) => {
    if (gameStarted && !gameOver) {
      const time = performance.now();
      updateBird(delta);    // Cập nhật vị trí chim với delta
      updatePipes(delta, time); // Cập nhật vị trí các ống với delta và time
      updateBG(delta);      // Cập nhật vị trí nền với delta

      // 1. Kiểm tra va chạm với nền đất (chiều cao 40px)
      if (y + BIRD_SIZE > GAME_HEIGHT - 40) {
        setGameOver(true);
      }

      // 2. Kiểm tra va chạm với từng cặp ống nước
      pipes.forEach(pipe => {
        const birdRight = BIRD_START_X + BIRD_SIZE;
        const birdLeft = BIRD_START_X;
        const birdTop = y;
        const birdBottom = y + BIRD_SIZE;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;
        const pipeTopHeight = pipe.topHeight;
        const pipeBottomY = pipe.topHeight + PIPE_GAP;

        // Logic va chạm hình hộp (AABB Collision)
        if (
          birdRight > pipeLeft &&
          birdLeft < pipeRight &&
          (birdTop < pipeTopHeight || birdBottom > pipeBottomY)
        ) {
          setGameOver(true);
        }

        // 3. Tính điểm: Nếu chim vượt qua cạnh phải của ống và chưa được tính điểm
        if (pipeRight < birdLeft && !passedPipes.current.has(pipe.id)) {
          setScore(prev => prev + 1);
          passedPipes.current.add(pipe.id);
        }
      });
    }
  }, gameStarted && !gameOver);

  /**
   * Xử lý click chuột hoặc gõ phím để Nhảy hoặc Restart
   */
  const handleAction = () => {
    // Nếu game kết thúc -> Reset toàn bộ trạng thái để chơi lại
    if (gameOver) {
      setGameOver(false);
      setGameStarted(false);
      setScore(0);
      passedPipes.current.clear();
      resetBird();
      resetPipes();
      resetBG();
      return;
    }

    // Bắt đầu game nếu đang ở màn hình chờ
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Chim nhảy lên
    jump();
  };

  /**
   * Lắng nghe sự kiện phím cách (Space) từ bàn phím
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-slate-900 select-none overflow-hidden touch-none"
      onPointerDown={handleAction}
    >
      <div
        className="relative overflow-hidden bg-sky-300 shadow-2xl transition-transform duration-300"
        style={{
          width: `${GAME_WIDTH}px`,
          height: `${GAME_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: scale < 1 ? '0' : '1rem' // Tràn viền trên Mobile, bo góc trên PC
        }}
      >
        {/* Layer 1: Clouds (Slowest parallax) */}
        <div
          className="absolute top-20 flex opacity-40 pointer-events-none"
          style={{ width: `${GAME_WIDTH * 2}px`, transform: `translateX(-${cloudOffset}px)` }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-around flex-1 h-20 items-start">
              <div className="w-16 h-8 bg-white rounded-full blur-md"></div>
              <div className="w-24 h-10 bg-white rounded-full blur-lg mt-10"></div>
              <div className="w-20 h-8 bg-white rounded-full blur-md mt-4"></div>
            </div>
          ))}
        </div>

        {/* Layer 2: City Landscape (Slower parallax) */}
        <div
          className="absolute bottom-10 flex h-32 opacity-30 pointer-events-none"
          style={{ width: `${GAME_WIDTH * 2}px`, transform: `translateX(-${cityOffset}px)` }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-end space-x-1 flex-1 h-full">
              <div className="w-12 h-20 bg-slate-600 rounded-t-sm"></div>
              <div className="w-16 h-28 bg-slate-700 rounded-t-sm"></div>
              <div className="w-10 h-16 bg-slate-600 rounded-t-sm"></div>
              <div className="w-20 h-24 bg-slate-800 rounded-t-sm"></div>
              <div className="w-14 h-32 bg-slate-700 rounded-t-sm"></div>
            </div>
          ))}
        </div>
        {/* Lớp hiển thị Điểm số */}
        <div className="absolute top-10 w-full text-center z-50">
          <span className="text-white text-6xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
            {score}
          </span>
        </div>

        {/* Màn hình Hướng dẫn (Chỉ hiện khi chưa bắt đầu) */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-50 text-center">
            <p className="text-white text-3xl font-bold mb-4 drop-shadow-lg uppercase tracking-widest">Flappy Bird</p>
            <p className="text-white text-xl animate-bounce">Click or Space to Start</p>
          </div>
        )}

        {/* Màn hình Thua cuộc */}
        {gameOver && (
          <GameOver score={score} onRestart={handleAction} />
        )}

        {/* Vẽ các Ống nước rà soát qua mảng pipes */}
        {pipes.map(pipe => (
          <Pipe key={pipe.id} x={pipe.x} topHeight={pipe.topHeight} />
        ))}

        {/* Vẽ Chú chim */}
        <Bird top={y} velocity={velocity} />

        {/* Vẽ Nền đất tĩnh */}
        <div
          className="absolute bottom-0 w-full bg-[#ded895] border-t-4 border-[#73bf2e] z-30"
          style={{ height: '40px' }}
        >
          <div className="w-full h-2 bg-[#543847] opacity-20 mt-4"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
