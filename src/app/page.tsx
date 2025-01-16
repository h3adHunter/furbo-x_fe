"use client";
// Scene.js
import React, { use, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
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

const Sphere = ({ initialPosition }: { initialPosition: [number, number, number] }) => {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [position, setPosition] = useState(initialPosition); // Initial position [x, y, z]

  // Rotate the sphere on every frame update
  // useFrame(() => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += 0.001;
  //   }
  // });

  // Update position based on arrow key input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPosition((prevPosition) => {
        switch (event.key) {
          case 'ArrowUp': // Move up
            return [prevPosition[0], prevPosition[1] + 0.1, prevPosition[2]];
          case 'ArrowDown': // Move down
            return [prevPosition[0], prevPosition[1] - 0.1, prevPosition[2]];
          case 'ArrowLeft': // Move left
            return [prevPosition[0] - 0.1, prevPosition[1], prevPosition[2]];
          case 'ArrowRight': // Move right
            return [prevPosition[0] + 0.1, prevPosition[1], prevPosition[2]];
          default:
            return prevPosition;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Rotate the cube on every frame update
  useFrame(() => {
    // meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.001;
  });

  return (
    <mesh
      ref={meshRef}
      scale={1}
      position={position}
      // onClick={() => setClicked(!clicked)}
      // onPointerOver={() => setHovered(true)}
      // onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
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
        color={new THREE.Color(0xffffff)}
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

const Scene = () => {
  // const [socket, setSocket] = useState<any>(null);
  // const [channel, setChannel] = useState<any>(null);

  // useEffect(() => {
  //   const socket = new Socket('ws://192.168.0.187:4000/socket', { transports: ['websocket'] });
  //   setSocket(socket);
  //   socket.connect();
  // }, []);

  // useEffect(() => {
  //   if (!socket) return;
  //   const phoenixChannel = socket.channel('world:lobby', { });
  //   phoenixChannel.join().receive('ok', () => {
  //     setChannel(phoenixChannel);

  //     phoenixChannel.on("shout", (payload: any) => {
  //       console.log(payload);
  //     })

  //     phoenixChannel.push("shout", { userData: { name: 'jotaemebe' } });
  //   });
  // }, [socket]);

  const SCENE_CONFIGURATION = {
    canvasProps: {
      height: '100vh', width: '100vw'
    },
    cameraProps: {
      fov: 10, //Field of Vision
      position: [0, 0, 3]
    }
  }

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
      <Sphere initialPosition={[0, -2, 0]} />
      <Sphere initialPosition={[0, 2, 0]} />

      {/* Orbit controls to interact with the scene */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
      />
    </Canvas>
  );
};

export default Scene;