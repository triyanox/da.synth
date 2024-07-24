import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const filterPlugin: EffectPlugin<
  {
    filter: BiquadFilterNode;
    gain: GainNode;
  },
  {
    frequency: number;
    resonance: number;
    gain: number;
    type: BiquadFilterType;
  }
> = {
  id: nanoid(),
  name: 'Filter',
  createNode: (audioContext: AudioContext) => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    const gain = audioContext.createGain();
    gain.gain.value = 1;

    filter.connect(gain);

    return { filter, gain };
  },
  getConnection: (res) => [res.filter, res.gain],
  updateNode: (res, params) => {
    const currentTime = res.filter.context.currentTime;
    res.filter.frequency.setTargetAtTime(params.frequency, currentTime, 0.01);
    res.filter.Q.setTargetAtTime(params.resonance, currentTime, 0.01);
    res.filter.type = params.type;
    res.gain.gain.setTargetAtTime(params.gain, currentTime, 0.01);
  },
  defaultParams: {
    frequency: 1000,
    resonance: 1,
    gain: 1,
    type: 'lowpass',
  },
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="frequency"
        min={20}
        max={20000}
        value={params.frequency}
        onChange={(value) => setParams({ ...params, frequency: value })}
      />
      <KnobControl
        param="resonance"
        min={0.1}
        max={30}
        value={params.resonance}
        onChange={(value) => setParams({ ...params, resonance: value })}
      />
      <KnobControl
        param="gain"
        min={0}
        max={4}
        value={params.gain}
        onChange={(value) => setParams({ ...params, gain: value })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-24">
            {params.type === 'lowpass'
              ? 'Low Pass'
              : params.type === 'highpass'
              ? 'High Pass'
              : params.type === 'bandpass'
              ? 'Band Pass'
              : 'Notch'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-max">
          {[
            { id: 'lowpass', name: 'Low Pass' },
            { id: 'highpass', name: 'High Pass' },
            { id: 'bandpass', name: 'Band Pass' },
            { id: 'notch', name: 'Notch' },
          ].map((item) => (
            <DropdownMenuItem
              key={item.id}
              onClick={() =>
                setParams({ ...params, type: item.id as BiquadFilterType })
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

export default filterPlugin;
