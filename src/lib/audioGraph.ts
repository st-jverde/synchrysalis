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
    this.masterGain = new Tone.Gain(Tone.dbToGain(-45)); // -45 dB default for better headroom
    this.limiter = new Tone.Limiter(-3); // -3 dB threshold for better distortion prevention
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

    const nodeGroup = {
      id: params.id,
      nodes,
      dispose: () => this.disposeLayerNodes(params.id)
    };

    // Add to nodes map first, then apply any remaining parameters
    this.nodes.set(params.id, nodeGroup);

    // Apply initial parameters (now that nodeGroup is in the map)
    this.updateLayerNodes(params.id, params);

    return nodeGroup;
  }

  private buildNodesForType(params: LayerParams) {
    const gain = new Tone.Gain(Tone.dbToGain(params.gainDb)); // Set initial gain from params
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
      nodes.gain.gain.rampTo(Tone.dbToGain(params.gainDb), 0.1);
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

    try {
      nodeGroup.nodes.oscillators.forEach(osc => {
        if (osc.state !== 'started') {
          osc.start();
        }
      });

      if (nodeGroup.nodes.lfo && nodeGroup.nodes.lfo.state !== 'started') {
        nodeGroup.nodes.lfo.start();
      }
    } catch (error) {
      console.error('Error starting layer:', error);
    }
  }

  stopLayer(id: string): void {
    const nodeGroup = this.nodes.get(id);
    if (!nodeGroup) return;

    try {
      nodeGroup.nodes.oscillators.forEach(osc => {
        if (osc.state === 'started') {
          osc.stop();
        }
      });

      if (nodeGroup.nodes.lfo && nodeGroup.nodes.lfo.state === 'started') {
        nodeGroup.nodes.lfo.stop();
      }
    } catch (error) {
      console.error('Error stopping layer:', error);
    }
  }

  addLayer(params: LayerParams): AudioNodeGroup {
    const nodeGroup = this.createLayerNodes(params);
    // nodeGroup is already added to the map in createLayerNodes
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
    this.masterGain.gain.rampTo(Tone.dbToGain(db), 0.1);
  }

  getMeterData(): { rms: number; peak: number; left: number; right: number } {
    try {
      const value = this.meter.getValue() as number;
      // Ensure we don't get NaN or infinite values
      const safeValue = isFinite(value) ? value : -60;
      const clampedValue = Math.max(-60, Math.min(0, safeValue));

      return {
        rms: clampedValue,
        peak: clampedValue,
        left: clampedValue,
        right: clampedValue
      };
    } catch (error) {
      console.error('Error getting meter data:', error);
      return {
        rms: -60,
        peak: -60,
        left: -60,
        right: -60
      };
    }
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
