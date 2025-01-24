import React, { useEffect, useState } from 'react';
import { Color } from 'three';
import GUI from 'lil-gui';

interface LightingProps {
  guiRef: React.MutableRefObject<GUI | null>;
}

const Lighting: React.FC<LightingProps> = ({ guiRef }) => {
  // State for light parameters
  const [ambientIntensity, setAmbientIntensity] = useState(1.5);
  const [directionalIntensity, setDirectionalIntensity] = useState(3.0);
  const [spotLightIntensity, setSpotLightIntensity] = useState(3);
  const [spotLightPosition, setSpotLightPosition] = useState([2, 5, 5]);
  const [spotLightAngle, setSpotLightAngle] = useState(0.5);
  const [spotLightPenumbra, setSpotLightPenumbra] = useState(1);

  // Add GUI controls when component mounts
  useEffect(() => {
    if (guiRef.current) {
      // Create a folder for lighting controls
      const lightingFolder = guiRef.current.addFolder('Ambient Lighting');

      // Ambient Light Controls
      lightingFolder
        .add({ ambientIntensity }, 'ambientIntensity', 0, 5)
        .name('Ambient Intensity')
        .onChange((value: number) => {
          setAmbientIntensity(value);
        });

      // Directional Light Controls
      const directionalFolder = lightingFolder.addFolder('Directional Light');
      directionalFolder
        .add({ directionalIntensity }, 'directionalIntensity', 0, 5)
        .name('Intensity')
        .onChange((value: number) => {
          setDirectionalIntensity(value);
        });

      // Spot Light Controls
      const spotLightFolder = lightingFolder.addFolder('Spot Light');
      spotLightFolder
        .add({ spotLightIntensity }, 'spotLightIntensity', 0, 5)
        .name('Intensity')
        .onChange((value: number) => {
          setSpotLightIntensity(value);
        });

      spotLightFolder
        .add(spotLightPosition, 0, -10, 10)
        .name('Position X')
        .onChange((value: number) => {
          setSpotLightPosition(prev => [value, prev[1], prev[2]]);
        });

      spotLightFolder
        .add(spotLightPosition, 1, -10, 10)
        .name('Position Y')
        .onChange((value: number) => {
          setSpotLightPosition(prev => [prev[0], value, prev[2]]);
        });

      spotLightFolder
        .add(spotLightPosition, 2, -10, 10)
        .name('Position Z')
        .onChange((value: number) => {
          setSpotLightPosition(prev => [prev[0], prev[1], value]);
        });

      spotLightFolder
        .add({ spotLightAngle }, 'spotLightAngle', 0, Math.PI / 2)
        .name('Angle')
        .onChange((value: number) => {
          setSpotLightAngle(value);
        });

      spotLightFolder
        .add({ spotLightPenumbra }, 'spotLightPenumbra', 0, 1)
        .name('Penumbra')
        .onChange((value: number) => {
          setSpotLightPenumbra(value);
        });

      // Optional: Reset button for lighting
      lightingFolder.add({
        reset: () => {
          setAmbientIntensity(1.5);
          setDirectionalIntensity(3.0);
          setSpotLightIntensity(3);
          setSpotLightPosition([2, 5, 5]);
          setSpotLightAngle(0.5);
          setSpotLightPenumbra(1);

          // Reset GUI controllers
          lightingFolder.controllers.forEach((controller) => {
            controller.setValue(controller.initialValue);
          });
        }
      }, 'reset').name('Reset Lighting');
    }
  }, [guiRef]);

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={directionalIntensity}
      />
      <spotLight
        position={spotLightPosition as [number, number, number]}
        angle={spotLightAngle}
        penumbra={spotLightPenumbra}
        intensity={spotLightIntensity}
        castShadow
        color={new Color(0xffffff)}
      />
    </>
  );
};

export default Lighting;