import { useState } from 'react';
import type { Preset, LayerParams } from '../lib/types';
import { usePresets } from '../hooks/usePresets';

interface PresetBarProps {
  onLoadPreset: (layers: LayerParams[]) => void;
  currentLayers: LayerParams[];
}

export const PresetBar = ({ onLoadPreset, currentLayers }: PresetBarProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const {
    allPresets,
    savePreset,
    deletePreset,
    isPresetNameTaken,
  } = usePresets();

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.layers);
    setShowPresetMenu(false);
  };

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
    <div className="card mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Preset Selector */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="w-full sm:w-80 btn-secondary flex items-center justify-between"
          >
            <span>{selectedPreset?.name || 'Select a preset...'}</span>
            <span className="text-xs">▼</span>
          </button>

          {showPresetMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl z-10 max-h-96 overflow-y-auto">
              <div className="p-2">
                {/* Built-in Presets */}
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Built-in Presets
                  </div>
                  {allPresets.filter(p => ['alpha-focus', 'theta-relax', 'delta-sleep', 'gamma-burst', 'theta-gamma-coupling', 'blank'].includes(p.id)).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset);
                        handleLoadPreset(preset);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-700/50 flex items-center justify-between text-slate-200"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-slate-400">{preset.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* User Presets */}
                {allPresets.filter(p => !['alpha-focus', 'theta-relax', 'delta-sleep', 'gamma-burst', 'theta-gamma-coupling', 'blank'].includes(p.id)).length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Your Presets
                    </div>
                    {allPresets.filter(p => !['alpha-focus', 'theta-relax', 'delta-sleep', 'gamma-burst', 'theta-gamma-coupling', 'blank'].includes(p.id)).map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between px-3 py-2 rounded text-sm hover:bg-slate-700/50"
                      >
                        <button
                          onClick={() => {
                            setSelectedPreset(preset);
                            handleLoadPreset(preset);
                          }}
                          className="flex-1 text-left text-slate-200"
                        >
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-slate-400">{preset.description}</div>
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset)}
                          className="ml-2 text-rose-400 hover:text-rose-300 text-xs"
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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

            {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-100">Save Preset</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">
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
        </div>
      )}
    </div>
  );
};
