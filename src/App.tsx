import { useState, useEffect } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { TransportBar } from './components/TransportBar';
import { PresetBar } from './components/PresetBar';
import { LayerCard } from './components/LayerCard';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useRecorder } from './hooks/useRecorder';
import { createDefaultLayer } from './lib/presets';
import type { LayerParams } from './lib/types';

function App() {
  // Initialize disclaimer state based on localStorage to prevent flash
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    const dismissed = localStorage.getItem('synchrysalis_disclaimer_dismissed');
    return dismissed !== 'true';
  });
  const [hasInteracted, setHasInteracted] = useState(false);

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

  const {
    isRecording,
    recordingTime,
    blob,
    startRecording,
    stopRecording,
    download,
  } = useRecorder();

  // Initialize with a default layer if none exist
  useEffect(() => {
    if (layers.length === 0) {
      addLayer(createDefaultLayer('binaural'));
    }
  }, [layers.length, addLayer]);

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

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <Disclaimer onDismiss={() => setShowDisclaimer(false)} />
      )}

      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-100">Synchrysalis</h1>
              <span className="text-sm text-slate-400">Brainwave Entrainment</span>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRecordingToggle}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-lg hover:shadow-xl'
                }`}
              >
                {isRecording ? '⏹ Stop Recording' : '🔴 Start Recording'}
              </button>

              {blob && (
                <button
                  onClick={download}
                  className="btn-primary"
                >
                  💾 Download
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transport Bar */}
        <TransportBar
          audioState={audioState}
          meterData={meterData}
          onStart={handleStart}
          onStop={stop}
          onMasterGainChange={setMasterGain}
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
            <h2 className="text-xl font-semibold text-slate-100">
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
            <h3 className="text-lg font-medium text-slate-100 mb-2">
              No layers yet
            </h3>
            <p className="text-slate-400 mb-4">
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

        {/* Recording Status */}
        {isRecording && (
          <div className="fixed bottom-4 right-4 bg-rose-900/90 backdrop-blur-sm text-rose-100 px-4 py-2 rounded-lg shadow-2xl border border-rose-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
              <span>Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-400">
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
