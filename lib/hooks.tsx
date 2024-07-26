import useAudioContext, { AudioContextOptions } from '@/lib/audio-context';
import { synthReducer } from '@/lib/reducers';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

export const useAudioSetup = () => {
  const [opts] = useState<AudioContextOptions>({
    sampleRate: 44100,
    latencyHint: 'interactive',
  });
  const audioContext = useAudioContext(opts);
  const masterGainRef = useRef<GainNode | null>(null);
  const effectsChainInputRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    masterGainRef.current = audioContext.createGain();
    masterGainRef.current.connect(audioContext.destination);
    effectsChainInputRef.current = audioContext.createGain();
    effectsChainInputRef.current.connect(masterGainRef.current);

    return () => {
      masterGainRef.current?.disconnect();
      effectsChainInputRef.current?.disconnect();
    };
  }, [audioContext]);

  return { audioContext, masterGainRef, effectsChainInputRef };
};

export const useSynthState = () => {
  const [state, dispatch] = useReducer(synthReducer, {
    oscillators: [
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
    masterVolume: 0.5,
    plugins: {},
    pluginOrder: [],
  });

  return { state, dispatch };
};

export const useOscillatorManagement = (
  audioContext: AudioContext | null,
  effectsChainInputRef: React.RefObject<GainNode>,
) => {
  const oscillatorNodesRef = useRef<Map<string, OscillatorNode>>(new Map());
  const envelopeNodesRef = useRef<Map<string, GainNode>>(new Map());
  const activeNotesRef = useRef<Map<number, Set<string>>>(new Map());

  const stopNote = useCallback(
    (note: number, oscillators: any[]) => {
      if (!audioContext || !activeNotesRef.current.has(note)) return;

      const currentTime = audioContext.currentTime;
      const activeOscillators = activeNotesRef.current.get(note)!;

      activeOscillators.forEach((oscId) => {
        const noteKey = `${oscId}-${note}`;
        const oscillator = oscillatorNodesRef.current.get(noteKey);
        const envelope = envelopeNodesRef.current.get(noteKey);

        if (oscillator && envelope) {
          const osc = oscillators.find((o) => o.id === oscId);
          if (!osc) return;

          const releaseTime = currentTime + osc.release;
          envelope.gain.cancelScheduledValues(currentTime);
          envelope.gain.setValueAtTime(envelope.gain.value, currentTime);
          envelope.gain.linearRampToValueAtTime(0, releaseTime);

          oscillatorNodesRef.current.delete(noteKey);
          envelopeNodesRef.current.delete(noteKey);

          window.setTimeout(() => {
            oscillator.stop(releaseTime);
            oscillator.disconnect();
            envelope.disconnect();
          }, osc.release * 1000);
        }
      });

      activeNotesRef.current.delete(note);
    },
    [audioContext],
  );

  const playNote = useCallback(
    (note: number, oscillators: any[]) => {
      if (!audioContext || !effectsChainInputRef.current) return;

      const currentTime = audioContext.currentTime;

      if (activeNotesRef.current.has(note)) {
        stopNote(note, oscillators);
      }

      activeNotesRef.current.set(note, new Set());

      oscillators.forEach((osc) => {
        const noteKey = `${osc.id}-${note}`;

        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();

        oscillator.type = osc.type as OscillatorType;
        oscillator.frequency.setValueAtTime(
          440 * Math.pow(2, (note - 69 + osc.octave * 12) / 12),
          currentTime,
        );
        oscillator.detune.setValueAtTime(osc.detune, currentTime);

        envelope.gain.setValueAtTime(0, currentTime);
        envelope.gain.linearRampToValueAtTime(
          osc.gain,
          currentTime + osc.attack,
        );
        envelope.gain.linearRampToValueAtTime(
          osc.gain * osc.sustain,
          currentTime + osc.attack + osc.decay,
        );

        oscillator.connect(envelope).connect(effectsChainInputRef.current!);
        oscillator.start(currentTime);

        oscillatorNodesRef.current.set(noteKey, oscillator);
        envelopeNodesRef.current.set(noteKey, envelope);

        activeNotesRef.current.get(note)!.add(osc.id);
      });
    },
    [audioContext, effectsChainInputRef, stopNote],
  );

  const stopAllNotes = useCallback(
    (oscillators: any[]) => {
      Array.from(activeNotesRef.current.keys()).forEach((note) =>
        stopNote(note, oscillators),
      );
      activeNotesRef.current.clear();
      oscillatorNodesRef.current.clear();
      envelopeNodesRef.current.clear();
    },
    [stopNote],
  );

  return { playNote, stopNote, stopAllNotes };
};

export const usePluginManagement = (
  audioContext: AudioContext | null,
  effectsChainInputRef: React.RefObject<GainNode>,
  masterGainRef: React.RefObject<GainNode>,
  plugins: any,
  pluginOrder: string[],
) => {
  const pluginNodesRef = useRef<Map<string, AudioNode>>(new Map());
  const previousPluginsRef = useRef(plugins);
  const previousPluginOrderRef = useRef(pluginOrder);

  const reconnectPluginChain = useCallback(() => {
    if (
      !audioContext ||
      !effectsChainInputRef.current ||
      !masterGainRef.current
    )
      return;

    pluginNodesRef.current.forEach((node) => node.disconnect());
    pluginNodesRef.current.clear();

    let previousNode: AudioNode = effectsChainInputRef.current;
    pluginOrder.forEach((pluginId) => {
      const pluginState = plugins[pluginId];
      if (pluginState && pluginState.enabled) {
        try {
          const res = pluginState.plugin.createNode(audioContext);
          pluginState.plugin.updateNode(res, pluginState.params);
          const newNodes = pluginState.plugin.getConnection(res);
          if (Array.isArray(newNodes)) {
            newNodes.forEach((newNode, idx) => {
              previousNode.connect(newNode);
              previousNode = newNode;
              pluginNodesRef.current.set(`${pluginId}-${idx}`, newNode);
            });
          } else {
            previousNode.connect(newNodes);
            previousNode = newNodes;
            pluginNodesRef.current.set(pluginId, newNodes);
          }
        } catch (e) {
          console.error(`Failed to connect plugin ${pluginId}:`, e);
        }
      }
    });
    previousNode.connect(masterGainRef.current);
  }, [audioContext, plugins, pluginOrder, effectsChainInputRef, masterGainRef]);

  useEffect(() => {
    const pluginsChanged = plugins !== previousPluginsRef.current;
    const orderChanged = pluginOrder !== previousPluginOrderRef.current;

    if (pluginsChanged || orderChanged) {
      reconnectPluginChain();
      previousPluginsRef.current = plugins;
      previousPluginOrderRef.current = pluginOrder;
    }

    return () => {
      pluginNodesRef.current.forEach((node) => node.disconnect());
    };
  }, [plugins, pluginOrder, reconnectPluginChain]);

  return { reconnectPluginChain };
};

export const usePresetManagement = (
  state: any,
  dispatch: React.Dispatch<any>,
) => {
  const [lastModified, setLastModified] = useState<number>(0);

  const serializeState = useCallback(() => {
    return JSON.stringify(state);
  }, [state]);

  const deserializeState = useCallback(
    (serializedState: string) => {
      const parsedState = JSON.parse(serializedState);
      dispatch({ type: 'LOAD_PATCH', payload: parsedState });
    },
    [dispatch],
  );

  const saveCurrentPatch = useCallback(() => {
    const patchName = prompt('Enter a name for the preset');
    if (!patchName) return;
    const serializedState = serializeState();
    localStorage.setItem(`dasynth_patch_${patchName}`, serializedState);
    alert(`Presets saved as "${patchName}"`);
    setLastModified(Date.now());
  }, [serializeState]);

  const loadPatch = useCallback(
    (patchName: string) => {
      const serializedState = localStorage.getItem(
        `dasynth_patch_${patchName}`,
      );
      if (serializedState) {
        deserializeState(serializedState);
      } else {
        alert(`Failed to load preset "${patchName}"`);
      }
    },
    [deserializeState],
  );

  const getSavedPatchNames = useCallback(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    return Object.keys(localStorage)
      .filter((key) => key.startsWith('dasynth_patch_'))
      .map((key) => key.replace('dasynth_patch_', ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastModified]);

  return { saveCurrentPatch, loadPatch, getSavedPatchNames };
};
