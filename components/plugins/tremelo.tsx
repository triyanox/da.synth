import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

const SVGTremoloResponse: React.FC<{
  rate: number;
  depth: number;
}> = ({ rate, depth }) => {
  const animationDuration = 1 / rate + 's';
  const depthPercentage = depth * 100;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      className="stroke-current text-black"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d={`M 2 12 Q 6 ${12 - depthPercentage / 4} 12 12 Q 18 ${
          12 + depthPercentage / 4
        } 22 12`}
      >
        <animate
          attributeName="d"
          values={`M 2 12 Q 6 ${12 - depthPercentage / 4} 12 12 Q 18 ${
            12 + depthPercentage / 4
          } 22 12;
                   M 2 12 Q 6 ${12 + depthPercentage / 4} 12 12 Q 18 ${
            12 - depthPercentage / 4
          } 22 12;
                   M 2 12 Q 6 ${12 - depthPercentage / 4} 12 12 Q 18 ${
            12 + depthPercentage / 4
          } 22 12`}
          dur={animationDuration}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

const tremoloPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    lfo: OscillatorNode;
  },
  {
    rate: number;
    depth: number;
  }
> = {
  id: nanoid(),
  name: 'Tremolo',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    lfo.connect(lfoGain);
    lfoGain.connect(output.gain);
    input.connect(output);

    lfo.start();

    return { input, output, lfo };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const { rate, depth } = params;
    const currentTime = node.lfo.context.currentTime;

    node.lfo.frequency.setTargetAtTime(rate, currentTime, 0.01);
    node.lfo.type = 'sine';

    const lfoGain = node.lfo.context.createGain();
    lfoGain.gain.setValueAtTime(depth, currentTime);
  },
  defaultParams: {
    rate: 4,
    depth: 0.5,
  },
  ControlComponent: ({ params, setParams }) => {
    return (
      <div className="grid grid-cols-3 gap-2">
        <KnobControl
          param="rate"
          min={0.1}
          max={20}
          value={params.rate}
          onChange={(value) => setParams({ ...params, rate: value })}
        />
        <KnobControl
          param="depth"
          min={0}
          max={1}
          value={params.depth}
          onChange={(value) => setParams({ ...params, depth: value })}
        />
        <Card className="justify-center w-[4.5rem] h-[4.5rem] items-center flex p-3">
          <SVGTremoloResponse rate={params.rate} depth={params.depth} />
        </Card>
      </div>
    );
  },
};

export default tremoloPlugin;
