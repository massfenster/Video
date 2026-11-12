import React from 'react';
import {Composition} from 'remotion';
import {DURATION_S, FPS, HEIGHT, WIDTH} from './config';
import {FensterAd, FensterAdProps} from './FensterAd';

export const RemotionRoot: React.FC = () => (
  <>
    {(['de', 'tr'] as const).map((lang) => (
      <Composition<any, FensterAdProps>
        key={lang}
        id={`FensterAd-${lang}`}
        component={FensterAd}
        durationInFrames={DURATION_S * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{lang, voice: lang === 'de'}}
      />
    ))}
  </>
);
