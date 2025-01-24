import React, { useEffect, useState } from 'react';
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';
import GUI from 'lil-gui';

interface EffectsProps {
  guiRef: React.MutableRefObject<GUI | null>;
  // Optional props to customize initial values
  initialBokehScale?: number;
  initialNoiseOpacity?: number;
  initialVignetteDarkness?: number;
}

const Effects: React.FC<EffectsProps> = ({
  guiRef,
  initialBokehScale = 10,
  initialNoiseOpacity = 0.025,
  initialVignetteDarkness = 1.1
}) => {
  // State for effect parameters
  const [bokehScale, setBokehScale] = useState(initialBokehScale);
  const [noiseOpacity, setNoiseOpacity] = useState(initialNoiseOpacity);
  const [vignetteDarkness, setVignetteDarkness] = useState(initialVignetteDarkness);
  const [bloomEnabled, setBloomEnabled] = useState(true);


  useEffect(() => {
    if (guiRef.current) {
      const gui = guiRef.current;

      // Create a folder for post-processing effects
      const effectsFolder = gui.addFolder('Post Processing');

      // Bokeh Scale Controls
      effectsFolder
        .add({ bokehScale }, 'bokehScale', 1, 100)
        .name('Bokeh Scale')
        .onChange((value: number) => {
          setBokehScale(value);
        });

      // Noise Opacity Controls
      effectsFolder
        .add({ noiseOpacity }, 'noiseOpacity', 0, 0.1)
        .name('Noise Opacity')
        .onChange((value: number) => {
          setNoiseOpacity(value);
        });

      // Vignette Darkness Controls
      effectsFolder
        .add({ vignetteDarkness }, 'vignetteDarkness', 0, 2)
        .name('Vignette Darkness')
        .onChange((value: number) => {
          setVignetteDarkness(value);
        });

      effectsFolder
        .add({ bloomEnabled }, 'bloomEnabled', [true, false])
        .name('Bloom Enabled')
        .onChange((value: boolean) => {
          setBloomEnabled(value);
        });

      // Optional: Add a reset button
      effectsFolder.add({
        reset: () => {
          setBokehScale(initialBokehScale);
          setNoiseOpacity(initialNoiseOpacity);
          setVignetteDarkness(initialVignetteDarkness);
          setBloomEnabled(true);

          // Reset GUI sliders to initial values
          gui.controllers.forEach((controller) => {
            controller.setValue(controller.initialValue);
          });
        }
      }, 'reset').name('Reset Defaults');

      // Cleanup GUI on unmount
      return () => {
        gui.destroy();
      };
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <EffectComposer multisampling={0} disableNormalPass={true}>
      <DepthOfField
        focusDistance={1}
        focalLength={0.0004}
        bokehScale={bokehScale}
        height={480}
      />
      <Bloom
        intensity={bloomEnabled ? 1 : 0}
        luminanceThreshold={0}
        luminanceSmoothing={0.9}
        bloomScale={1}
        height={300}
        opacity={100}
      />
      <Noise opacity={noiseOpacity} />
      <Vignette eskil={false} offset={0.1} darkness={vignetteDarkness} />
    </EffectComposer>
  );
};

export default Effects;