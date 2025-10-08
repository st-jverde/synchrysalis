import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

import { AudioGraphManager } from '../lib/audioGraph';
import type { LayerParams, AudioState, MeterData } from '../lib/types';

export const useAudioEngine = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    masterGainDb: -12, // Start with lower master gain to prevent distortion
    sessionLength: null,
    elapsedTime: 0,
  });

  const [layers, setLayers] = useState<LayerParams[]>([]);
  const [meterData, setMeterData] = useState<MeterData>({
    rms: -60,
    peak: -60,
    left: -60,
    right: -60,
  });

  const audioGraphRef = useRef<AudioGraphManager | null>(null);
  const sessionTimerRef = useRef<number | null>(null);
  const meterTimerRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Set master gain
  const setMasterGain = useCallback(async (db: number) => {
    // Always update the state first
    setAudioState(prev => ({ ...prev, masterGainDb: db }));

    // Then update the audio graph if it exists
    if (audioGraphRef.current) {
      try {
        // Force resume AudioContext every time we adjust master gain
        console.log('🎵 AudioContext state before resume:', Tone.context.state);
        await Tone.context.resume();
        console.log('🎵 AudioContext state after resume:', Tone.context.state);

        audioGraphRef.current.setMasterGain(db);
      } catch (error) {
        console.error('Failed to set master gain:', error);
      }
    }
  }, []);

  // Initialize audio graph
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log(`🎵 INIT - Already initialized, skipping`);
      return;
    }

    console.log(`🎵 INIT - Starting initialization...`);
    try {
      audioGraphRef.current = new AudioGraphManager();
      await audioGraphRef.current.initialize();

      // Only set master gain if it's different from the constructor default
      // This prevents unnecessary recreation and ensures sync between React state and audio graph
      console.log(`🎵 INIT - React state masterGainDb: ${audioState.masterGainDb}`);
      if (audioState.masterGainDb !== -18) {
        console.log(`🎵 INIT - Setting master gain to ${audioState.masterGainDb} (different from default -18dB)`);
        audioGraphRef.current.setMasterGain(audioState.masterGainDb);
      } else {
        console.log(`🎵 INIT - Skipping master gain set (already at default -18dB)`);
        // Log the actual master gain value to verify it's correct
        try {
          const currentLinearGain = audioGraphRef.current.getMasterGainValue();
          const currentDbGain = 20 * Math.log10(currentLinearGain);
          console.log(`🎵 INIT - Actual master gain in audio graph: ${currentDbGain.toFixed(1)} dB (${currentLinearGain.toFixed(6)} linear)`);
        } catch (error) {
          console.error(`🎵 INIT - Failed to get master gain value:`, error);
        }
      }

      isInitializedRef.current = true;

      // Force sync by moving the master fader slightly after initialization
      // This ensures the React state and audio graph are perfectly synchronized
      setTimeout(async () => {
        console.log(`🎵 SYNC - Forcing master gain sync...`);
        const originalGain = audioState.masterGainDb;
        const tempGain = originalGain - 0.5; // Move down 0.5dB

        // Set to temp value
        await setMasterGain(tempGain);

        // Wait a moment then set back to original
        setTimeout(async () => {
          await setMasterGain(originalGain);
          console.log(`🎵 SYNC - Master gain sync complete at ${originalGain}dB`);
        }, 100);
      }, 1000);

    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [audioState.masterGainDb, setMasterGain]);

  // Start audio playback
  const start = useCallback(async () => {
    if (!audioGraphRef.current || !isInitializedRef.current) {
      await initializeAudio();
    }

    if (!audioGraphRef.current) return;

    try {
      // Ensure AudioContext is resumed before starting playback
      if (Tone.context.state === 'suspended') {
        await Tone.context.resume();
        console.log('🎵 AudioContext resumed for playback');
      }

      // Start all layers
      layers.forEach(layer => {
        if (!layer.muted) {
          audioGraphRef.current!.startLayer(layer.id, layer.gainDb);
        }
      });

      // Initialize elapsed time based on session length
      const initialElapsedTime = audioState.sessionLength ? audioState.sessionLength * 60 : 0;
      setAudioState(prev => ({ ...prev, isPlaying: true, elapsedTime: initialElapsedTime }));

      // Start session timer (always runs to track elapsed time)
      sessionTimerRef.current = window.setInterval(() => {
        setAudioState(prev => {
          let newElapsedTime;

          if (prev.sessionLength) {
            // Count down from session length to zero
            newElapsedTime = prev.elapsedTime - 1;

            // Check if countdown reached zero
            if (newElapsedTime <= 0) {
              // Fade out playback when countdown reaches zero
              if (audioGraphRef.current) {
                layers.forEach(layer => {
                  audioGraphRef.current!.fadeOutLayer(layer.id, 1);
                });
              }
              setAudioState(prev => ({ ...prev, isPlaying: false }));

              // Clear meter timer after fade-out completes and set meter to -∞
              setTimeout(() => {
                if (meterTimerRef.current) {
                  clearInterval(meterTimerRef.current);
                  meterTimerRef.current = null;
                }
                // Set meter to -∞ after fade-out completes
                setMeterData({
                  rms: -60,
                  peak: -60,
                  left: -60,
                  right: -60
                });
              }, 1000); // Wait for fade-out to complete

              return prev;
            }
          } else {
            // Count up when no session length is set
            newElapsedTime = prev.elapsedTime + 1;
          }

          return { ...prev, elapsedTime: newElapsedTime };
        });
      }, 1000);

      // Start meter updates
      meterTimerRef.current = window.setInterval(() => {
        if (audioGraphRef.current) {
          const meterData = audioGraphRef.current.getMeterData();
          setMeterData(meterData);
        }
      }, 100); // Less frequent updates for stability

    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }, [layers, audioState.sessionLength, initializeAudio]);

  // Stop audio playback with fade out
  const stop = useCallback(() => {
    if (!audioGraphRef.current) return;

    // Immediately update UI state
    setAudioState(prev => ({ ...prev, isPlaying: false }));

    try {
      // Clear timers immediately
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      // Fade out all layers over 1 second (50% quicker)
      layers.forEach(layer => {
        audioGraphRef.current!.fadeOutLayer(layer.id, 1);
      });

      // Clear meter timer after fade-out completes and set meter to -∞
      setTimeout(() => {
        if (meterTimerRef.current) {
          clearInterval(meterTimerRef.current);
          meterTimerRef.current = null;
        }
        // Set meter to -∞ after fade-out completes
        setMeterData({
          rms: -60,
          peak: -60,
          left: -60,
          right: -60
        });
      }, 1000); // Wait for fade-out to complete

    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }, [layers]);

  // Add a new layer
  const addLayer = useCallback(async (params: LayerParams) => {
    if (!audioGraphRef.current || !isInitializedRef.current) {
      await initializeAudio();
    }

    if (!audioGraphRef.current) return;

    try {
      audioGraphRef.current.addLayer(params);
      setLayers(prev => [...prev, params]);
    } catch (error) {
      console.error('Failed to add layer:', error);
    }
  }, [initializeAudio]);

  // Update layer parameters
  const updateLayer = useCallback((id: string, updates: Partial<LayerParams>) => {
    if (!audioGraphRef.current) return;

    try {
      audioGraphRef.current.updateLayerNodes(id, updates);
      setLayers(prev => prev.map(layer =>
        layer.id === id ? { ...layer, ...updates } : layer
      ));
    } catch (error) {
      console.error('Failed to update layer:', error);
    }
  }, []);

  // Remove a layer
  const removeLayer = useCallback((id: string) => {
    if (!audioGraphRef.current) return;

    try {
      audioGraphRef.current.removeLayer(id);
      setLayers(prev => prev.filter(layer => layer.id !== id));
    } catch (error) {
      console.error('Failed to remove layer:', error);
    }
  }, []);

  // Toggle layer mute
  const toggleMute = useCallback((id: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        const newMuted = !layer.muted;
        if (audioGraphRef.current) {
          if (newMuted) {
            audioGraphRef.current.stopLayer(id);
          } else if (audioState.isPlaying) {
            audioGraphRef.current.startLayer(id, layer.gainDb);
          }
        }
        return { ...layer, muted: newMuted };
      }
      return layer;
    }));
  }, [audioState.isPlaying]);

  // Toggle layer solo
  const toggleSolo = useCallback((id: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        return { ...layer, solo: !layer.solo };
      }
      return layer;
    }));
  }, []);

  // Set session length
  const setSessionLength = useCallback((minutes: number | null) => {
    setAudioState(prev => ({ ...prev, sessionLength: minutes }));
  }, []);

  // Load preset
  const loadPreset = useCallback(async (presetLayers: LayerParams[]) => {
    if (!audioGraphRef.current || !isInitializedRef.current) {
      await initializeAudio();
    }

    if (!audioGraphRef.current) return;

    try {
      // Stop current playback
      if (audioState.isPlaying) {
        stop();
      }

      // Remove existing layers
      layers.forEach(layer => {
        audioGraphRef.current!.removeLayer(layer.id);
      });

      // Add new layers (with fresh IDs to avoid conflicts)
      const freshLayers = presetLayers.map(layer => ({ ...layer, id: crypto.randomUUID() }));
      freshLayers.forEach(layer => {
        audioGraphRef.current!.addLayer(layer);
      });

      setLayers(freshLayers);

      // Force sync after loading preset to ensure master fader stays synchronized
      setTimeout(async () => {
        console.log(`🎵 PRESET SYNC - Forcing master gain sync after preset load...`);
        const originalGain = audioState.masterGainDb;
        const tempGain = originalGain - 0.5; // Move down 0.5dB

        // Set to temp value
        await setMasterGain(tempGain);

        // Wait a moment then set back to original
        setTimeout(async () => {
          await setMasterGain(originalGain);
          console.log(`🎵 PRESET SYNC - Master gain sync complete at ${originalGain}dB`);
        }, 100);
      }, 500); // Shorter delay for preset changes

    } catch (error) {
      console.error('Failed to load preset:', error);
    }
  }, [audioState.isPlaying, stop, initializeAudio, layers, audioState.masterGainDb, setMasterGain]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      if (meterTimerRef.current) {
        clearInterval(meterTimerRef.current);
      }
      if (audioGraphRef.current) {
        audioGraphRef.current.dispose();
      }
    };
  }, []);

  return {
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
  };
};
