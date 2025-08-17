import * as Tone from 'tone';
import type { LayerParams } from './types';

export interface AudioNodeGroup {
  id: string;
  nodes: {
    oscillators: Tone.Oscillator[];
    gain: Tone.Gain;
    panner: Tone.Panner;
    filter?: Tone.Filter;
    lfo?: Tone.LFO;
  };
  dispose: () => void;
}

export class AudioGraphManager {
  private masterGain: Tone.Gain;
  private limiter: Tone.Limiter;
  private meter: Tone.Meter;
  private reverb: Tone.Reverb;
  private reverbSend: Tone.Gain;
  private nodes: Map<string, AudioNodeGroup> = new Map();
  private isInitialized = false;

  constructor() {
    // Initialize audio nodes
    this.masterGain = new Tone.Gain(-18); // -18 dB default
    this.limiter = new Tone.Limiter(-3); // -3 dB threshold
    this.meter = new Tone.Meter();
    this.reverb = new Tone.Reverb(1.5);
    this.reverbSend = new Tone.Gain(-20); // -20 dB reverb send

    // Connect the audio chain
    this.masterGain.chain(this.limiter, this.meter, Tone.Destination);
    this.reverbSend.connect(this.reverb);
    this.reverb.toDestination();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();
    await this.reverb.generate();
    this.isInitialized = true;
  }

  createLayerNodes(params: LayerParams): AudioNodeGroup {
    const nodes = this.buildNodesForType(params);

    // Connect to master chain
    nodes.gain.connect(this.masterGain);
    nodes.gain.connect(this.reverbSend);

    // Apply initial parameters
    this.updateLayerNodes(params.id, params);

    return {
      id: params.id,
      nodes,
      dispose: () => this.disposeLayerNodes(params.id)
    };
  }

  private buildNodesForType(params: LayerParams) {
    const gain = new Tone.Gain();
    const panner = new Tone.Panner(params.pan);
    const filter = new Tone.Filter(800, 'lowpass');

    gain.chain(panner, filter, this.masterGain);

    switch (params.type) {
      case 'binaural':
        return this.buildBinauralNodes(params, gain, panner, filter);
      case 'isochronic':
        return this.buildIsochronicNodes(params, gain, panner, filter);
      case 'monaural':
        return this.buildMonauralNodes(params, gain, panner, filter);
    }
  }

  private buildBinauralNodes(params: LayerParams, gain: Tone.Gain, panner: Tone.Panner, filter: Tone.Filter) {
    const leftOsc = new Tone.Oscillator(params.carrierLeft! - params.beatHz / 2, params.waveform);
    const rightOsc = new Tone.Oscillator(params.carrierRight! + params.beatHz / 2, params.waveform);

    const leftGain = new Tone.Gain();
    const rightGain = new Tone.Gain();

    leftOsc.chain(leftGain, new Tone.Panner(-1), gain);
    rightOsc.chain(rightGain, new Tone.Panner(1), gain);

    return {
      oscillators: [leftOsc, rightOsc],
      gain,
      panner,
      filter,
      leftGain,
      rightGain
    };
  }

  private buildIsochronicNodes(params: LayerParams, gain: Tone.Gain, panner: Tone.Panner, filter: Tone.Filter) {
    const osc = new Tone.Oscillator(params.carrier!, params.waveform);
    const lfo = new Tone.LFO(params.beatHz, 0, 1);
    const gate = new Tone.Gain();

    lfo.connect(gate.gain);
    osc.chain(gate, gain);
    lfo.start();

    return {
      oscillators: [osc],
      gain,
      panner,
      filter,
      lfo
    };
  }

  private buildMonauralNodes(params: LayerParams, gain: Tone.Gain, panner: Tone.Panner, filter: Tone.Filter) {
    const carrierOsc = new Tone.Oscillator(params.carrier!, params.waveform);
    const beatOsc = new Tone.Oscillator(params.carrier! + params.beatHz, params.waveform);

    const carrierGain = new Tone.Gain(0.5);
    const beatGain = new Tone.Gain(0.5);

    carrierOsc.chain(carrierGain, gain);
    beatOsc.chain(beatGain, gain);

    return {
      oscillators: [carrierOsc, beatOsc],
      gain,
      panner,
      filter,
      carrierGain,
      beatGain
    };
  }

  updateLayerNodes(id: string, params: Partial<LayerParams>): void {
    const nodeGroup = this.nodes.get(id);
    if (!nodeGroup) return;

    const { nodes } = nodeGroup;

    // Update basic parameters
    if (params.gainDb !== undefined) {
      nodes.gain.gain.rampTo(Tone.gainToDb(params.gainDb), 0.1);
    }

    if (params.pan !== undefined) {
      nodes.panner.pan.rampTo(params.pan, 0.1);
    }

    if (params.waveform !== undefined) {
      nodes.oscillators.forEach(osc => {
        osc.type = params.waveform!;
      });
    }

    // Update type-specific parameters
    if (params.type === 'binaural' && (params.carrierLeft !== undefined || params.carrierRight !== undefined || params.beatHz !== undefined)) {
      const leftOsc = nodes.oscillators[0];
      const rightOsc = nodes.oscillators[1];

      if (params.carrierLeft !== undefined || params.beatHz !== undefined) {
        const leftFreq = (params.carrierLeft ?? params.carrierLeft!) - (params.beatHz ?? params.beatHz!) / 2;
        leftOsc.frequency.rampTo(leftFreq, 0.2);
      }

      if (params.carrierRight !== undefined || params.beatHz !== undefined) {
        const rightFreq = (params.carrierRight ?? params.carrierRight!) + (params.beatHz ?? params.beatHz!) / 2;
        rightOsc.frequency.rampTo(rightFreq, 0.2);
      }
    } else if (params.type === 'isochronic' && (params.carrier !== undefined || params.beatHz !== undefined)) {
      const osc = nodes.oscillators[0];
      const lfo = nodes.lfo!;

      if (params.carrier !== undefined) {
        osc.frequency.rampTo(params.carrier, 0.2);
      }

      if (params.beatHz !== undefined) {
        lfo.frequency.rampTo(params.beatHz, 0.2);
      }
    } else if (params.type === 'monaural' && (params.carrier !== undefined || params.beatHz !== undefined)) {
      const carrierOsc = nodes.oscillators[0];
      const beatOsc = nodes.oscillators[1];

      if (params.carrier !== undefined) {
        carrierOsc.frequency.rampTo(params.carrier, 0.2);
        beatOsc.frequency.rampTo(params.carrier + (params.beatHz ?? params.beatHz!), 0.2);
      } else if (params.beatHz !== undefined) {
        beatOsc.frequency.rampTo(params.carrier! + params.beatHz, 0.2);
      }
    }

    // Update LFO if present
    if (params.lfo?.enabled && nodes.lfo) {
      nodes.lfo.frequency.rampTo(params.lfo.rateHz, 0.1);
      // Note: LFO depth control would need to be implemented differently
    }
  }

  startLayer(id: string): void {
    const nodeGroup = this.nodes.get(id);
    if (!nodeGroup) return;

    nodeGroup.nodes.oscillators.forEach(osc => {
      osc.start();
    });

    if (nodeGroup.nodes.lfo) {
      nodeGroup.nodes.lfo.start();
    }
  }

  stopLayer(id: string): void {
    const nodeGroup = this.nodes.get(id);
    if (!nodeGroup) return;

    nodeGroup.nodes.oscillators.forEach(osc => {
      osc.stop();
    });

    if (nodeGroup.nodes.lfo) {
      nodeGroup.nodes.lfo.stop();
    }
  }

  addLayer(params: LayerParams): AudioNodeGroup {
    const nodeGroup = this.createLayerNodes(params);
    this.nodes.set(params.id, nodeGroup);
    return nodeGroup;
  }

  removeLayer(id: string): void {
    const nodeGroup = this.nodes.get(id);
    if (nodeGroup) {
      nodeGroup.dispose();
      this.nodes.delete(id);
    }
  }

  disposeLayerNodes(id: string): void {
    const nodeGroup = this.nodes.get(id);
    if (!nodeGroup) return;

    const { nodes } = nodeGroup;

    // Stop all oscillators
    nodes.oscillators.forEach(osc => {
      osc.stop();
      osc.dispose();
    });

    // Dispose other nodes
    nodes.gain.dispose();
    nodes.panner.dispose();
    nodes.filter?.dispose();
    nodes.lfo?.dispose();

    this.nodes.delete(id);
  }

  setMasterGain(db: number): void {
    this.masterGain.gain.rampTo(Tone.gainToDb(db), 0.1);
  }

  getMeterData(): { rms: number; peak: number; left: number; right: number } {
    const value = this.meter.getValue() as number;
    return {
      rms: value,
      peak: value,
      left: value,
      right: value
    };
  }

  getDestination(): MediaStreamAudioDestinationNode {
    return Tone.context.createMediaStreamDestination();
  }

  dispose(): void {
    // Dispose all layer nodes
    this.nodes.forEach(nodeGroup => {
      nodeGroup.dispose();
    });
    this.nodes.clear();

    // Dispose master nodes
    this.masterGain.dispose();
    this.limiter.dispose();
    this.meter.dispose();
    this.reverb.dispose();
    this.reverbSend.dispose();
  }
}
