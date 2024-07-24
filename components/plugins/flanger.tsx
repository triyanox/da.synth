import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const flangerPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    delay: DelayNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    feedback: GainNode;
    wet: GainNode;
    dry: GainNode;
  },
  {
    rate: number;
    depth: number;
    feedback: number;
    mix: number;
  }
> = {
  id: nanoid(),
  name: 'Flanger',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const delay = audioContext.createDelay(0.02);
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    const feedback = audioContext.createGain();
    const wet = audioContext.createGain();
    const dry = audioContext.createGain();
    input.connect(delay);
    input.connect(dry);
    delay.connect(wet);
    delay.connect(feedback);
    feedback.connect(input);

    dry.connect(output);
    wet.connect(output);
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();

    return { input, output, delay, lfo, lfoGain, feedback, wet, dry };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.lfo.context.currentTime;
    node.lfo.frequency.setTargetAtTime(params.rate, currentTime, 0.01);
    node.lfoGain.gain.setTargetAtTime(params.depth / 1000, currentTime, 0.01);
    node.feedback.gain.setTargetAtTime(params.feedback, currentTime, 0.01);
    node.wet.gain.setTargetAtTime(params.mix, currentTime, 0.01);
    node.dry.gain.setTargetAtTime(1 - params.mix, currentTime, 0.01);
  },
  defaultParams: {
    rate: 0.5,
    depth: 3,
    feedback: 0.5,
    mix: 0.5,
  },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="rate"
        min={0.1}
        max={10}
        value={params.rate}
        onChange={(value) => setParams({ ...params, rate: value })}
      />
      <KnobControl
        param="depth"
        min={0}
        max={20}
        value={params.depth}
        onChange={(value) => setParams({ ...params, depth: value })}
      />
      <KnobControl
        param="feedback"
        min={0}
        max={0.9}
        value={params.feedback}
        onChange={(value) => setParams({ ...params, feedback: value })}
      />
      <KnobControl
        param="mix"
        min={0}
        max={1}
        value={params.mix}
        onChange={(value) => setParams({ ...params, mix: value })}
      />
    </div>
  ),
};

export default flangerPlugin;
