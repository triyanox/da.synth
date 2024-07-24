import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const chorusPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    delayNode: DelayNode;
    lfoNode: OscillatorNode;
    depthNode: GainNode;
    wetNode: GainNode;
    dryNode: GainNode;
  },
  {
    rate: number;
    depth: number;
    delay: number;
    mix: number;
  }
> = {
  id: nanoid(),
  name: 'Chorus',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const delayNode = audioContext.createDelay(0.03);
    const lfoNode = audioContext.createOscillator();
    const depthNode = audioContext.createGain();
    const wetNode = audioContext.createGain();
    const dryNode = audioContext.createGain();
    lfoNode.type = 'sine';
    lfoNode.frequency.setValueAtTime(0.1, audioContext.currentTime);
    lfoNode.connect(depthNode);
    depthNode.connect(delayNode.delayTime);
    input.connect(dryNode);
    input.connect(delayNode);
    delayNode.connect(wetNode);
    dryNode.connect(output);
    wetNode.connect(output);
    lfoNode.start();
    return {
      input,
      output,
      delayNode,
      lfoNode,
      depthNode,
      wetNode,
      dryNode,
    };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.lfoNode.context.currentTime;

    node.lfoNode.frequency.setTargetAtTime(params.rate, currentTime, 0.01);
    node.depthNode.gain.setTargetAtTime(params.depth / 1000, currentTime, 0.01);
    node.delayNode.delayTime.setTargetAtTime(
      params.delay / 1000,
      currentTime,
      0.01,
    );
    node.dryNode.gain.setTargetAtTime(1 - params.mix, currentTime, 0.01);
    node.wetNode.gain.setTargetAtTime(params.mix, currentTime, 0.01);
  },
  defaultParams: { rate: 1.5, depth: 5, delay: 15, mix: 0.5 },
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
        param="delay"
        min={5}
        max={30}
        value={params.delay}
        onChange={(value) => setParams({ ...params, delay: value })}
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

export default chorusPlugin;
