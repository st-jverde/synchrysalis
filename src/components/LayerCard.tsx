import { useState } from 'react';
import type { LayerParams, LayerType, WaveformType } from '../lib/types';
import { createDefaultLayer } from '../lib/presets';

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
      case 'binaural': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'isochronic': return 'bg-green-100 text-green-800 border-green-200';
      case 'monaural': return 'bg-purple-100 text-purple-800 border-purple-200';
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
          <span className="text-sm font-medium text-neutral-700">
            {layer.beatHz.toFixed(1)} Hz
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Solo Controls */}
          <button
            onClick={() => onToggleMute(layer.id)}
            className={`p-1 rounded ${layer.muted ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            title={layer.muted ? 'Unmute' : 'Mute'}
          >
            🔇
          </button>
          <button
            onClick={() => onToggleSolo(layer.id)}
            className={`p-1 rounded ${layer.solo ? 'bg-yellow-100 text-yellow-600' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            title={layer.solo ? 'Unsolo' : 'Solo'}
          >
            🎯
          </button>

          {/* Action Buttons */}
          <button
            onClick={() => onDuplicate(layer)}
            className="p-1 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            title="Duplicate"
          >
            📋
          </button>
          <button
            onClick={() => onRemove(layer.id)}
            className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete"
          >
            🗑
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
          <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
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
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Beat: {layer.beatHz.toFixed(1)} Hz
          </label>
          <input
            type="range"
            min="0.5"
            max="40"
            step="0.1"
            value={layer.beatHz}
            onChange={(e) => onUpdate(layer.id, { beatHz: parseFloat(e.target.value) })}
            className="slider"
          />
        </div>

        {/* Waveform */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Waveform</label>
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
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Gain: {layer.gainDb.toFixed(1)} dB
          </label>
          <input
            type="range"
            min="-48"
            max="0"
            step="0.5"
            value={layer.gainDb}
            onChange={(e) => onUpdate(layer.id, { gainDb: parseFloat(e.target.value) })}
            className="slider"
          />
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-4">
          {/* Carrier Frequencies */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Carrier Frequencies</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layer.type === 'binaural' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Left: {layer.carrierLeft?.toFixed(0)} Hz
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="600"
                      step="1"
                      value={layer.carrierLeft || 200}
                      onChange={(e) => onUpdate(layer.id, { carrierLeft: parseFloat(e.target.value) })}
                      className="slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Right: {layer.carrierRight?.toFixed(0)} Hz
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="600"
                      step="1"
                      value={layer.carrierRight || 210}
                      onChange={(e) => onUpdate(layer.id, { carrierRight: parseFloat(e.target.value) })}
                      className="slider"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Carrier: {layer.carrier?.toFixed(0)} Hz
                  </label>
                  <input
                    type="range"
                    min="80"
                    max="600"
                    step="1"
                    value={layer.carrier || 200}
                    onChange={(e) => onUpdate(layer.id, { carrier: parseFloat(e.target.value) })}
                    className="slider"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Panning */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Panning</h4>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pan: {layer.pan.toFixed(2)}
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={layer.pan}
                onChange={(e) => onUpdate(layer.id, { pan: parseFloat(e.target.value) })}
                className="slider"
              />
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
            </div>
          </div>

          {/* Envelope */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">Envelope (ADSR)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Attack: {layer.env.attack.toFixed(2)}s
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={layer.env.attack}
                  onChange={(e) => onUpdate(layer.id, {
                    env: { ...layer.env, attack: parseFloat(e.target.value) }
                  })}
                  className="slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Decay: {layer.env.decay.toFixed(2)}s
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.01"
                  value={layer.env.decay}
                  onChange={(e) => onUpdate(layer.id, {
                    env: { ...layer.env, decay: parseFloat(e.target.value) }
                  })}
                  className="slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sustain: {(layer.env.sustain * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={layer.env.sustain}
                  onChange={(e) => onUpdate(layer.id, {
                    env: { ...layer.env, sustain: parseFloat(e.target.value) }
                  })}
                  className="slider"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Release: {layer.env.release.toFixed(2)}s
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="10"
                  step="0.01"
                  value={layer.env.release}
                  onChange={(e) => onUpdate(layer.id, {
                    env: { ...layer.env, release: parseFloat(e.target.value) }
                  })}
                  className="slider"
                />
              </div>
            </div>
          </div>

          {/* LFO */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3">LFO Modulation</h4>
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
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Enable LFO</span>
              </div>

              {layer.lfo?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Rate: {layer.lfo.rateHz.toFixed(2)} Hz
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.01"
                      value={layer.lfo.rateHz}
                      onChange={(e) => onUpdate(layer.id, {
                        lfo: { ...layer.lfo!, rateHz: parseFloat(e.target.value) }
                      })}
                      className="slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Depth: {layer.lfo.depth.toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={layer.lfo.depth}
                      onChange={(e) => onUpdate(layer.id, {
                        lfo: { ...layer.lfo!, depth: parseFloat(e.target.value) }
                      })}
                      className="slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Target</label>
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
