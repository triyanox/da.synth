import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const phaserPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    filters: BiquadFilterNode[];
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
  name: 'Phaser',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const filters: BiquadFilterNode[] = [];
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    const feedback = audioContext.createGain();
    const wet = audioContext.createGain();
    const dry = audioContext.createGain();

    for (let i = 0; i < 6; i++) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.value = 1000;
      filters.push(filter);
    }

    input.connect(filters[0]);
    for (let i = 1; i < filters.length; i++) {
      filters[i - 1].connect(filters[i]);
    }

    filters[filters.length - 1].connect(feedback);
    feedback.connect(filters[0]);

    input.connect(dry);
    filters[filters.length - 1].connect(wet);
    dry.connect(output);
    wet.connect(output);
    lfo.connect(lfoGain);
    lfoGain.connect(filters[0].frequency);
    for (let i = 1; i < filters.length; i++) {
      lfoGain.connect(filters[i].frequency);
    }
    lfo.start();

    return { input, output, filters, lfo, lfoGain, feedback, wet, dry };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.lfo.context.currentTime;

    node.lfo.frequency.setTargetAtTime(params.rate, currentTime, 0.01);
    node.lfoGain.gain.setTargetAtTime(params.depth, currentTime, 0.01);
    node.feedback.gain.setTargetAtTime(params.feedback, currentTime, 0.01);
    node.wet.gain.setTargetAtTime(params.mix, currentTime, 0.01);
    node.dry.gain.setTargetAtTime(1 - params.mix, currentTime, 0.01);
  },
  defaultParams: {
    rate: 0.5,
    depth: 1500,
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
        min={100}
        max={5000}
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

export default phaserPlugin;
