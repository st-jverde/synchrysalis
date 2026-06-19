import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Preset } from '../lib/types';
import { isBuiltInPreset } from '../lib/presets';
import { usePresets } from '../hooks/usePresets';

interface PresetSelectorProps {
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
  onDeletePreset?: (preset: Preset) => void;
  className?: string;
  buttonClassName?: string;
}

export const PresetSelector = ({
  selectedPreset,
  onSelectPreset,
  onDeletePreset,
  className = '',
  buttonClassName = 'w-full sm:w-80 btn-secondary flex items-center justify-between',
}: PresetSelectorProps) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const presetButtonRef = useRef<HTMLButtonElement>(null);

  const { allPresets } = usePresets();

  const builtInPresetsList = allPresets.filter(p => isBuiltInPreset(p.id));
  const userPresetsList = allPresets.filter(p => !isBuiltInPreset(p.id));

  const handleSelect = (preset: Preset) => {
    onSelectPreset(preset);
    setShowPresetMenu(false);
  };

  useEffect(() => {
    if (showPresetMenu && presetButtonRef.current) {
      const rect = presetButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showPresetMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPresetMenu && presetButtonRef.current && !presetButtonRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (target && target.closest('[data-portal-dropdown]')) {
          return;
        }
        setShowPresetMenu(false);
      }
    };

    if (showPresetMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPresetMenu]);

  return (
    <div className={`relative overflow-visible ${className}`}>
      <button
        ref={presetButtonRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowPresetMenu(!showPresetMenu);
        }}
        className={buttonClassName}
      >
        <span>{selectedPreset?.name || 'Select a preset...'}</span>
        <span className="text-xs">▼</span>
      </button>

      {showPresetMenu && createPortal(
        <div
          className="fixed bg-neutral-800/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg shadow-2xl z-[99999] max-h-96 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          data-portal-dropdown
        >
          <div className="p-2">
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Built-in Presets
              </div>
              {builtInPresetsList.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset)}
                  className="w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-700/50 flex items-center justify-between text-neutral-200"
                >
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-neutral-400">{preset.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {userPresetsList.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                  Your Presets
                </div>
                {userPresetsList.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between px-3 py-2 rounded text-sm hover:bg-neutral-700/50"
                  >
                    <button
                      onClick={() => handleSelect(preset)}
                      className="flex-1 text-left text-neutral-200"
                    >
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-neutral-400">{preset.description}</div>
                    </button>
                    {onDeletePreset && (
                      <button
                        onClick={() => onDeletePreset(preset)}
                        className="ml-2 text-rose-400 hover:text-rose-300 text-xs"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
