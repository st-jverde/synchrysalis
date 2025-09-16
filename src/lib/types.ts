export type LayerType = 'binaural' | 'isochronic' | 'monaural';

export type WaveformType = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface EnvelopeParams {
  attack: number;   // seconds
  decay: number;    // seconds
  sustain: number;  // 0-1
  release: number;  // seconds
}

export interface LFOParams {
  enabled: boolean;
  rateHz: number;   // 0.05-0.5 Hz
  depth: number;    // 0-30%
  target: 'beat' | 'gain';
}

export interface LayerParams {
  id: string;
  type: LayerType;
  carrierLeft?: number;   // binaural left ear (Hz)
  carrierRight?: number;  // binaural right ear (Hz)
  carrier?: number;       // iso/monaural carrier (Hz)
  beatHz: number;         // 0.5-40 Hz
  waveform: WaveformType;
  gainDb: number;         // -48 to 0 dB
  pan: number;            // -1 to +1
  env: EnvelopeParams;
  lfo?: LFOParams;
  muted: boolean;
  solo: boolean;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  layers: LayerParams[];
}

export interface AudioState {
  isPlaying: boolean;
  masterGainDb: number;
  sessionLength: number | null; // minutes, null = no auto-stop
  elapsedTime: number; // seconds
}

export interface MeterData {
  rms: number;
  peak: number;
  left: number;
  right: number;
}
