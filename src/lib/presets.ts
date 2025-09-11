import type { Preset, LayerParams } from './types';

// Helper to create a new layer with safe defaults
export const createDefaultLayer = (type: 'binaural' | 'isochronic' | 'monaural'): LayerParams => {
  const id = crypto.randomUUID();

  switch (type) {
    case 'binaural':
      return {
        id,
        type: 'binaural',
        carrierLeft: 200,
        carrierRight: 210,
        beatHz: 10,
        waveform: 'sine',
        gainDb: -40, // Much lower default gain to prevent distortion
        pan: 0,
        env: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      };
    case 'isochronic':
      return {
        id,
        type: 'isochronic',
        carrier: 200,
        beatHz: 10,
        waveform: 'sine',
        gainDb: -40, // Much lower default gain to prevent distortion
        pan: 0,
        env: { attack: 0.05, decay: 0.05, sustain: 0.9, release: 0.3 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      };
    case 'monaural':
      return {
        id,
        type: 'monaural',
        carrier: 200,
        beatHz: 10,
        waveform: 'sine',
        gainDb: -40, // Much lower default gain to prevent distortion
        pan: 0,
        env: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      };
  }
};

// Built-in presets
export const builtInPresets: Preset[] = [
  {
    id: 'alpha-focus',
    name: 'Alpha Focus',
    description: '10 Hz binaural beats for enhanced focus and concentration',
    layers: [
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 200,
        carrierRight: 210,
        beatHz: 10,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      },
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 300,
        carrierRight: 310,
        beatHz: 10.5,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.2, decay: 0.1, sustain: 0.7, release: 0.6 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      }
    ]
  },
  {
    id: 'theta-relax',
    name: 'Theta Deep Relax',
    description: '5 Hz mix of binaural and isochronic for deep relaxation',
    layers: [
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 150,
        carrierRight: 155,
        beatHz: 5,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.3, decay: 0.2, sustain: 0.9, release: 1.0 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      },
      {
        id: crypto.randomUUID(),
        type: 'isochronic',
        carrier: 200,
        beatHz: 5.2,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.1, decay: 0.1, sustain: 0.95, release: 0.8 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      }
    ]
  },
  {
    id: 'delta-sleep',
    name: 'Delta Sleep',
    description: '2 Hz low carriers for deep sleep and regeneration',
    layers: [
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 80,
        carrierRight: 82,
        beatHz: 2,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.5, decay: 0.3, sustain: 0.95, release: 2.0 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      },
      {
        id: crypto.randomUUID(),
        type: 'isochronic',
        carrier: 100,
        beatHz: 2.1,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.3, decay: 0.2, sustain: 0.9, release: 1.5 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      }
    ]
  },
  {
    id: 'gamma-burst',
    name: 'Gamma Burst',
    description: '40 Hz monaural with low gain + alpha support for cognitive enhancement',
    layers: [
      {
        id: crypto.randomUUID(),
        type: 'monaural',
        carrier: 200,
        beatHz: 40,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.05, decay: 0.05, sustain: 0.8, release: 0.2 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      },
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 200,
        carrierRight: 210,
        beatHz: 10,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      }
    ]
  },
  {
    id: 'theta-gamma-coupling',
    name: 'Theta-Gamma Coupling',
    description: '6 Hz + 40 Hz layers for enhanced learning and memory',
    layers: [
      {
        id: crypto.randomUUID(),
        type: 'binaural',
        carrierLeft: 200,
        carrierRight: 206,
        beatHz: 6,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.2, decay: 0.1, sustain: 0.8, release: 0.8 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      },
      {
        id: crypto.randomUUID(),
        type: 'monaural',
        carrier: 200,
        beatHz: 40,
        waveform: 'sine',
        gainDb: -40,
        pan: 0,
        env: { attack: 0.05, decay: 0.05, sustain: 0.7, release: 0.3 },
        lfo: { enabled: false, rateHz: 0.1, depth: 10, target: 'beat' },
        muted: false,
        solo: false,
      }
    ]
  },
  {
    id: 'blank',
    name: 'Blank Layer',
    description: 'Start with a single binaural layer',
    layers: [
      createDefaultLayer('binaural')
    ]
  }
];

// Helper functions for parameter validation and normalization
export const clampValue = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const normalizeLayerParams = (params: Partial<LayerParams>): LayerParams => {
  const defaults = createDefaultLayer('binaural');

  return {
    ...defaults,
    ...params,
    id: params.id || defaults.id,
    beatHz: clampValue(params.beatHz || defaults.beatHz, 0.5, 40),
    gainDb: clampValue(params.gainDb || defaults.gainDb, -48, -40),
    pan: clampValue(params.pan || defaults.pan, -1, 1),
    env: {
      attack: clampValue(params.env?.attack || defaults.env.attack, 0.01, 5),
      decay: clampValue(params.env?.decay || defaults.env.decay, 0.01, 5),
      sustain: clampValue(params.env?.sustain || defaults.env.sustain, 0, 1),
      release: clampValue(params.env?.release || defaults.env.release, 0.01, 10),
    },
    lfo: params.lfo ? {
      enabled: params.lfo.enabled,
      rateHz: clampValue(params.lfo.rateHz, 0.05, 0.5),
      depth: clampValue(params.lfo.depth, 0, 30),
      target: params.lfo.target,
    } : defaults.lfo,
  };
};
