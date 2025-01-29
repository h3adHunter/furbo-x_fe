import React, { useMemo } from 'react';

import { SphereProps, PositionProps } from '@/types';

import { useSpring, animated } from '@react-spring/three';
import { Mesh } from 'three';

const Sphere = React.forwardRef<Mesh, SphereProps>(({ player, color }, ref) => {
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

  // Memoize geometry and material to prevent recreation
  const geometry = useMemo(() => <sphereGeometry args={[1]} />, []);
  const material = useMemo(() => <meshStandardMaterial color={color} />, []);

  return (
    <animated.mesh
      ref={ref}
      position={position as any}
      scale={player.scale}
    >
      { geometry }
      { material }
    </animated.mesh>
  );
});

Sphere.displayName = 'Sphere';

export default Sphere;