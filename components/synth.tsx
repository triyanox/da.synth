import {
  useAudioSetup,
  useOscillatorManagement,
  usePluginManagement,
  usePresetManagement,
  useSynthState,
} from '@/lib/hooks';
import { AudioWaveform } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useMemo } from 'react';
import {
  EffectIcon,
  OscillatorIcon,
  PresetsIcon,
  SaveIcon,
  ScrewIcon,
} from './icons';
import Keyboard from './keyboard';
import { KnobControl } from './knob';
import OscillatorControls from './oscillator-controls';
import PluginControls from './plugin-controls';
import plugins from './plugins';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const Synthesizer: React.FC = () => {
  const { audioContext, masterGainRef, effectsChainInputRef } = useAudioSetup();
  const { state, dispatch } = useSynthState();
  const { playNote, stopNote, stopAllNotes } = useOscillatorManagement(
    audioContext,
    effectsChainInputRef,
  );
  usePluginManagement(
    audioContext,
    effectsChainInputRef,
    masterGainRef,
    state.plugins,
    state.pluginOrder,
  );
  const { saveCurrentPatch, loadPatch, getSavedPatchNames } =
    usePresetManagement(state, dispatch);

  useEffect(() => {
    if (!audioContext || !masterGainRef.current) return;
    masterGainRef.current.gain.setTargetAtTime(
      state.masterVolume,
      audioContext.currentTime,
      0.01,
    );
  }, [audioContext, masterGainRef, state.masterVolume]);

  useEffect(() => {
    return () => {
      stopAllNotes(state.oscillators);
    };
  }, [stopAllNotes, state.oscillators]);

  const addPlugin = (plugin: any) => {
    if (audioContext) {
      dispatch({
        type: 'ADD_PLUGIN',
        payload: {
          ...plugin,
          id: nanoid(),
        },
      });
    }
  };

  const oscillatorControls = useMemo(
    () =>
      state.oscillators.map((osc, i) => (
        <CarouselItem key={osc.id}>
          <OscillatorControls
            oscillator={osc}
            updateOscillator={(updates) =>
              dispatch({
                type: 'UPDATE_OSCILLATOR',
                payload: { id: osc.id, updates },
              })
            }
            removeOscillator={() =>
              dispatch({ type: 'REMOVE_OSCILLATOR', payload: osc.id })
            }
          />
        </CarouselItem>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.oscillators],
  );

  return (
    <Card className="p-4 px-8 relative overflow-hidden space-y-2 max-h-[calc(100vh-2rem)] bg-opacity-100 max-w-3xl bg-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-col">
            <h1 className="text-3xl font-bold text-black">
              Da.<span className="text-orange-500">Synth</span>
            </h1>
            <p className="text-gray-500 text-sm">ダ・シンセ</p>
          </div>
          <div className="grid grid-cols-4 gap-2 px-8">
            <Button onClick={() => dispatch({ type: 'ADD_OSCILLATOR' })}>
              <OscillatorIcon />
              <span className="ml-1 text-xs">OSC</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <EffectIcon />
                  <span className="ml-1 text-xs">FX</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-max">
                {Object.values(plugins).map((plugin) => (
                  <DropdownMenuItem
                    key={plugin.id}
                    onClick={() => addPlugin(plugin)}
                  >
                    {plugin.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={saveCurrentPatch}>
              <SaveIcon />
              <span className="ml-1 text-xs">Save</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PresetsIcon />
                  <span className="ml-1 text-xs">Saved</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {getSavedPatchNames().map((name) => (
                  <DropdownMenuItem key={name} onClick={() => loadPatch(name)}>
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <KnobControl
          orientation="vertical"
          min={0}
          max={100}
          integerSteps
          value={state.masterVolume * 100}
          onChange={(value) =>
            dispatch({ type: 'SET_MASTER_VOLUME', payload: value / 100 })
          }
        />
      </div>
      <Carousel className="mx-8">
        <CarouselContent>
          {state.oscillators.length ? (
            oscillatorControls
          ) : (
            <CarouselItem>
              <Card className="space-y-4 h-[25rem]  bg-gray-200 p-6 flex flex-col items-center justify-center border-4 border-black">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <linearGradient
                        id="emptyStateGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="10"
                      y="10"
                      width="180"
                      height="180"
                      rx="10"
                      className="fill-current text-gray-100"
                      stroke="url(#emptyStateGradient)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      className="fill-current text-gray-200"
                      stroke="url(#emptyStateGradient)"
                      strokeWidth="4"
                    />
                    <path
                      d="M40 100 Q70 60, 100 100 T160 100"
                      className="stroke-current text-orange-400"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="30"
                      className="fill-current text-gray-200"
                      stroke="url(#emptyStateGradient)"
                      strokeWidth="4"
                    />
                    <text
                      x="100"
                      y="115"
                      fontSize="40"
                      fontWeight="bold"
                      fill="url(#emptyStateGradient)"
                      textAnchor="middle"
                    >
                      ?
                    </text>
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-mono font-bold uppercase tracking-wider text-orange-500 mb-2">
                    No Oscillator Added
                  </h3>
                  <p className="text-gray-400 max-w-xs font-mono text-sm">
                    Add an oscillator to start creating your unique sound waves!
                  </p>
                </div>
                <Button onClick={() => dispatch({ type: 'ADD_OSCILLATOR' })}>
                  Add Oscillator
                </Button>
              </Card>
            </CarouselItem>
          )}
        </CarouselContent>
        {state.oscillators.length > 1 && (
          <>
            <CarouselPrevious variant="default" />
            <CarouselNext variant="default" />
          </>
        )}
      </Carousel>
      <Keyboard
        playNote={(note) => playNote(note, state.oscillators)}
        stopNote={(note) => stopNote(note, state.oscillators)}
      />
      {Object.keys(state.plugins).length ? (
        <ScrollArea className="bg-gray-200 max-w-[640px] overflow-x-auto mx-auto h-56 flex border-black border-4 rounded-md shadow-inner">
          <div className="flex w-max space-x-4 p-2">
            <PluginControls
              plugins={state.plugins}
              pluginOrder={state.pluginOrder}
              dispatch={dispatch}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="bg-gray-200 max-w-[640px] overflow-x-auto mx-auto h-56 flex border-black border-4 rounded-md shadow-inner">
          <div className="text-center flex justify-center items-center flex-col w-full p-8">
            <AudioWaveform className="text-orange-500 mb-4" size={48} />
            <h3 className="text-xl uppercase font-bold tracking-widest text-orange-500 mb-2">
              No Effects
            </h3>
            <p className="text-gray-400 max-w-xs font-mono text-sm">
              Add effect to shape sound
            </p>
          </div>
        </div>
      )}
      <div className="absolute top-1 left-2">
        <ScrewIcon />
      </div>
      <div className="absolute bottom-1 right-2 space-y-2">
        <ScrewIcon />
        <ScrewIcon />
        <ScrewIcon />
      </div>
    </Card>
  );
};

export default Synthesizer;
