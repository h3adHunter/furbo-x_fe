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

const Sphere = () => {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Rotate the cube on every frame update
  useFrame(() => {
    // meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.001;
  });

  return (
    <mesh
      ref={meshRef}
      scale={1}
      // onClick={() => setClicked(!clicked)}
      // onPointerOver={() => setHovered(true)}
      // onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};

const Scene = () => {
  const [socket, setSocket] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const socket = new Socket('ws://192.168.0.187:4000/socket', { transports: ['websocket'] });
    setSocket(socket);
    socket.connect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const phoenixChannel = socket.channel('world:lobby', { });
    phoenixChannel.join().receive('ok', () => {
      setChannel(phoenixChannel);

      phoenixChannel.on("shout", (payload: any) => {
        console.log(payload);
      })

      phoenixChannel.push("shout", { userData: { name: 'jotaemebe' } });
    });
  }, [socket]);

  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}  // Fullscreen canvas
      camera={{ position: [0, 0, 3], fov: 500 }}    // Adjust camera to view model from front
    >

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

      {/* Orbit controls to interact with the scene */}
      {/* <OrbitControls
        enableZoom={true}
        enablePan={true}
      /> */}

      <Sphere />
    </Canvas>
  );
};

export default Scene;