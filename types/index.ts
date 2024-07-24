type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface Oscillator {
  id: string;
  type: OscillatorType;
  gain: number;
  octave: number;
  detune: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface EffectPlugin<Result, Params = any> {
  id: string;
  name: string;
  createNode: (audioContext: AudioContext) => Result;
  updateNode: (res: Result, params: Params) => void;
  defaultParams: Params;
  ControlComponent: React.FC<{
    params: Params;
    setParams: (params: Params) => void;
  }>;
  getConnection: (res: Result) => AudioNode | AudioNode[];
}

interface SynthState {
  oscillators: Oscillator[];
  masterVolume: number;
  plugins: {
    [id: string]: {
      name: string;
      plugin: EffectPlugin<any>;
      params: any;
      enabled: boolean;
    };
  };
  pluginOrder: string[];
}

type SynthAction =
  | { type: 'ADD_OSCILLATOR' }
  | { type: 'REMOVE_OSCILLATOR'; payload: string }
  | {
      type: 'UPDATE_OSCILLATOR';
      payload: { id: string; updates: Partial<Oscillator> };
    }
  | { type: 'SET_MASTER_VOLUME'; payload: number }
  | { type: 'ADD_PLUGIN'; payload: EffectPlugin<any> }
  | { type: 'REMOVE_PLUGIN'; payload: string }
  | { type: 'UPDATE_PLUGIN_PARAMS'; payload: { id: string; params: any } }
  | { type: 'TOGGLE_PLUGIN'; payload: string }
  | { type: 'REORDER_PLUGINS'; payload: string[] }
  | { type: 'LOAD_PATCH'; payload: SynthState };

export type {
  OscillatorType,
  Oscillator,
  EffectPlugin,
  SynthState,
  SynthAction,
};
