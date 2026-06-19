import { useState, useEffect, useRef, useCallback } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { PresetView } from './components/PresetView';
import { EditorView } from './components/EditorView';
import { ViewModeToggle, type ViewMode } from './components/ViewModeToggle';
import { useAudioEngine } from './hooks/useAudioEngine';
import { createDefaultLayer, builtInPresets } from './lib/presets';
import type { LayerParams, Preset } from './lib/types';

function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const dismissed = localStorage.getItem('synchrysalis_disclaimer_dismissed');
    return dismissed !== 'true';
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preset');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const hasInitializedPreset = useRef(false);

  const {
    audioState,
    layers,
    meterData,
    start,
    stop,
    addLayer,
    updateLayer,
    removeLayer,
    toggleMute,
    toggleSolo,
    setMasterGain,
    setSessionLength,
    loadPreset,
    initializeAudio,
  } = useAudioEngine();

  const handleMasterGainChange = (db: number) => {
    setMasterGain(db).catch(error => {
      console.error('Failed to set master gain:', error);
    });
  };

  const handleSelectPreset = useCallback(async (preset: Preset): Promise<boolean> => {
    setSelectedPreset(preset);
    const success = await loadPreset(preset.layers);
    if (!success) {
      console.error(`Failed to load preset: ${preset.name}`);
      setSelectedPreset(null);
    }
    return success;
  }, [loadPreset]);

  useEffect(() => {
    if (hasInitializedPreset.current) return;

    const productivityPreset = builtInPresets.find(p => p.id === 'productivity');
    if (productivityPreset) {
      hasInitializedPreset.current = true;
      handleSelectPreset(productivityPreset).then(success => {
        if (!success) {
          hasInitializedPreset.current = false;
        }
      });
    }
  }, [handleSelectPreset]);

  const handleStart = async () => {
    if (!hasInteracted) {
      await initializeAudio();
      setHasInteracted(true);
    }
    await start();
  };

  const handleAddLayer = (type: 'binaural' | 'isochronic' | 'monaural') => {
    if (layers.length >= 8) {
      alert('Maximum 8 layers allowed');
      return;
    }
    addLayer(createDefaultLayer(type));
  };

  const handleDuplicateLayer = (layer: LayerParams) => {
    if (layers.length >= 8) {
      alert('Maximum 8 layers allowed');
      return;
    }
    const duplicatedLayer = {
      ...layer,
      id: crypto.randomUUID(),
    };
    addLayer(duplicatedLayer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-visible">
      {showDisclaimer && (
        <Disclaimer onDismiss={() => setShowDisclaimer(false)} />
      )}

      <header className="bg-neutral-800/50 backdrop-blur-sm shadow-lg border-b border-neutral-700/50 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-neutral-100">Synchrysalis</h1>
              <span className="text-sm text-neutral-400">Brainwave Entrainment</span>
            </div>

            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-visible">
        {viewMode === 'preset' ? (
          <PresetView
            selectedPreset={selectedPreset}
            onSelectPreset={handleSelectPreset}
            audioState={audioState}
            meterData={meterData}
            onStart={handleStart}
            onStop={stop}
            onMasterGainChange={handleMasterGainChange}
            onSessionLengthChange={setSessionLength}
          />
        ) : (
          <EditorView
            audioState={audioState}
            meterData={meterData}
            layers={layers}
            selectedPreset={selectedPreset}
            onStart={handleStart}
            onStop={stop}
            onMasterGainChange={handleMasterGainChange}
            onSessionLengthChange={setSessionLength}
            onSelectPreset={handleSelectPreset}
            onAddLayer={handleAddLayer}
            onUpdateLayer={updateLayer}
            onRemoveLayer={removeLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onToggleMute={toggleMute}
            onToggleSolo={toggleSolo}
          />
        )}
      </main>

      <footer className="bg-neutral-800/50 backdrop-blur-sm border-t border-neutral-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-neutral-400">
            <p>
              Synchrysalis - Experimental brainwave entrainment tool for entertainment and relaxation purposes only.
            </p>
            <p className="mt-1">
              Not intended for medical use. Use responsibly and stop if you experience any discomfort.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
