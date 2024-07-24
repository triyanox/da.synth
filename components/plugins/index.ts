import bitcrusherPlugin, { loadBitcrusherWorklet } from './bit-curusher';
import chorusPlugin from './chorus';
import compressorPlugin from './compressor';
import delayPlugin from './delay';
import dimensionExpanderPlugin, {
  loadDimensionExpanderWorklet,
} from './dim-expander';
import distorionPlugin from './distortion';
import filterPlugin from './filter';
import flangerPlugin from './flanger';
import formantFilterPlugin, {
  loadFormantFilterWorklet,
} from './formant-filter';
import granularPlugin, { loadGranularWorklet } from './granular';
import limiterPlugin from './limiter';
import phaserPlugin from './phaser';
import pingPongDelayPlugin, {
  loadPingPongDelayWorklet,
} from './ping-pong-delay';
import reverbPlugin from './reverb';
import sonicTransformerPlugin, {
  loadSonicTransformerWorklet,
} from './sonic-transformer';
import spectralShaperPlugin, {
  loadSpectralShaperWorklet,
} from './spectral-shaper';
import stereoWidnerPlugin from './stereo-widener';
import tremoloPlugin from './tremelo';

class WorkletsLoader {
  private worklets: Record<string, (ctx: AudioContext) => Promise<void>>;

  constructor(worklets: Record<string, (ctx: AudioContext) => Promise<void>>) {
    this.worklets = worklets;
  }

  async loadWorklets(ctx: AudioContext) {
    if (!ctx) {
      console.error('AudioContext is not provided');
      return;
    }
    if (!ctx.audioWorklet) {
      console.error('AudioWorklet is not supported');
      return;
    }
    await Promise.all(
      Object.values(this.worklets).map((loader) => loader(ctx)),
    );
  }
}

const plugins = {
  chorus: chorusPlugin,
  compressor: compressorPlugin,
  delay: delayPlugin,
  distortion: distorionPlugin,
  filter: filterPlugin,
  flanger: flangerPlugin,
  limiter: limiterPlugin,
  phaser: phaserPlugin,
  reverb: reverbPlugin,
  stereoWidener: stereoWidnerPlugin,
  tremelo: tremoloPlugin,
  granular: granularPlugin,
  pingpong: pingPongDelayPlugin,
  bitcrusher: bitcrusherPlugin,
  formantFilter: formantFilterPlugin,
  sonicTransformer: sonicTransformerPlugin,
  spectralShaper: spectralShaperPlugin,
  dimExpander: dimensionExpanderPlugin,
};

export const workletsLoader = new WorkletsLoader({
  granular: loadGranularWorklet,
  pingpong: loadPingPongDelayWorklet,
  bitcrusher: loadBitcrusherWorklet,
  formantFilter: loadFormantFilterWorklet,
  sonicTransformer: loadSonicTransformerWorklet,
  spectralShaper: loadSpectralShaperWorklet,
  dimExpander: loadDimensionExpanderWorklet,
});

export default plugins;
