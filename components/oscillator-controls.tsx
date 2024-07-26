import { Oscillator } from '@/types';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { KnobControl } from './knob';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Delete, Trash } from 'lucide-react';

const RESOLUTION = 300;

const generateWaveformPoints = (
  type: Oscillator['type'],
  resolution: number,
): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i <= resolution; i++) {
    const x = (i / resolution) * 100;
    let y;
    const t = (i / resolution) * Math.PI * 2;
    switch (type) {
      case 'sine':
        y = 50 - Math.sin(t) * 45;
        break;
      case 'square':
        y = 50 - Math.sign(Math.sin(t)) * 45;
        break;
      case 'sawtooth':
        y = 50 - ((t % (2 * Math.PI)) / Math.PI - 1) * 45;
        break;
      case 'triangle':
        y = 50 - (Math.abs((t % (2 * Math.PI)) / Math.PI - 1) * 2 - 1) * 45;
        break;
    }
    points.push([x, y]);
  }
  return points;
};

const interpolatePoints = (
  start: [number, number][],
  end: [number, number][],
  progress: number,
): [number, number][] => {
  return start.map((startPoint, i) => {
    const endPoint = end[i];
    return [
      startPoint[0] + (endPoint[0] - startPoint[0]) * progress,
      startPoint[1] + (endPoint[1] - startPoint[1]) * progress,
    ];
  });
};

const pointsToPath = (points: [number, number][]): string => {
  return `M${points.map(([x, y]) => `${x},${y}`).join(' L')}`;
};

const WaveformSVG: React.FC<{ type: Oscillator['type'] }> = ({ type }) => {
  const [currentType, setCurrentType] = useState(type);
  const [progress, setProgress] = useState(1);
  const animationRef = useRef<number>();

  const waveforms = useMemo(
    () => ({
      sine: generateWaveformPoints('sine', RESOLUTION),
      square: generateWaveformPoints('square', RESOLUTION),
      sawtooth: generateWaveformPoints('sawtooth', RESOLUTION),
      triangle: generateWaveformPoints('triangle', RESOLUTION),
    }),
    [],
  );

  useEffect(() => {
    if (currentType !== type) {
      setProgress(0);
      const startTime = performance.now();
      const duration = 300;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);

        if (newProgress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentType(type);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, currentType]);

  const currentPath = pointsToPath(
    interpolatePoints(waveforms[currentType], waveforms[type], progress),
  );

  return (
    <svg viewBox="0 0 100 100" className="w-full h-20">
      <path
        d={currentPath}
        fill="none"
        stroke="#000"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ADSRSVG: React.FC<{
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}> = ({ attack, decay, sustain, release }) => {
  const totalTime = attack + decay + release + 1;
  const width = 100;
  const height = 50;

  const attackX = (attack / totalTime) * width;
  const decayX = ((attack + decay) / totalTime) * width;
  const releaseStartX = ((attack + decay + 1) / totalTime) * width;
  const sustainY = height - sustain * height;

  const pathData = `
    M0,${height} 
    L${attackX},0 
    L${decayX},${sustainY} 
    L${releaseStartX},${sustainY} 
    L${width},${height}
  `;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
      <path d={pathData} fill="none" stroke="#000" strokeWidth="2" />
    </svg>
  );
};

const OscillatorControls: React.FC<{
  oscillator: Oscillator;
  updateOscillator: (updates: Partial<Oscillator>) => void;
  removeOscillator: () => void;
}> = memo(({ oscillator, updateOscillator, removeOscillator }) => {
  return (
    <div className="bg-gray-200 p-4 flex flex-col gap-4 h-[25rem] border-black border-4 rounded-lg w-full">
      <div className="grid grid-cols-3 gap-4">
        <div className="grid grid-cols-4 col-span-2 gap-4">
          {['sine', 'square', 'sawtooth', 'triangle'].map((type) => (
            <Button
              size={'lg'}
              key={type}
              onClick={() =>
                updateOscillator({ type: type as Oscillator['type'] })
              }
            >
              {type.toUpperCase()}
            </Button>
          ))}
          <KnobControl
            param="gain"
            min={0}
            max={1}
            value={oscillator.gain}
            onChange={(value) => updateOscillator({ gain: value })}
          />
          <KnobControl
            param="octave"
            min={-3}
            max={3}
            integerSteps
            dragSensitivity={0.05}
            value={oscillator.octave}
            onChange={(value) => updateOscillator({ octave: value })}
          />
          <KnobControl
            param="detune"
            min={-100}
            max={100}
            value={oscillator.detune}
            onChange={(value) => updateOscillator({ detune: value })}
          />
        </div>
        <Card className="flex rounded-2xl border-4 justify-center items-center p-1">
          <WaveformSVG type={oscillator.type} />
        </Card>
      </div>
      <div className="grid grid-cols-4 gap-8"></div>
      <div className="grid grid-cols-5 gap-4">
        <Card className="flex col-span-2 border-4 rounded-2xl justify-center items-center p-1">
          <ADSRSVG
            attack={oscillator.attack}
            decay={oscillator.decay}
            sustain={oscillator.sustain}
            release={oscillator.release}
          />
        </Card>
        <div className="grid col-span-3 w-full grid-cols-4 gap-4">
          <KnobControl
            param="attack"
            min={0}
            max={2}
            value={oscillator.attack}
            onChange={(value) => updateOscillator({ attack: value })}
          />
          <KnobControl
            param="decay"
            min={0}
            max={2}
            value={oscillator.decay}
            onChange={(value) => updateOscillator({ decay: value })}
          />
          <KnobControl
            param="sustain"
            min={0}
            max={1}
            value={oscillator.sustain}
            onChange={(value) => updateOscillator({ sustain: value })}
          />
          <KnobControl
            param="release"
            min={0}
            max={2}
            value={oscillator.release}
            onChange={(value) => updateOscillator({ release: value })}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={removeOscillator}>Remove Oscillator</Button>
      </div>
    </div>
  );
});
export default OscillatorControls;

OscillatorControls.displayName = 'OscillatorControls';
