import { useEffect, useRef } from "react";

interface KeyboardState {
  [key: string]: boolean;
}

export const useGameControls = (channel: any, playerNumber: number) => {
  const keysPressed = useRef<KeyboardState>({});
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent default behavior for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
         'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' '].includes(event.key)) {
      event.preventDefault();
    }
    keysPressed.current[event.key] = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keysPressed.current[event.key] = false;
  };

  const updatePlayerPosition = (deltaTime: number) => {
    if (!channel) return;

    let offsetX = 0;
    let offsetY = 0;
    const keys = keysPressed.current;

    // Check vertical movement
    if (keys['ArrowUp'] || keys['w'] || keys['W']) offsetY += 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) offsetY -= 1;

    // Check horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) offsetX -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) offsetX += 1;

    // Normalize diagonal movement
    if (offsetX !== 0 && offsetY !== 0) {
      const magnitude = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      offsetX /= magnitude;
      offsetY /= magnitude;
    }

    // Only send movement if there's actual movement
    if (offsetX !== 0 || offsetY !== 0) {
      channel.push("move_player", {
        player: playerNumber,
        offset: [offsetX, offsetY]
      });
    }

    // Handle space bar separately if needed
    if (keys[' ']) {
      channel.push("kick", {
        player: playerNumber
      });
    }
  };

  const gameLoop = (timestamp: number) => {
    if (!previousTimeRef.current) {
      previousTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - previousTimeRef.current;
    previousTimeRef.current = timestamp;

    updatePlayerPosition(deltaTime);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [channel, playerNumber]); // Only re-run effect if channel or playerNumber changes
};
