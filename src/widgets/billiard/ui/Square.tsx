import { useEffect, useRef, useState } from "react";
import useMousePosition from "../lib/hooks/useMousePosition";
import { getBalls } from "../lib/helpers/get-balls";
import { BallType } from "../lib/types/balls";
import "../styles/billiard.css";

interface IProps {
  width: number;
  height: number;
}

export const Square: React.FC<IProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<BallType[]>(getBalls(4, width, height));
  const [coords, handleCoords] = useMousePosition(true);
  const requestRef = useRef<number>(0);
  const selected = useRef<number | null>(null);
  const coordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [open, setOpen] = useState<boolean>(false);

  const drawBalls = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ballsRef.current.forEach((ball) => {
          ctx.beginPath();
          ctx.fillStyle = ball.color;
          ctx?.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
          ctx.fill();
        });

        if (selected.current !== null) {
          const ball = ballsRef.current.find(
            (item) => item.key === selected.current
          );
          if (ball) {
            ctx?.beginPath();
            ctx?.arc(ball.x, ball.y, ball.radius + 10, 0, 2 * Math.PI);
            ctx?.stroke();
            if (coordsRef.current) {
              ctx?.beginPath();
              ctx?.moveTo(ball.x, ball.y);
              ctx?.lineTo(coordsRef.current.x, coordsRef.current.y);
              ctx?.stroke();
            }
          }
        }
      }
    }
  };

  const moveBalls = () => {
    const resist = 0.98;
    ballsRef.current.forEach((ball, index) => {
      // collision check
      if (ball.acceleration.x !== 0 || ball.acceleration.y !== 0) {
        ballsRef.current.forEach((otherBall, otherIndex) => {
          if (otherIndex !== index) {
            let dx = otherBall.x - ball.x;
            let dy = otherBall.y - ball.y;

            var c = Math.sqrt(dx * dx + dy * dy);

            if (c <= ball.radius + otherBall.radius) {
              const angle1 = Math.atan2(
                ball.acceleration.y,
                ball.acceleration.x
              );
              const angle2 = Math.atan2(
                otherBall.acceleration.y,
                otherBall.acceleration.x
              );

              const vel1 = Math.sqrt(
                ball.acceleration.x * ball.acceleration.x +
                  ball.acceleration.y * ball.acceleration.y
              );
              const vel2 = Math.sqrt(
                otherBall.acceleration.x * otherBall.acceleration.x +
                  otherBall.acceleration.y * otherBall.acceleration.y
              );

              const collisionAngle = Math.atan2(dy, dx);

              const aSpeedX =
                ((2 * vel2 * Math.cos(angle2 - collisionAngle)) / 2) *
                  Math.cos(collisionAngle) +
                vel1 *
                  Math.sin(angle1 - collisionAngle) *
                  Math.cos(collisionAngle + Math.PI / 2);
              const aSpeedY =
                ((2 * vel2 * Math.cos(angle2 - collisionAngle)) / 2) *
                  Math.sin(collisionAngle) +
                vel1 *
                  Math.sin(angle1 - collisionAngle) *
                  Math.sin(collisionAngle + Math.PI / 2);

              const bSpeedX =
                ((2 * vel1 * Math.cos(angle1 - collisionAngle)) / 2) *
                  Math.cos(collisionAngle) +
                vel2 *
                  Math.sin(angle2 - collisionAngle) *
                  Math.cos(collisionAngle + Math.PI / 2);
              const bSpeedY =
                ((2 * vel1 * Math.cos(angle1 - collisionAngle)) / 2) *
                  Math.sin(collisionAngle) +
                vel2 *
                  Math.sin(angle2 - collisionAngle) *
                  Math.sin(collisionAngle + Math.PI / 2);

              ball.x =
                otherBall.x -
                Math.round(Math.cos(collisionAngle) * 1000) / 1000 +
                ball.radius +
                otherBall.radius;
              ball.y =
                otherBall.y -
                Math.round(Math.sin(collisionAngle) * 1000) / 1000 +
                ball.radius +
                otherBall.radius;

              ball.acceleration.x = aSpeedX;
              ball.acceleration.y = aSpeedY;
              otherBall.acceleration.x = bSpeedX;
              otherBall.acceleration.y = bSpeedY;
            }
          }
        });
      }

      // bounds check
      if (
        ball.x + ball.radius + ball.acceleration.x > width ||
        ball.x - ball.radius + ball.acceleration.x < 0
      ) {
        ball.acceleration.x *= -1;
      }
      if (
        ball.y + ball.radius + ball.acceleration.y > height ||
        ball.y - ball.radius + ball.acceleration.y < 0
      ) {
        ball.acceleration.y *= -1;
      }
    });
    ballsRef.current.forEach((ball) => {
      if (ball.acceleration.x != 0) {
        ball.x += ball.acceleration.x *= resist;
      }
      if (ball.acceleration.y != 0) {
        ball.y += ball.acceleration.y *= resist;
      }
      if (ball.acceleration.y === 0) ball.y += ball.acceleration.y;
      if (ball.acceleration.x === 0) ball.x += ball.acceleration.x;
    });
  };

  function shoot(ball: BallType, hitPoint: { x: number; y: number }) {
    const speedX = ball.x - hitPoint.x;
    const speedY = ball.y - hitPoint.y;
    ballsRef.current = ballsRef.current.map((bl, index) => {
      if (bl.key === ball.key) {
        return {
          radius: ball.radius,
          x: ball.x + ball.acceleration.x,
          y: ball.y + ball.acceleration.y,
          acceleration: {
            x: speedX,
            y: speedY,
          },
          key: index,
          color: ball.color,
        };
      }
      return bl;
    });
  }

  useEffect(() => {
    // let timerId: number;

    const animate = () => {
      moveBalls();
      // drawBalls();
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, width, height);
        drawBalls();
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      {open && (
        <div className="modal-wrapper">
          <div className="modal-view">
            <input
              type="color"
              onChange={(e) => {
                const ball = ballsRef.current.find(
                  (ball) => ball.key === selected.current
                );
                if (ball) ball.color = e.target.value;
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: "2px solid black" }}
        onClick={(e) => {
          handleCoords(e as unknown as MouseEvent);
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            for (let index = 0; index < ballsRef.current.length; index++) {
              const ball = ballsRef.current[index];
              if (
                Math.pow(coords.x - ball.x, 2) +
                  Math.pow(coords.y - ball.y, 2) <
                Math.pow(ball.radius, 2)
              ) {
                setOpen(true);
              } else {
                if (selected.current != null && selected.current === ball.key) {
                  shoot(ball, { x: coords.x, y: coords.y });
                }
              }
            }
          }
        }}
        onMouseMove={(e) => {
          handleCoords(e as unknown as MouseEvent);
          if (coordsRef.current) {
            coordsRef.current.x = coords.x;
            coordsRef.current.y = coords.y;
          }
          for (let index = 0; index < ballsRef.current.length; index++) {
            const ball = ballsRef.current[index];
            if (
              Math.pow(coords.x - ball.x, 2) + Math.pow(coords.y - ball.y, 2) <
              Math.pow(ball.radius, 2)
            ) {
              selected.current = ball.key;
            }
          }
        }}
      ></canvas>
    </>
  );
};
