import plugins from '@/components/plugins';
import { SynthAction, SynthState } from '@/types';
import { nanoid } from 'nanoid';

export const synthReducer = (
  state: SynthState,
  action: SynthAction,
): SynthState => {
  switch (action.type) {
    case 'ADD_OSCILLATOR':
      return {
        ...state,
        oscillators: [
          ...state.oscillators,
          {
            id: nanoid(),
            type: 'sine',
            gain: 0.5,
            octave: 0,
            detune: 0,
            attack: 0.1,
            decay: 0.1,
            sustain: 0.5,
            release: 0.1,
          },
        ],
      };
    case 'REMOVE_OSCILLATOR':
      return {
        ...state,
        oscillators: state.oscillators.filter(
          (osc) => osc.id !== action.payload,
        ),
      };
    case 'UPDATE_OSCILLATOR':
      return {
        ...state,
        oscillators: state.oscillators.map((osc) =>
          osc.id === action.payload.id
            ? { ...osc, ...action.payload.updates }
            : osc,
        ),
      };
    case 'SET_MASTER_VOLUME':
      return { ...state, masterVolume: action.payload };
    case 'ADD_PLUGIN':
      const newPlugin = action.payload;
      return {
        ...state,
        plugins: {
          ...state.plugins,
          [newPlugin.id]: {
            plugin: newPlugin,
            params: newPlugin.defaultParams,
            enabled: true,
            name: newPlugin.name,
          },
        },
        pluginOrder: [...state.pluginOrder, newPlugin.id],
      };
    case 'REMOVE_PLUGIN':
      const { [action.payload]: removedPlugin, ...remainingPlugins } =
        state.plugins;
      return {
        ...state,
        plugins: remainingPlugins,
        pluginOrder: state.pluginOrder.filter((id) => id !== action.payload),
      };
    case 'UPDATE_PLUGIN_PARAMS':
      return {
        ...state,
        plugins: {
          ...state.plugins,
          [action.payload.id]: {
            ...state.plugins[action.payload.id],
            params: action.payload.params,
          },
        },
      };
    case 'TOGGLE_PLUGIN':
      return {
        ...state,
        plugins: {
          ...state.plugins,
          [action.payload]: {
            ...state.plugins[action.payload],
            enabled: !state.plugins[action.payload].enabled,
          },
        },
      };
    case 'REORDER_PLUGINS':
      return {
        ...state,
        pluginOrder: action.payload,
      };
    case 'LOAD_PATCH':
      const loadedState = action.payload as SynthState;
      return {
        ...loadedState,
        plugins: Object.fromEntries(
          loadedState.pluginOrder.map((id) => [
            id,
            {
              ...loadedState.plugins[id],
              plugin: {
                ...Object.values(plugins).find(
                  (p) => p.name === loadedState.plugins[id].plugin.name,
                ),
                ...loadedState.plugins[id].plugin,
              },
            },
          ]),
        ),
      };
    default:
      return state;
  }
};
