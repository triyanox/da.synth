import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

const SVGReverbResponse = ({ decay }: { duration: number; decay: number }) => {
  const width = 100;
  const height = 100;
  const points = Array.from({ length: 300 }, (_, i) => {
    const x = (i / 100) * width;
    const y = height - Math.pow(1 - x / width, decay) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill="none"
        stroke="black"
        strokeWidth="4"
      />
    </svg>
  );
};

const reverbPlugin: EffectPlugin<
  ConvolverNode,
  {
    duration: number;
    decay: number;
  }
> = {
  id: nanoid(),
  name: 'Reverb',
  createNode: (audioContext) => audioContext.createConvolver(),
  updateNode: (node: AudioNode, params) => {
    const sampleRate = node.context.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * params.duration));
    const impulse = node.context.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, params.decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, params.decay);
    }

    (node as ConvolverNode).buffer = impulse;
  },
  defaultParams: { duration: 1, decay: 2 },
  getConnection: (res) => res,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-3 gap-2">
      <KnobControl
        param="duration"
        min={0.1}
        max={5}
        value={params.duration}
        onChange={(value) => setParams({ ...params, duration: value })}
      />
      <KnobControl
        param="decay"
        min={0.1}
        max={5}
        value={params.decay}
        onChange={(value) => setParams({ ...params, decay: value })}
      />
      <Card className="justify-center w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGReverbResponse duration={params.duration} decay={params.decay} />
      </Card>
    </div>
  ),
};

export default reverbPlugin;
