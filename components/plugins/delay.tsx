import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const delayPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    delayNode: DelayNode;
    feedbackNode: GainNode;
    dryNode: GainNode;
    wetNode: GainNode;
  },
  {
    time: number;
    feedback: number;
    mix: number;
  }
> = {
  id: nanoid(),
  name: 'Delay',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const delayNode = audioContext.createDelay(5.0);
    const feedbackNode = audioContext.createGain();
    const dryNode = audioContext.createGain();
    const wetNode = audioContext.createGain();
    input.connect(dryNode);
    input.connect(delayNode);
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);

    delayNode.connect(wetNode);

    dryNode.connect(output);
    wetNode.connect(output);

    return { input, output, delayNode, feedbackNode, dryNode, wetNode };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const currentTime = node.delayNode.context.currentTime;

    node.delayNode.delayTime.setTargetAtTime(params.time, currentTime, 0.01);
    node.feedbackNode.gain.setTargetAtTime(params.feedback, currentTime, 0.01);
    node.dryNode.gain.setTargetAtTime(1 - params.mix, currentTime, 0.01);
    node.wetNode.gain.setTargetAtTime(params.mix, currentTime, 0.01);
  },
  defaultParams: { time: 0.3, feedback: 0.4, mix: 0.5 },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-3 gap-2">
      <KnobControl
        param="time"
        min={0}
        max={5}
        value={params.time}
        onChange={(value) => setParams({ ...params, time: value })}
      />
      <KnobControl
        param="feedback"
        min={0}
        max={0.99}
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

export default delayPlugin;
