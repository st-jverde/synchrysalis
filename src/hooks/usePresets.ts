import { useState, useCallback, useEffect } from 'react';
import type { Preset, LayerParams } from '../lib/types';
import { builtInPresets } from '../lib/presets';

const USER_PRESETS_KEY = 'synchrysalis_user_presets';

export const usePresets = () => {
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [allPresets, setAllPresets] = useState<Preset[]>([]);

  // Load user presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_PRESETS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load user presets:', error);
    }
  }, []);

  // Update all presets when user presets change
  useEffect(() => {
    setAllPresets([...builtInPresets, ...userPresets]);
  }, [userPresets]);

  // Save user presets to localStorage
  const saveUserPresets = useCallback((presets: Preset[]) => {
    try {
      localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
      setUserPresets(presets);
    } catch (error) {
      console.error('Failed to save user presets:', error);
    }
  }, []);

  // Save current layers as a new user preset
  const savePreset = useCallback((name: string, description: string, layers: LayerParams[]) => {
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name,
      description,
      layers: layers.map(layer => ({ ...layer, id: crypto.randomUUID() })), // Generate new IDs
    };

    const updatedPresets = [...userPresets, newPreset];
    saveUserPresets(updatedPresets);

    return newPreset;
  }, [userPresets, saveUserPresets]);

  // Load a preset by ID
  const loadPreset = useCallback((id: string): Preset | null => {
    return allPresets.find(preset => preset.id === id) || null;
  }, [allPresets]);

  // Delete a user preset
  const deletePreset = useCallback((id: string) => {
    const updatedPresets = userPresets.filter(preset => preset.id !== id);
    saveUserPresets(updatedPresets);
  }, [userPresets, saveUserPresets]);

  // Update a user preset
  const updatePreset = useCallback((id: string, updates: Partial<Preset>) => {
    const updatedPresets = userPresets.map(preset =>
      preset.id === id ? { ...preset, ...updates } : preset
    );
    saveUserPresets(updatedPresets);
  }, [userPresets, saveUserPresets]);

  // Get preset by name
  const getPresetByName = useCallback((name: string): Preset | null => {
    return allPresets.find(preset => preset.name === name) || null;
  }, [allPresets]);

  // Check if a preset name already exists
  const isPresetNameTaken = useCallback((name: string): boolean => {
    return allPresets.some(preset => preset.name === name);
  }, [allPresets]);

  return {
    builtInPresets,
    userPresets,
    allPresets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset,
    getPresetByName,
    isPresetNameTaken,
  };
};
