import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ModernHouseScene} from './scene/ModernHouse';

// Hintergrundbilder für die Website (Text liegt im HTML, nicht im Bild)
export const SiteHero: React.FC<{variant: 'desktop' | 'mobile' | 'og'}> = ({variant}) => {
  const {width, height} = useVideoConfig();
  const cam: Record<string, {pos: [number, number, number]; look: [number, number, number]; fov: number}> = {
    // Haus rechts, links Platz für Text
    desktop: {pos: [20, 3.6, 40], look: [-9.5, 5.0, 0], fov: 28},
    // Haus unten, oben Platz für Text
    mobile: {pos: [20, 3.4, 42], look: [0.5, 9.2, 0], fov: 32},
    og: {pos: [20, 3.6, 40], look: [-7, 5.0, 0], fov: 28},
  };
  const c = cam[variant];
  return (
    <AbsoluteFill style={{background: '#101c30'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: c.fov, near: 0.1, far: 300}} shadows>
        <ModernHouseScene camPos={c.pos} look={c.look} fog={[58, 140]} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
