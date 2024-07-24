import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

const SVGReverbResponse: React.FC<{
  duration: number;
  decay: number;
}> = ({ duration, decay }) => {
  const animationDuration = Math.max(0.5, Math.min(3, duration)) + 's';
  const decayStrength = Math.max(0.1, Math.min(1, decay));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      className="stroke-current text-black"
    >
      <g fill="none">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1"
        >
          <animate
            attributeName="d"
            values="M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1;
                    M9 16.5c.85.63 1.885 1 3 1s2.15-.37 3-1;
                    M9 16c.85.63 1.885 1 3 1s2.15-.37 3-1"
            dur={animationDuration}
            repeatCount="indefinite"
          />
        </path>
        <path
          fill="currentColor"
          d="M16 10.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5s.448-1.5 1-1.5s1 .672 1 1.5"
        >
          <animate
            attributeName="d"
            values="M16 10.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5s.448-1.5 1-1.5s1 .672 1 1.5;
                    M16 10.25c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5s.448-1.5 1-1.5s1 .672 1 1.5;
                    M16 10.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5s.448-1.5 1-1.5s1 .672 1 1.5"
            dur={animationDuration}
            repeatCount="indefinite"
          />
        </path>
        <ellipse cx="9" cy="10.5" fill="currentColor" rx="1" ry="1.5">
          <animate
            attributeName="cy"
            values="10.5;10.25;10.5"
            dur={animationDuration}
            repeatCount="indefinite"
          />
        </ellipse>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M7 3.338A9.954 9.954 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5"
        >
          <animate
            attributeName="stroke-dasharray"
            values={`0 ${63.5 * (1 - decayStrength)} 63.5;
                     0 0 63.5;
                     0 ${63.5 * (1 - decayStrength)} 63.5`}
            dur={animationDuration}
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
};

const stereoWidnerPlugin: EffectPlugin<
  {
    input: ChannelSplitterNode;
    output: ChannelMergerNode;
    leftDelay: DelayNode;
    rightDelay: DelayNode;
    leftGain: GainNode;
    rightGain: GainNode;
  },
  {
    width: number;
    delay: number;
  }
> = {
  id: nanoid(),
  name: 'Widener',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createChannelSplitter(2);
    const output = audioContext.createChannelMerger(2);
    const leftDelay = audioContext.createDelay(0.05);
    const rightDelay = audioContext.createDelay(0.05);
    const leftGain = audioContext.createGain();
    const rightGain = audioContext.createGain();

    input.connect(leftDelay, 0);
    input.connect(rightDelay, 1);
    leftDelay.connect(leftGain);
    rightDelay.connect(rightGain);
    leftGain.connect(output, 0, 0);
    rightGain.connect(output, 0, 1);

    input.connect(output, 0, 0);
    input.connect(output, 1, 1);

    return { input, output, leftDelay, rightDelay, leftGain, rightGain };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.leftDelay.context.currentTime;
    node.leftDelay.delayTime.setTargetAtTime(
      params.delay / 1000,
      currentTime,
      0.01,
    );
    node.rightDelay.delayTime.setTargetAtTime(
      params.delay / 1000,
      currentTime,
      0.01,
    );

    const widthGain = params.width / 200 + 0.5;
    node.leftGain.gain.setTargetAtTime(widthGain, currentTime, 0.01);
    node.rightGain.gain.setTargetAtTime(widthGain, currentTime, 0.01);
  },
  defaultParams: {
    width: 50,
    delay: 20,
  },
  ControlComponent: ({ params, setParams }) => {
    return (
      <div className="grid grid-cols-3 gap-2">
        <KnobControl
          param="width"
          min={0}
          max={100}
          value={params.width}
          onChange={(value) => setParams({ ...params, width: value })}
        />
        <KnobControl
          param="delay"
          min={0}
          max={50}
          value={params.delay}
          onChange={(value) => setParams({ ...params, delay: value })}
        />
        <Card className="justify-center w-[4.5rem] h-[4.5rem] items-center flex p-3">
          <SVGReverbResponse
            duration={params.delay}
            decay={params.width / 100}
          />
        </Card>
      </div>
    );
  },
};

export default stereoWidnerPlugin;
