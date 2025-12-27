import { useState } from 'react';
import type { LayerParams, LayerType, WaveformType } from '../lib/types';
import { createDefaultLayer } from '../lib/presets';
import { EditableSlider } from './EditableSlider';

interface LayerCardProps {
  layer: LayerParams;
  onUpdate: (id: string, updates: Partial<LayerParams>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (layer: LayerParams) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
}

export const LayerCard = ({
  layer,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleMute,
  onToggleSolo,
}: LayerCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeChange = (newType: LayerType) => {
    const newLayer = createDefaultLayer(newType);
    onUpdate(layer.id, {
      type: newType,
      carrierLeft: newLayer.carrierLeft,
      carrierRight: newLayer.carrierRight,
      carrier: newLayer.carrier,
      beatHz: newLayer.beatHz,
      waveform: newLayer.waveform,
      gainDb: newLayer.gainDb,
      pan: newLayer.pan,
      env: newLayer.env,
      lfo: newLayer.lfo,
    });
  };

  const getTypeColor = (type: LayerType): string => {
    switch (type) {
      case 'binaural': return 'bg-blue-900/50 text-blue-300 border-blue-700/50';
      case 'isochronic': return 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50';
      case 'monaural': return 'bg-purple-900/50 text-purple-300 border-purple-700/50';
    }
  };

  const getTypeIcon = (type: LayerType): string => {
    switch (type) {
      case 'binaural': return '🎧';
      case 'isochronic': return '⚡';
      case 'monaural': return '🔊';
    }
  };

  return (
    <div className={`card transition-all duration-200 ${layer.muted ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(layer.type)}`}>
            {getTypeIcon(layer.type)} {layer.type}
          </span>
          <span className="text-sm font-medium text-neutral-300">
            {layer.beatHz.toFixed(1)} Hz
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Solo Controls */}
          <button
            onClick={() => onToggleMute(layer.id)}
            className={`p-1 rounded ${layer.muted ? 'bg-rose-900/50 text-rose-400' : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50'}`}
            title={layer.muted ? 'Unmute' : 'Mute'}
          >
            🔇
          </button>
          <button
            onClick={() => onToggleSolo(layer.id)}
            className={`p-1 rounded ${layer.solo ? 'bg-amber-900/50 text-amber-400' : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50'}`}
            title={layer.solo ? 'Unsolo' : 'Solo'}
          >
            🎯
          </button>

          {/* Action Buttons */}
          <button
            onClick={() => onDuplicate(layer)}
            className="p-1 rounded bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50"
            title="Duplicate"
          >
            📋
          </button>
          <button
            onClick={() => onRemove(layer.id)}
            className="p-1 rounded bg-rose-900/50 text-rose-400 hover:bg-rose-800/50"
            title="Delete"
          >
            🗑
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Basic Controls (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Type</label>
          <select
            value={layer.type}
            onChange={(e) => handleTypeChange(e.target.value as LayerType)}
            className="input-field"
          >
            <option value="binaural">Binaural</option>
            <option value="isochronic">Isochronic</option>
            <option value="monaural">Monaural</option>
          </select>
        </div>

        {/* Beat Frequency */}
        <EditableSlider
          value={layer.beatHz}
          min={0.1}
          max={40}
          step={0.1}
          onChange={(value) => {
            // For binaural layers, adjust carrier frequencies to maintain distance
            if (layer.type === 'binaural') {
              const currentLeft = layer.carrierLeft || 200;
              const currentRight = layer.carrierRight || 210;
              const centerFreq = (currentLeft + currentRight) / 2;

              // Calculate new carrier frequencies maintaining the center
              let newLeft = centerFreq - value / 2;
              let newRight = centerFreq + value / 2;

              // Ensure both carriers are at least 20Hz
              const minCarrier = 20;
              if (newLeft < minCarrier) {
                // Shift center up to ensure left >= 20
                const requiredCenter = minCarrier + value / 2;
                newLeft = minCarrier;
                newRight = requiredCenter + value / 2;
              } else if (newRight < minCarrier) {
                // Shift center down to ensure right >= 20
                const requiredCenter = minCarrier - value / 2;
                newLeft = requiredCenter - value / 2;
                newRight = minCarrier;
              }

              onUpdate(layer.id, {
                beatHz: value,
                carrierLeft: newLeft,
                carrierRight: newRight
              });
            } else {
              onUpdate(layer.id, { beatHz: value });
            }
          }}
          label="Beat"
          unit=" Hz"
          formatValue={(val) => val.toFixed(1)}
        />

        {/* Waveform */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Waveform</label>
          <select
            value={layer.waveform}
            onChange={(e) => onUpdate(layer.id, { waveform: e.target.value as WaveformType })}
            className="input-field"
          >
            <option value="sine">Sine</option>
            <option value="triangle">Triangle</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
          </select>
        </div>

        {/* Gain */}
        <EditableSlider
          value={layer.gainDb}
          min={-48}
          max={0}
          step={0.5}
          onChange={(value) => onUpdate(layer.id, { gainDb: value })}
          label="Gain"
          unit=" dB"
          formatValue={(val) => val.toFixed(1)}
        />
      </div>

                {/* Expanded Controls */}
          {isExpanded && (
            <div className="space-y-6 border-t border-neutral-700/50 pt-4">
              {/* Carrier Frequencies */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-3">Carrier Frequencies</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layer.type === 'binaural' ? (
                <>
                  <EditableSlider
                    value={layer.carrierLeft || 200}
                    min={20}
                    max={600}
                    step={1}
                    onChange={(value) => {
                      // When carrierLeft changes, update beat frequency to maintain distance
                      const currentRight = layer.carrierRight || 210;
                      const newBeat = Math.abs(currentRight - value);
                      onUpdate(layer.id, {
                        carrierLeft: value,
                        beatHz: newBeat
                      });
                    }}
                    label="Left"
                    unit=" Hz"
                    formatValue={(val) => val.toFixed(0)}
                  />
                  <EditableSlider
                    value={layer.carrierRight || 210}
                    min={20}
                    max={600}
                    step={1}
                    onChange={(value) => {
                      // When carrierRight changes, update beat frequency to maintain distance
                      const currentLeft = layer.carrierLeft || 200;
                      const newBeat = Math.abs(value - currentLeft);
                      onUpdate(layer.id, {
                        carrierRight: value,
                        beatHz: newBeat
                      });
                    }}
                    label="Right"
                    unit=" Hz"
                    formatValue={(val) => val.toFixed(0)}
                  />
                </>
              ) : (
                <EditableSlider
                  value={layer.carrier || 200}
                  min={20}
                  max={600}
                  step={1}
                  onChange={(value) => onUpdate(layer.id, { carrier: value })}
                  label="Carrier"
                  unit=" Hz"
                  formatValue={(val) => val.toFixed(0)}
                />
              )}
            </div>
          </div>

                        {/* Panning */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-3">Panning</h4>
                <div>
                  <EditableSlider
                    value={layer.pan}
                    min={-1}
                    max={1}
                    step={0.01}
                    onChange={(value) => onUpdate(layer.id, { pan: value })}
                    label="Pan"
                    formatValue={(val) => val.toFixed(2)}
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>Left</span>
                    <span>Center</span>
                    <span>Right</span>
                  </div>
                </div>
              </div>

                        {/* Envelope */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-3">Envelope (ADSR)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EditableSlider
                value={layer.env.attack}
                min={0.01}
                max={5}
                step={0.01}
                onChange={(value) => onUpdate(layer.id, {
                  env: { ...layer.env, attack: value }
                })}
                label="Attack"
                unit="s"
                formatValue={(val) => val.toFixed(2)}
              />
              <EditableSlider
                value={layer.env.decay}
                min={0.01}
                max={5}
                step={0.01}
                onChange={(value) => onUpdate(layer.id, {
                  env: { ...layer.env, decay: value }
                })}
                label="Decay"
                unit="s"
                formatValue={(val) => val.toFixed(2)}
              />
              <EditableSlider
                value={layer.env.sustain}
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => onUpdate(layer.id, {
                  env: { ...layer.env, sustain: value }
                })}
                label="Sustain"
                unit="%"
                formatValue={(val) => (val * 100).toFixed(0)}
              />
              <EditableSlider
                value={layer.env.release}
                min={0.01}
                max={10}
                step={0.01}
                onChange={(value) => onUpdate(layer.id, {
                  env: { ...layer.env, release: value }
                })}
                label="Release"
                unit="s"
                formatValue={(val) => val.toFixed(2)}
              />
            </div>
          </div>

                        {/* LFO */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-3">LFO Modulation</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                                  <input
                    type="checkbox"
                    checked={layer.lfo?.enabled || false}
                    onChange={(e) => onUpdate(layer.id, {
                      lfo: {
                        enabled: e.target.checked,
                        rateHz: layer.lfo?.rateHz || 0.1,
                        depth: layer.lfo?.depth || 10,
                        target: layer.lfo?.target || 'beat'
                      }
                    })}
                    className="rounded border-neutral-600 bg-neutral-800 text-indigo-600 focus:ring-indigo-500"
                  />
                <span className="text-sm text-neutral-300">Enable LFO</span>
              </div>

              {layer.lfo?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <EditableSlider
                    value={layer.lfo.rateHz}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    onChange={(value) => onUpdate(layer.id, {
                      lfo: { ...layer.lfo!, rateHz: value }
                    })}
                    label="Rate"
                    unit=" Hz"
                    formatValue={(val) => val.toFixed(2)}
                  />
                  <EditableSlider
                    value={layer.lfo.depth}
                    min={0}
                    max={30}
                    step={1}
                    onChange={(value) => onUpdate(layer.id, {
                      lfo: { ...layer.lfo!, depth: value }
                    })}
                    label="Depth"
                    unit="%"
                    formatValue={(val) => val.toFixed(0)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Target</label>
                    <select
                      value={layer.lfo.target}
                      onChange={(e) => onUpdate(layer.id, {
                        lfo: { ...layer.lfo!, target: e.target.value as 'beat' | 'gain' }
                      })}
                      className="input-field"
                    >
                      <option value="beat">Beat Frequency</option>
                      <option value="gain">Gain</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
