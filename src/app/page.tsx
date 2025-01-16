"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Socket } from 'phoenix';

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

interface Player {
  position: [number, number];
  // Add other player properties as needed
}

interface SphereProps {
  player: Player;
}

const Sphere = ({ player }: SphereProps) => {
    const meshRef = useRef<any>();

    // Create animated spring values for smooth movement
  const { position } = useSpring({
    // Convert 2D position from server to 3D position for Three.js
    position: [player.position[0], player.position[1], 0] as [number, number, number],
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    }
  });

  // Rotate the sphere on every frame update
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.1;
  //   }
  // });

  return (
    <animated.mesh
      ref={meshRef}
      position={position as any}
      scale={1}
      // onClick={() => setClicked(!clicked)}
      // onPointerOver={() => setHovered(true)}
      // onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1]} />
      <meshStandardMaterial color="orange" />
    </animated.mesh>
  );
};

const Lighting = () => {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={1.5} /> {/* Stronger ambient light for brightness */}
      <directionalLight position={[10, 10, 10]} intensity={3.0} /> {/* Strong directional light for shadows */}
      <spotLight
        position={[2, 5, 5]}
        angle={0.5}
        penumbra={1}
        intensity={3} // High-intensity spotlight for brightness
        castShadow
        color={new Color(0xffffff)}
      />
    </>
  );
}

// const Effects = () => {
//   return (
//     {/* Post-processing bloom effect */}
//     <EffectComposer>
//       <Bloom intensity={0.7} />
//     </EffectComposer>
//   );
// }

const SCENE_CONFIGURATION = {
  canvasProps: {
    height: '100vh', width: '100vw'
  },
  cameraProps: {
    fov: 10, //Field of Vision
    position: [0, 0, 3]
  }
}

const Scene = () => {
  // WEB SOCKET'S CONNECTIONS
  const [socket, setSocket] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [players, setPlayers] = useState<any>(null);

  useEffect(() => {
    const socket = new Socket('ws://192.168.0.187:4000/socket', { transports: ['websocket'] });
    setSocket(socket);
    socket.connect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const phoenixChannel = socket.channel('furbox:main', { });
    phoenixChannel.join().receive('ok', () => {
      setChannel(phoenixChannel);

      phoenixChannel.on("game_changed", (payload: any) => {
        // console.log(payload);
        setPlayers(payload.players);
      })

      phoenixChannel.push("move_player", { player: 'Rodo', offset: [0, 0]});
    });
  }, [socket]);

  // KEYBOARD INPUT
  // Update target position based on arrow key input
  // useEffect(() => {
  //   const moveStep = 1; // Adjust this value to control movement distance

  //   const handleUserKeyDown = (event: KeyboardEvent) => {
  //     // Prevent default behavior to avoid scrolling
  //     if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
  //       event.preventDefault();
  //     }

  //     switch (event.key) {
  //       case 'ArrowUp':
  //         channel.push("move_player", { player: 'Rodo', offset: [0, 1] });
  //         // return [prevPosition[0], prevPosition[1] + moveStep, prevPosition[2]];
  //       case 'ArrowDown':
  //         channel.push("move_player", { player: 'Rodo', offset: [0, -1] });
  //         // return [prevPosition[0], prevPosition[1] - moveStep, prevPosition[2]];
  //       case 'ArrowLeft':
  //         // return [prevPosition[0] - moveStep, prevPosition[1], prevPosition[2]];
  //       case 'ArrowRight':
  //         // return [prevPosition[0] + moveStep, prevPosition[1], prevPosition[2]];
  //     }
  //     // setTargetPosition((prevPosition) => {
  //     //   switch (event.key) {
  //     //     case 'ArrowUp':
  //     //       channel.push("move_player", { player: 'Rodo', offset: [0, 1] });
  //     //       // return [prevPosition[0], prevPosition[1] + moveStep, prevPosition[2]];
  //     //     case 'ArrowDown':
  //     //       channel.push("move_player", { player: 'Rodo', offset: [0, -1] });
  //     //       // return [prevPosition[0], prevPosition[1] - moveStep, prevPosition[2]];
  //     //     case 'ArrowLeft':
  //     //       // return [prevPosition[0] - moveStep, prevPosition[1], prevPosition[2]];
  //     //     case 'ArrowRight':
  //     //       // return [prevPosition[0] + moveStep, prevPosition[1], prevPosition[2]];
  //     //     default:
  //     //       return prevPosition;
  //     //   }
  //     // });
  //   };

  //   window.addEventListener('keydown', handleUserKeyDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleUserKeyDown);
  //   };
  // }, [channel]);

  useEffect(() => {
    const handleUserKeyDown = (event: KeyboardEvent) => {
      if (!channel) return;

      // Prevent default behavior to avoid scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowUp':
          channel.push("move_player", { player: 'Rodo', offset: [0, 1] });
          break;
        case 'ArrowDown':
          channel.push("move_player", { player: 'Rodo', offset: [0, -1] });
          break;
        case 'ArrowLeft':
          channel.push("move_player", { player: 'Rodo', offset: [-1, 0] });
          break;
        case 'ArrowRight':
          channel.push("move_player", { player: 'Rodo', offset: [1, 0] });
          break;
      }
    };

    window.addEventListener('keydown', handleUserKeyDown);
    return () => {
      window.removeEventListener('keydown', handleUserKeyDown);
    };
  }, [channel]);

  // PLAYERS POSITION UPDATE
  useEffect(() => {
    console.log(players);
    // handlePositionChange(players); // I will receive a new position and want to handle this position change on each sphere
  }, [players]);

  return (
    <Canvas
      fallback={<div>Sorry no WebGL supported!</div>}
      style={SCENE_CONFIGURATION.canvasProps}  // Fullscreen canvas
      camera={SCENE_CONFIGURATION.canvasProps}    // Adjust camera to view model from front
    >
      {/* Scene lighting */}
      <Lighting />

      {/* Scene effects */}
      {/* <Effects /> */}

      {/* Models */}
      {/* { players && players.map((player: any, index: number) => (
        <Sphere
          key={index}
          initialPosition={[player.position[0], player.position[1], 0]} />
      )) } */}

      {players?.map((player: Player, index: number) => (
        <Sphere
          key={`player-${index}`}
          player={player}
        />
      ))}
      {/* <Sphere initialPosition={[0, 2, 0]} handlePositionChange={handlePositionChange}/> */}

      {/* Orbit controls to interact with the scene */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
      />
    </Canvas>
  );
};

export default Scene;