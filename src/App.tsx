import { useState, useEffect, useRef } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { TransportBar } from './components/TransportBar';
import { PresetBar } from './components/PresetBar';
import { LayerCard } from './components/LayerCard';
import { useAudioEngine } from './hooks/useAudioEngine';
import { createDefaultLayer, builtInPresets } from './lib/presets';
import type { LayerParams } from './lib/types';

function App() {
  // Initialize disclaimer state based on localStorage to prevent flash
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const dismissed = localStorage.getItem('synchrysalis_disclaimer_dismissed');
    return dismissed !== 'true';
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasLoadedDefaultPreset = useRef(false);

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

  // Wrapper for async setMasterGain
  const handleMasterGainChange = (db: number) => {
    setMasterGain(db).catch(error => {
      console.error('Failed to set master gain:', error);
    });
  };

  // Initialize with Productivity preset on first load
  useEffect(() => {
    if (!hasLoadedDefaultPreset.current && layers.length === 0) {
      const productivityPreset = builtInPresets.find(p => p.id === 'productivity');
      if (productivityPreset) {
        hasLoadedDefaultPreset.current = true;
        // Await the async loadPreset to ensure layers are loaded before component renders
        loadPreset(productivityPreset.layers).catch(error => {
          console.error('Failed to load Productivity preset on init:', error);
        });
      } else {
        // Fallback to default layer if Productivity preset not found
        addLayer(createDefaultLayer('binaural'));
      }
    }
  }, [layers.length, loadPreset, addLayer]);

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
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <Disclaimer onDismiss={() => setShowDisclaimer(false)} />
      )}

      {/* Header */}
      <header className="bg-neutral-800/50 backdrop-blur-sm shadow-lg border-b border-neutral-700/50 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-neutral-100">Synchrysalis</h1>
              <span className="text-sm text-neutral-400">Brainwave Entrainment</span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-visible">
        {/* Transport Bar */}
        <TransportBar
          audioState={audioState}
          meterData={meterData}
          onStart={handleStart}
          onStop={stop}
          onMasterGainChange={handleMasterGainChange}
          onSessionLengthChange={setSessionLength}
        />

        {/* Preset Bar */}
        <PresetBar
          onLoadPreset={loadPreset}
          currentLayers={layers}
        />

        {/* Layer Management */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-100">
              Entrainment Layers ({layers.length}/8)
            </h2>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAddLayer('binaural')}
                disabled={layers.length >= 8}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Binaural
              </button>
              <button
                onClick={() => handleAddLayer('isochronic')}
                disabled={layers.length >= 8}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Isochronic
              </button>
              <button
                onClick={() => handleAddLayer('monaural')}
                disabled={layers.length >= 8}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Monaural
              </button>
            </div>
          </div>
        </div>

        {/* Layers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {layers.map((layer) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              onUpdate={updateLayer}
              onRemove={removeLayer}
              onDuplicate={handleDuplicateLayer}
              onToggleMute={toggleMute}
              onToggleSolo={toggleSolo}
            />
          ))}
        </div>

        {/* Empty State */}
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
                onClick={() => handleAddLayer('binaural')}
                className="btn-primary"
              >
                Add Binaural Layer
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
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
