import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AudioState, MeterData } from '../lib/types';

interface TransportBarProps {
  audioState: AudioState;
  meterData: MeterData;
  onStart: () => void;
  onStop: () => void;
  onMasterGainChange: (db: number) => void;
  onSessionLengthChange: (minutes: number | null) => void;
}

export const TransportBar = ({
  audioState,
  meterData,
  onStart,
  onStop,
  onMasterGainChange,
  onSessionLengthChange,
}: TransportBarProps) => {
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const sessionButtonRef = useRef<HTMLButtonElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMeterColor = (value: number): string => {
    if (value > -6) return 'bg-rose-500';
    if (value > -12) return 'bg-amber-500';
    if (value > -24) return 'bg-emerald-500';
    return 'bg-slate-600';
  };

  const getMeterHeight = (value: number): string => {
    const normalized = Math.max(0, (value + 60) / 60); // -60dB to 0dB
    return `${Math.min(100, normalized * 100)}%`;
  };

  // Calculate dropdown position when menu is shown
  useEffect(() => {
    if (showSessionOptions && sessionButtonRef.current) {
      const rect = sessionButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showSessionOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSessionOptions && sessionButtonRef.current && !sessionButtonRef.current.contains(event.target as Node)) {
        setShowSessionOptions(false);
      }
    };

    if (showSessionOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSessionOptions]);

  return (
    <>
    <div className="card mb-6 overflow-visible">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Main Transport Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={audioState.isPlaying ? onStop : onStart}
            className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              audioState.isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
            }`}
          >
            {audioState.isPlaying ? '⏹ Stop' : '▶ Start'}
          </button>

          {/* Session Timer */}
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-slate-100">
              {formatTime(audioState.elapsedTime)}
            </div>
            <div className="text-xs text-slate-400">
              {audioState.sessionLength ? `Auto-stop: ${audioState.sessionLength}m` : 'No auto-stop'}
            </div>
          </div>
        </div>

        {/* Session Length Selector */}
        <div className="relative overflow-visible">
          <button
            ref={sessionButtonRef}
            onClick={() => setShowSessionOptions(!showSessionOptions)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>⏱ Session</span>
            <span className="text-xs">▼</span>
          </button>
        </div>

        {/* Master Gain */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-slate-300 whitespace-nowrap">
            Master: {audioState.masterGainDb.toFixed(1)} dB
          </label>
          <input
            type="range"
            min="-99"
            max="-3"
            step="0.5"
            value={audioState.masterGainDb}
            onChange={(e) => onMasterGainChange(parseFloat(e.target.value))}
            className="slider w-32"
          />
        </div>

        {/* Output Meter */}
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-slate-300 whitespace-nowrap">
            Output
          </div>
          <div className="flex items-end space-x-1 h-12">
            {/* Left Channel */}
            <div className="w-3 bg-slate-700 rounded-sm relative">
              <div
                className={`absolute bottom-0 w-full rounded-sm transition-all duration-100 ${getMeterColor(meterData.left)}`}
                style={{ height: getMeterHeight(meterData.left) }}
              />
            </div>
            {/* Right Channel */}
            <div className="w-3 bg-slate-700 rounded-sm relative">
              <div
                className={`absolute bottom-0 w-full rounded-sm transition-all duration-100 ${getMeterColor(meterData.right)}`}
                style={{ height: getMeterHeight(meterData.right) }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {meterData.peak > -59.9 ? `${meterData.peak.toFixed(1)} dB` : '-∞'}
          </div>
        </div>
      </div>

    </div>

    {/* Portal Dropdown - Rendered to document body */}
    {showSessionOptions && createPortal(
      <div
        className="fixed bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl z-[9999] min-w-[200px]"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
      >
        <div className="p-2">
          <button
            onClick={() => {
              onSessionLengthChange(null);
              setShowSessionOptions(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-700/50 text-slate-200 ${
              audioState.sessionLength === null ? 'bg-indigo-900/50 text-indigo-300' : ''
            }`}
          >
            No auto-stop
          </button>
          {[10, 20, 30, 45, 60].map((minutes) => (
            <button
              key={minutes}
              onClick={() => {
                onSessionLengthChange(minutes);
                setShowSessionOptions(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-slate-700/50 text-slate-200 ${
                audioState.sessionLength === minutes ? 'bg-indigo-900/50 text-indigo-300' : ''
              }`}
            >
              {minutes} minutes
            </button>
          ))}
        </div>
      </div>,
      document.body
    )}
  </>
  );
};
