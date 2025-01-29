import { useLoader } from '@react-three/fiber';
import { BackSide, TextureLoader } from 'three';

const SpaceBackground: React.FC = () => {
  const spaceTexture = useLoader(TextureLoader, '/space-background.jpg'); // Load background image

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial map={spaceTexture} side={BackSide} />
    </mesh>
  );
};

export default SpaceBackground;