import React, { useState, useEffect, useRef } from 'react';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import useBird from './hooks/useBird';
import usePipes from './hooks/usePipes';
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

  // passedPipes: Lưu trữ ID các ống đã vượt qua để tính điểm một lần duy nhất mỗi ống
  const passedPipes = useRef(new Set());

  /**
   * Vòng lặp chính của Game (chạy 60 lần/giây)
   */
  useGameLoop((time) => {
    if (gameStarted && !gameOver) {
      updateBird();    // Cập nhật vị trí chim
      updatePipes(time); // Cập nhật vị trí các ống

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
      className="flex items-center justify-center min-h-screen bg-slate-900 select-none"
      onClick={handleAction}
    >
      <div
        className="relative overflow-hidden bg-sky-300 border-4 border-slate-700 shadow-2xl cursor-pointer"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/40 z-50 text-center">
            <p className="text-white text-4xl font-black mb-2 drop-shadow-lg">GAME OVER</p>
            <p className="text-white text-2xl font-bold mb-4">Total Score: {score}</p>
            <button className="text-red-600 px-6 py-2 rounded-full font-bold hover:bg-slate-100 transition-colors">
              Play Again
            </button>
          </div>
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
