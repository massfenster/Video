import React from 'react';
import {Composition} from 'remotion';
import {Flyer} from './Flyer';
import {Kampagne} from './Kampagne';
import {FacebookCover, HIGHLIGHTS, HighlightCover, ProfilBild} from './Profil';
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
    {(['de', 'tr'] as const).map((lang) => (
      <React.Fragment key={`flyer-${lang}`}>
        {/* A5 Druck, 300 dpi */}
        <Composition id={`Flyer-A5-${lang}`} component={Flyer} durationInFrames={DURATION_S * FPS} fps={FPS} width={1748} height={2480} defaultProps={{lang}} />
        {/* Instagram/Facebook Feed 4:5 */}
        <Composition id={`Flyer-Post-${lang}`} component={Flyer} durationInFrames={DURATION_S * FPS} fps={FPS} width={1080} height={1350} defaultProps={{lang}} />
      </React.Fragment>
    ))}
    {/* Winter-Kampagne Instagram/Facebook 1080 × 1350 */}
    <Composition id="Kampagne-Winter-de" component={Kampagne} durationInFrames={1} fps={FPS} width={1080} height={1350} />
    {/* Profil-Assets */}
    <Composition id="Profil-Bild" component={ProfilBild} durationInFrames={1} fps={FPS} width={1080} height={1080} defaultProps={{variant: 'full' as const}} />
    <Composition id="Profil-Bild-Mark" component={ProfilBild} durationInFrames={1} fps={FPS} width={1080} height={1080} defaultProps={{variant: 'mark' as const}} />
    <Composition id="Facebook-Cover" component={FacebookCover} durationInFrames={1} fps={FPS} width={1640} height={624} />
    {HIGHLIGHTS.map((icon) => (
      <Composition key={icon} id={`Highlight-${icon}`} component={HighlightCover} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{icon}} />
    ))}
  </>
);
