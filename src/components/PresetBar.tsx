import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Preset, LayerParams } from '../lib/types';
import { PresetSelector } from './PresetSelector';
import { usePresets } from '../hooks/usePresets';

interface PresetBarProps {
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
  currentLayers: LayerParams[];
}

export const PresetBar = ({ selectedPreset, onSelectPreset, currentLayers }: PresetBarProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  const { savePreset, deletePreset, isPresetNameTaken } = usePresets();

  const handleSavePreset = () => {
    if (!saveName.trim()) return;

    if (isPresetNameTaken(saveName)) {
      alert('A preset with this name already exists. Please choose a different name.');
      return;
    }

    savePreset(saveName, saveDescription, currentLayers);
    setShowSaveDialog(false);
    setSaveName('');
    setSaveDescription('');
  };

  const handleDeletePreset = (preset: Preset) => {
    if (confirm(`Are you sure you want to delete "${preset.name}"?`)) {
      deletePreset(preset.id);
    }
  };

  return (
    <div className="card mb-6 overflow-visible">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <PresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={onSelectPreset}
          onDeletePreset={handleDeletePreset}
          className="flex-1"
        />

        <div className="flex space-x-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="btn-secondary"
            disabled={currentLayers.length === 0}
          >
            💾 Save Current
          </button>
        </div>
      </div>

      {showSaveDialog && createPortal(
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-neutral-100">Save Preset</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter preset name..."
                  className="input-field"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Describe this preset..."
                  className="input-field resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!saveName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
