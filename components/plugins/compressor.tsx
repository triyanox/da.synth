import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

const compressorPlugin: EffectPlugin<
  DynamicsCompressorNode,
  {
    threshold: number;
    knee: number;
    ratio: number;
    attack: number;
    release: number;
  }
> = {
  id: nanoid(),
  name: 'Compressor',
  createNode: (audioContext: AudioContext) => {
    return audioContext.createDynamicsCompressor();
  },
  getConnection: (res) => res,
  updateNode: (node, params) => {
    const currentTime = node.context.currentTime;
    node.threshold.setTargetAtTime(params.threshold, currentTime, 0.01);
    node.knee.setTargetAtTime(params.knee, currentTime, 0.01);
    node.ratio.setTargetAtTime(params.ratio, currentTime, 0.01);
    node.attack.setTargetAtTime(params.attack, currentTime, 0.01);
    node.release.setTargetAtTime(params.release, currentTime, 0.01);
  },
  defaultParams: {
    threshold: -24,
    knee: 30,
    ratio: 12,
    attack: 0.003,
    release: 0.25,
  },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-5 gap-2">
      <KnobControl
        param="threshold"
        min={-100}
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
        param="ratio"
        min={1}
        max={20}
        value={params.ratio}
        onChange={(value) => setParams({ ...params, ratio: value })}
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
    </div>
  ),
};

export default compressorPlugin;
