import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const limiterPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    limiter: DynamicsCompressorNode;
    makeupGain: GainNode;
  },
  {
    threshold: number;
    knee: number;
    attack: number;
    release: number;
    makeupGain: number;
  }
> = {
  id: nanoid(),
  name: 'Limiter',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const limiter = audioContext.createDynamicsCompressor();
    const makeupGain = audioContext.createGain();

    input.connect(limiter);
    limiter.connect(makeupGain);
    makeupGain.connect(output);
    limiter.ratio.value = 20;
    limiter.threshold.value = -0.1;

    return { input, output, limiter, makeupGain };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.limiter.context.currentTime;

    node.limiter.threshold.setTargetAtTime(params.threshold, currentTime, 0.01);
    node.limiter.knee.setTargetAtTime(params.knee, currentTime, 0.01);
    node.limiter.attack.setTargetAtTime(params.attack, currentTime, 0.01);
    node.limiter.release.setTargetAtTime(params.release, currentTime, 0.01);
    node.makeupGain.gain.setTargetAtTime(params.makeupGain, currentTime, 0.01);
  },
  defaultParams: {
    threshold: -0.1,
    knee: 0,
    attack: 0.001,
    release: 0.1,
    makeupGain: 1,
  },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-5 gap-2">
      <KnobControl
        param="threshold"
        min={-60}
        max={0}
        value={params.threshold}
        onChange={(value) => setParams({ ...params, threshold: value })}
      />
      <KnobControl
        param="knee"
        min={0}
        max={40}
        value={params.knee}
        onChange={(value) => setParams({ ...params, knee: value })}
      />
      <KnobControl
        param="attack"
        min={0}
        max={1}
        value={params.attack}
        onChange={(value) => setParams({ ...params, attack: value })}
      />
      <KnobControl
        param="release"
        min={0}
        max={1}
        value={params.release}
        onChange={(value) => setParams({ ...params, release: value })}
      />
      <KnobControl
        param="makeupGain"
        min={0}
        max={10}
        value={params.makeupGain}
        onChange={(value) => setParams({ ...params, makeupGain: value })}
      />
    </div>
  ),
};

export default limiterPlugin;
