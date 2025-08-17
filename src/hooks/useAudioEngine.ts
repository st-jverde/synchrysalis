import { useState, useEffect, useCallback, useRef } from 'react';

import { AudioGraphManager } from '../lib/audioGraph';
import type { LayerParams, AudioState, MeterData } from '../lib/types';

export const useAudioEngine = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isRecording: false,
    masterGainDb: -18,
    sessionLength: null,
    elapsedTime: 0,
    recordingTime: 0,
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

  // Initialize audio graph
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      audioGraphRef.current = new AudioGraphManager();
      await audioGraphRef.current.initialize();
      isInitializedRef.current = true;
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
      // Start all layers
      layers.forEach(layer => {
        if (!layer.muted) {
          audioGraphRef.current!.startLayer(layer.id);
        }
      });

      setAudioState(prev => ({ ...prev, isPlaying: true, elapsedTime: 0 }));

      // Start session timer
      if (audioState.sessionLength) {
        sessionTimerRef.current = window.setInterval(() => {
          setAudioState(prev => {
            const newElapsedTime = prev.elapsedTime + 1;
            if (newElapsedTime >= audioState.sessionLength! * 60) {
              stop();
              return prev;
            }
            return { ...prev, elapsedTime: newElapsedTime };
          });
        }, 1000);
      }

      // Start meter updates
      meterTimerRef.current = window.setInterval(() => {
        if (audioGraphRef.current) {
          const meterData = audioGraphRef.current.getMeterData();
          setMeterData(meterData);
        }
      }, 50);

    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  }, [layers, audioState.sessionLength, initializeAudio]);

  // Stop audio playback
  const stop = useCallback(() => {
    if (!audioGraphRef.current) return;

    try {
      // Stop all layers
      layers.forEach(layer => {
        audioGraphRef.current!.stopLayer(layer.id);
      });

      setAudioState(prev => ({ ...prev, isPlaying: false }));

      // Clear timers
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }

      if (meterTimerRef.current) {
        clearInterval(meterTimerRef.current);
        meterTimerRef.current = null;
      }

    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  }, [layers]);

  // Add a new layer
  const addLayer = useCallback((params: LayerParams) => {
    if (!audioGraphRef.current) return;

    try {
      audioGraphRef.current.addLayer(params);
      setLayers(prev => [...prev, params]);
    } catch (error) {
      console.error('Failed to add layer:', error);
    }
  }, []);

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
            audioGraphRef.current.startLayer(id);
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

  // Set master gain
  const setMasterGain = useCallback((db: number) => {
    if (!audioGraphRef.current) return;

    try {
      audioGraphRef.current.setMasterGain(db);
      setAudioState(prev => ({ ...prev, masterGainDb: db }));
    } catch (error) {
      console.error('Failed to set master gain:', error);
    }
  }, []);

  // Set session length
  const setSessionLength = useCallback((minutes: number | null) => {
    setAudioState(prev => ({ ...prev, sessionLength: minutes }));
  }, []);

  // Load preset
  const loadPreset = useCallback((layers: LayerParams[]) => {
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

      // Add new layers
      layers.forEach(layer => {
        audioGraphRef.current!.addLayer(layer);
      });

      setLayers(layers);
    } catch (error) {
      console.error('Failed to load preset:', error);
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
