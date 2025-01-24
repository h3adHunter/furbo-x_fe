"use client";
import React, { useEffect, useRef, useState } from 'react';

import GUI from 'lil-gui';
import { Socket } from 'phoenix';

import { BackSide, TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';

import Court from '@/components/core/Court';
import Sphere from '@/components/core/Sphere';

import Lighting from '@/components/lighting/Lighting';
import Effects from '@/components/effects/Effects';

import PlayerProps from '@/types';

// const StarfieldBackground = () => {
//   return (
//     <mesh>
//       <points>
//         <bufferGeometry />
//         <pointsMaterial size={0.1} sizeAttenuation={true} />
//       </points>
//     </mesh>
//   );
// }

const SpaceBackground: React.FC = () => {
  const spaceTexture = useLoader(TextureLoader, '/space-background.jpg'); // Load background image

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial map={spaceTexture} side={BackSide} />
    </mesh>
  );
};


const AnimatedCamera: React.FC = () => {
  const cameraSpring = useSpring({
    from: { x: 0, y: 0, z: 500 },
    to: { x: 100, y: 100, z: 300 },
    config: { tension: 120, friction: 14 }
  })

  return (
    <a.perspectiveCamera
      position={[
        cameraSpring.x,
        cameraSpring.y,
        cameraSpring.z
      ]}
    />
  )
}

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
  const [players, setPlayers] = useState<any>(null);
  const [playerNumber, setPlayerNumber] = useState<number>(0);

  const gui = new GUI();

  useEffect(() => {
    const socket = new Socket('ws://localhost:4000/socket', { transports: ['websocket'] });
    setSocket(socket);
    socket.connect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const phoenixChannel = socket.channel('furbox:main', { });
    phoenixChannel.join().receive('ok', (resp) => {
      setChannel(phoenixChannel);
      setPlayerNumber(resp);
      phoenixChannel.on("game_changed", (payload: any) => {
        // console.log(payload);
        console.log([...payload.players, payload.ball]);
        setPlayers([...payload.players, payload.ball]);
      })
    });
  }, [socket]);

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

  // PLAYERS POSITION UPDATE
  useEffect(() => {
    console.log(players);
    // handlePositionChange(players); // I will receive a new position and want to handle this position change on each sphere
  }, [players]);

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

  return (
    <Canvas
      fallback={<div>Sorry no WebGL supported!</div>}
      style={SCENE_CONFIGURATION.canvasProps}  // Fullscreen canvas
      camera={SCENE_CONFIGURATION.cameraProps}    // Adjust camera to view model from front
    >
      {/* Models */}
      { players?.map((player: PlayerProps, index: number) => (
        <Sphere
          key={`player-${index}`}
          player={player}
        />
      )) }

      <Court />

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