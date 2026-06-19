import type { LayerParams, Preset, AudioState, MeterData } from '../lib/types';
import { TransportBar } from './TransportBar';
import { PresetBar } from './PresetBar';
import { LayerCard } from './LayerCard';

interface EditorViewProps {
  audioState: AudioState;
  meterData: MeterData;
  layers: LayerParams[];
  selectedPreset: Preset | null;
  onStart: () => void;
  onStop: () => void;
  onMasterGainChange: (db: number) => void;
  onSessionLengthChange: (minutes: number | null) => void;
  onSelectPreset: (preset: Preset) => void;
  onAddLayer: (type: 'binaural' | 'isochronic' | 'monaural') => void;
  onUpdateLayer: (id: string, updates: Partial<LayerParams>) => void;
  onRemoveLayer: (id: string) => void;
  onDuplicateLayer: (layer: LayerParams) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
}

export const EditorView = ({
  audioState,
  meterData,
  layers,
  selectedPreset,
  onStart,
  onStop,
  onMasterGainChange,
  onSessionLengthChange,
  onSelectPreset,
  onAddLayer,
  onUpdateLayer,
  onRemoveLayer,
  onDuplicateLayer,
  onToggleMute,
  onToggleSolo,
}: EditorViewProps) => {
  return (
    <>
      <TransportBar
        audioState={audioState}
        meterData={meterData}
        onStart={onStart}
        onStop={onStop}
        onMasterGainChange={onMasterGainChange}
        onSessionLengthChange={onSessionLengthChange}
      />

      <PresetBar
        selectedPreset={selectedPreset}
        onSelectPreset={onSelectPreset}
        currentLayers={layers}
      />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-100">
            Entrainment Layers ({layers.length}/8)
          </h2>

          <div className="flex space-x-2">
            <button
              onClick={() => onAddLayer('binaural')}
              disabled={layers.length >= 8}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Binaural
            </button>
            <button
              onClick={() => onAddLayer('isochronic')}
              disabled={layers.length >= 8}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Isochronic
            </button>
            <button
              onClick={() => onAddLayer('monaural')}
              disabled={layers.length >= 8}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Monaural
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {layers.map((layer) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            onUpdate={onUpdateLayer}
            onRemove={onRemoveLayer}
            onDuplicate={onDuplicateLayer}
            onToggleMute={onToggleMute}
            onToggleSolo={onToggleSolo}
          />
        ))}
      </div>

      {layers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-neutral-100 mb-2">
            No layers yet
          </h3>
          <p className="text-neutral-400 mb-4">
            Add your first entrainment layer to get started
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => onAddLayer('binaural')}
              className="btn-primary"
            >
              Add Binaural Layer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
