import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

const distorionPlugin: EffectPlugin<
  {
    input: GainNode;
    output: GainNode;
    waveShaperNode: WaveShaperNode;
    preGainNode: GainNode;
    postGainNode: GainNode;
  },
  {
    amount: number;
    oversample: OverSampleType;
    preGain: number;
    postGain: number;
  }
> = {
  id: nanoid(),
  name: 'Distortion',
  createNode: (audioContext: AudioContext) => {
    const input = audioContext.createGain();
    const output = audioContext.createGain();
    const waveShaperNode = audioContext.createWaveShaper();
    const preGainNode = audioContext.createGain();
    const postGainNode = audioContext.createGain();

    input.connect(preGainNode);
    preGainNode.connect(waveShaperNode);
    waveShaperNode.connect(postGainNode);
    postGainNode.connect(output);

    return { input, output, waveShaperNode, preGainNode, postGainNode };
  },
  getConnection: (res) => [res.input, res.output],
  updateNode: (node, params) => {
    const curve = new Float32Array(44100);
    const deg = Math.PI / 180;
    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] =
        ((3 + params.amount) * x * 20 * deg) /
        (Math.PI + params.amount * Math.abs(x));
    }
    node.waveShaperNode.curve = curve;
    node.waveShaperNode.oversample = params.oversample;
    node.preGainNode.gain.setValueAtTime(
      params.preGain,
      node.preGainNode.context.currentTime,
    );
    node.postGainNode.gain.setValueAtTime(
      params.postGain,
      node.postGainNode.context.currentTime,
    );
  },
  defaultParams: { amount: 5, oversample: '4x', preGain: 1, postGain: 1 },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="amount"
        min={0}
        max={100}
        value={params.amount}
        onChange={(value) => setParams({ ...params, amount: value })}
      />
      <KnobControl
        param="preGain"
        min={0}
        max={2}
        value={params.preGain}
        onChange={(value) => setParams({ ...params, preGain: value })}
      />
      <KnobControl
        param="postGain"
        min={0}
        max={2}
        value={params.postGain}
        onChange={(value) => setParams({ ...params, postGain: value })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            {params.oversample === 'none'
              ? 'None'
              : params.oversample === '2x'
              ? '2x'
              : '4x'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-max">
          {[
            { id: 'none', name: 'None' },
            { id: '2x', name: '2x' },
            { id: '4x', name: '4x' },
          ].map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() =>
                setParams({ ...params, oversample: item.id as OverSampleType })
              }
            >
              {item.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export default distorionPlugin;
