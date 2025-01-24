import { useRef } from 'react';

import { SphereProps } from '@/types';

import { useSpring, animated } from '@react-spring/three';

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

  return (
    <animated.mesh
      ref={meshRef}
      position={position as any}
      scale={1}
    >
      <sphereGeometry args={[1]} />
      <meshStandardMaterial color={"orange"} />
    </animated.mesh>
  );
};

export default Sphere;