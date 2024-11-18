"use client";
import { useEffect, useRef } from "react";

export default function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Dimenzije canvasa
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Definirane varijable za igru 
    const paddleWidth = 200;
    const paddleHeight = 10;
    const ballRadius = 8;
    const brickRowCount = 5;
    const brickColumnCount = 14;
    const brickWidth = 90;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;

    let paddleX = (canvas.width - paddleWidth) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;

    const randomAngle = (0.2 + Math.random() * (0.8 - 0.2)) * Math.PI * -1;
    const ballSpeed = 5;
    let ballDX = Math.cos(randomAngle) * ballSpeed;
    let ballDY = Math.sin(randomAngle) * ballSpeed;

    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let bricks = [];
    let gameOver = false;

    // Generiranje svih cigli
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    // Funkcija za crtanje palice
    const drawPaddle = () => {
      //Dodavanje sjenčanja
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5; 

      ctx.fillStyle = "red";
      ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);

      ctx.shadowColor = "transparent";
    };

    // Funkcija za crtnje lopte
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    };

    // Funkcija za crtanje cigli
    const drawBricks = () => {
      const totalBricksWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
      const horizontalOffset = (canvas.width - totalBricksWidth) / 2;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + horizontalOffset;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;

            ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; 
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
            ctx.closePath();

            ctx.shadowColor = "transparent";
          }
        }
      }
    };

    //Funkcija za prikaz poruke za završetak igre
    const drawMessage = (message) => {
      ctx.font = "48px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    };

    // Detekcija sudara sa ciglama
    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r];
          if (brick.status === 1) {
            if (
              ballX + ballRadius > brick.x &&
              ballX - ballRadius < brick.x + brickWidth &&
              ballY + ballRadius > brick.y &&
              ballY - ballRadius < brick.y + brickHeight
            ) {
              if (
                ballX >= brick.x && 
                ballX <= brick.x + brickWidth
              ) {
                ballDY = -ballDY;
              } else {
                ballDX = -ballDX;
              }
              brick.status = 0;
              score++;
              if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
              }
            }
          }
        }
      }
    };

    //Provjera stanja igre
    const checkGameState = () => {
      if (ballY + ballRadius > canvas.height) {
        gameOver = true;
        drawMessage("GAME OVER");
        return true;
      }

      const allBricksCleared = bricks.every(column => column.every(brick => brick.status === 0));
      if (allBricksCleared) {
        gameOver = true;
        drawMessage("VICTORY!");
        return true;
      }

      return false;
    };

    // Funkcija za crtanje rezultata
    const drawScoreboard = () => {
      ctx.font = "16px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`Score: ${score} | High Score: ${highScore}`, canvas.width - 10, 10);
    };

    // Ažuriranje framea
    const update = () => {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawBricks();
      drawPaddle();
      drawBall();
      drawScoreboard();
      collisionDetection();

      ballX += ballDX;
      ballY += ballDY;

      // Detekcija sudara sa zidom
      if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
        ballDX = -ballDX;
      }
      if (ballY - ballRadius < 0) {
        ballDY = -ballDY;
      }

      // Detekcija sudara sa palicom
      if (
        ballY + ballRadius > canvas.height - paddleHeight &&
        ballX > paddleX &&
        ballX < paddleX + paddleWidth
      ) {
        ballDY = -ballDY;
      }

      if (checkGameState()) return;

      requestAnimationFrame(update);
    };

    // Pomicanje palice
    const keyDownHandler = (e) => {
      if (e.key === "ArrowRight") {
        paddleX = Math.min(canvas.width - paddleWidth, paddleX + 20);
      } else if (e.key === "ArrowLeft") {
        paddleX = Math.max(0, paddleX - 20);
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    update();
  }, []);

  return <canvas ref={canvasRef}
    style={{
        display: "block",
        border: "3px solid blue",
        backgroundColor: "white",
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box",
      }}  
    > 
  </canvas>;
}
