'use client';

import { useEffect, useRef } from 'react';

export default function GridMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 80;
    let cols: number, rows: number;
    let grid: Array<Array<{ x: number; y: number; hoverIntensity: number; targetIntensity: number }>> = [];
    let mouseX = -1000;
    let mouseY = -1000;

    const initGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      cols = Math.ceil(canvas.width / gridSize);
      rows = Math.ceil(canvas.height / gridSize);
      
      grid = [];
      for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
          grid[i][j] = {
            x: i * gridSize,
            y: j * gridSize,
            hoverIntensity: 0,
            targetIntensity: 0
          };
        }
      }
    };

    const lerp = (start: number, end: number, t: number) => {
      return start * (1 - t) + end * t;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseCol = Math.floor(mouseX / gridSize);
      const mouseRow = Math.floor(mouseY / gridSize);

      // Update hover effects
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cell = grid[i][j];
          
          // Calculate distance from mouse to cell center
          const cellCenterX = cell.x + gridSize / 2;
          const cellCenterY = cell.y + gridSize / 2;
          const distance = Math.sqrt(
            Math.pow(mouseX - cellCenterX, 2) + 
            Math.pow(mouseY - cellCenterY, 2)
          ) / gridSize;
          
          if (distance <= 4) {
            if (distance < 1) {
              cell.targetIntensity = 1.0;
            } else if (distance < 2) {
              cell.targetIntensity = 0.7;
            } else if (distance < 3) {
              cell.targetIntensity = 0.4;
            } else if (distance < 4) {
              cell.targetIntensity = 0.2;
            } else {
              cell.targetIntensity = 0;
            }
          } else {
            cell.targetIntensity = 0;
          }

          cell.hoverIntensity = lerp(cell.hoverIntensity, cell.targetIntensity, 0.2);
        }
      }

      // Draw gray grid lines
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
      }

      for (let j = 0; j <= rows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * gridSize);
        ctx.lineTo(canvas.width, j * gridSize);
        ctx.stroke();
      }

      // Draw hover effects
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cell = grid[i][j];
          
          if (cell.hoverIntensity > 0.01) {
            const alpha = cell.hoverIntensity * 0.8;
            const strokeWeight = 1 + cell.hoverIntensity * 2;
            
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = strokeWeight;
            ctx.strokeRect(cell.x, cell.y, gridSize, gridSize);
            
            if (cell.hoverIntensity > 0.3) {
              ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.1})`;
              ctx.fillRect(cell.x, cell.y, gridSize, gridSize);
            }
          }
        }
      }

      requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      initGrid();
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    initGrid();
    draw();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
}