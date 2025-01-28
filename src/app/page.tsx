"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

import GUI from 'lil-gui';
import { Socket } from 'phoenix';

import { Mesh, Vector3 } from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import Court from '@/components/core/Court';
import Sphere from '@/components/core/Sphere';

import Effects from '@/components/effects/Effects';
import Lighting from '@/components/lighting/Lighting';

import SpaceBackground from '@/components/background/SpaceBackground';

import PlayerProps from '@/types';

const SCENE_CONFIGURATION = {
  canvasProps: {
    height: '100vh', width: '100vw'
  },
  cameraProps: {
    fov: 10, //Field of Vision
    position: [0, 0, 500]
  }
}

const Scene = () => {
  // WEB SOCKET'S CONNECTIONS
  const [socket, setSocket] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [playerNumber, setPlayerNumber] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // GAME'S STATE
  const [initialPlayers, setInitialPlayers] = useState<PlayerProps[]>([]);
  // Create a Map to store refs by player ID
  const sphereRefs = useRef<Map<string, React.RefObject<Mesh>>>(new Map());
  // Create a separate ref for position interpolation
  const currentPositions = useRef<Map<string, Vector3>>(new Map());
  const targetPositions = useRef<Map<string, Vector3>>(new Map());

  useEffect(() => {
    const socket = new Socket('ws://localhost:4000/socket', { transports: ['websocket'] });
    setSocket(socket);
    socket.connect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const phoenixChannel = socket.channel('furbox:main', {});

    phoenixChannel.join()
      .receive('ok', (resp) => {
        setChannel(phoenixChannel);
        setPlayerNumber(resp);
        setIsConnected(true);

        phoenixChannel.on("game_changed", (payload: any) => {
          const updatedPlayers = [...payload.players, payload.ball];

          // Update target positions instead of state
          updatedPlayers.forEach(player => {
            if (!sphereRefs.current.has(player.id)) {
              sphereRefs.current.set(player.id, React.createRef<Mesh>());
              setInitialPlayers(prev => [...prev, player]); // Only update state for new players
            }

            // Update target position
            const targetPos = new Vector3(player.position[0], player.position[1], 0);
            targetPositions.current.set(player.id, targetPos);

            // Initialize current position if it doesn't exist
            if (!currentPositions.current.has(player.id)) {
              currentPositions.current.set(player.id, targetPos.clone());
            }
          });
        });
      });

    return () => {
      phoenixChannel.leave();
      setIsConnected(false);
    };
  }, [socket]);

  // Create spheres only once for initial players
  const spheres = useMemo(() =>
    initialPlayers.map((player) => (
      <Sphere
        key={player.id}
        ref={sphereRefs.current.get(player.id)}
        player={player}
      />
    )),
    [initialPlayers] // Only recreate when initial players change
  );

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      sphereRefs.current.forEach((ref, playerId) => {
        if (ref.current) {
          const currentPos = currentPositions.current.get(playerId);
          const targetPos = targetPositions.current.get(playerId);

          if (currentPos && targetPos) {
            // Smooth interpolation
            currentPos.lerp(targetPos, 0.2); // Adjust this value to control smoothing (0-1)

            // Update mesh position
            ref.current.position.copy(currentPos);
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isConnected) {
      animate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    const keysPressed: { [key: string]: boolean } = {};

    const handleUserKeyDown = (event: KeyboardEvent) => {
      if (!channel) return;

      // Prevent default behavior to avoid scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      keysPressed[event.key] = true;
      updatePlayerPosition();
    };

    const handleUserKeyUp = (event: KeyboardEvent) => {
      keysPressed[event.key] = false;
      updatePlayerPosition();
    };

    const updatePlayerPosition = () => {
      if (!channel) return;

      let offsetX = 0;
      let offsetY = 0;

      if (keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) offsetY += 1;
      if (keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) offsetY -= 1;
      if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) offsetX -= 1;
      if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) offsetX += 1;

      if (offsetX !== 0 || offsetY !== 0) {
        channel.push("move_player", { player: playerNumber, offset: [offsetX, offsetY] });
      }

      if(keysPressed[' ']) {
        console.log("Spaceee");
      }
    };

    window.addEventListener('keydown', handleUserKeyDown);
    window.addEventListener('keyup', handleUserKeyUp);

    return () => {
      window.removeEventListener('keydown', handleUserKeyDown);
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  }, [channel]);

  // GUI SETUP
  // Create a ref for the GUI instance
  const guiRef = useRef<GUI | null>(null);

  // Initialize GUI in useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const gui = new GUI();
      guiRef.current = gui;

      // Optional: Return cleanup function
      return () => {
        gui.destroy();
      };
    }
  }, []);

  // Only render Canvas when connected
  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <Canvas
      fallback={<div>Sorry no WebGL supported!</div>}
      style={SCENE_CONFIGURATION.canvasProps}  // Fullscreen canvas
      camera={SCENE_CONFIGURATION.cameraProps}    // Adjust camera to view model from front
    >
      {/* Models */}
      <Court />
      { spheres }


      {/* Camera animation */}
      {/* <AnimatedCamera /> */}

      {/* Orbit controls to interact with the scene */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
      />

      {/* Scene background */}
      <SpaceBackground />

      {/* Scene lighting */}
      <Lighting guiRef={guiRef} />

      {/* Scene effects */}
      <Effects
        guiRef={guiRef}
        initialBokehScale={3}
        initialNoiseOpacity={0.05}
        initialVignetteDarkness={1.3}
      />
    </Canvas>
  );
};

export default Scene;