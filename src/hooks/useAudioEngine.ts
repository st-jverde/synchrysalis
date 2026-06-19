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
  const layersRef = useRef<LayerParams[]>([]);
  const audioStateRef = useRef(audioState);
  layersRef.current = layers;
  audioStateRef.current = audioState;

  // Set master gain
  const setMasterGain = useCallback(async (db: number) => {
    setAudioState(prev => ({ ...prev, masterGainDb: db }));

    if (audioGraphRef.current) {
      try {
        await Tone.context.resume();
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
      audioGraphRef.current = new AudioGraphManager(audioStateRef.current.masterGainDb);
      await audioGraphRef.current.initialize();

      isInitializedRef.current = true;

      // Sync layers that were loaded before audio was initialized (e.g. default preset on page load)
      layersRef.current.forEach(layer => {
        audioGraphRef.current!.addLayer(layer);
      });

    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, []);

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
      }

      // Ensure master gain is correct before starting layers
      audioGraphRef.current.setMasterGain(audioStateRef.current.masterGainDb, 0);

      // Start all layers
      layersRef.current.forEach(layer => {
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
                layersRef.current.forEach(layer => {
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
  }, [audioState.sessionLength, initializeAudio]);

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
      layersRef.current.forEach(layer => {
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
  }, []);

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

  // Load preset — returns true on success. Does not initialize audio; that happens on user gesture.
  const loadPreset = useCallback(async (presetLayers: LayerParams[]): Promise<boolean> => {
    try {
      if (audioState.isPlaying) {
        stop();
      }

      const freshLayers = presetLayers.map(layer => ({ ...layer, id: crypto.randomUUID() }));

      if (audioGraphRef.current && isInitializedRef.current) {
        layersRef.current.forEach(layer => {
          audioGraphRef.current!.removeLayer(layer.id);
        });
        freshLayers.forEach(layer => {
          audioGraphRef.current!.addLayer(layer);
        });
      }

      setLayers(freshLayers);
      return true;
    } catch (error) {
      console.error('Failed to load preset:', error);
      return false;
    }
  }, [audioState.isPlaying, stop]);

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
        audioGraphRef.current = null;
      }
      isInitializedRef.current = false;
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
