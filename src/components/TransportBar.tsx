import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { AudioState, MeterData } from '../lib/types';
import { EditableSlider } from './EditableSlider';

interface TransportBarProps {
  audioState: AudioState;
  meterData: MeterData;
  onStart: () => void;
  onStop: () => void;
  onMasterGainChange: (db: number) => void;
  onSessionLengthChange: (minutes: number | null) => void;
  layout?: 'default' | 'spacious';
}

export const TransportBar = ({
  audioState,
  meterData,
  onStart,
  onStop,
  onMasterGainChange,
  onSessionLengthChange,
  layout = 'default',
}: TransportBarProps) => {
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const sessionButtonRef = useRef<HTMLButtonElement>(null);
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMeterColor = (value: number): string => {
    if (value > -6) return 'bg-rose-500';
    if (value > -12) return 'bg-amber-500';
    if (value > -24) return 'bg-emerald-500';
    return 'bg-neutral-600';
  };

  const getMeterHeight = (value: number): string => {
    const normalized = Math.max(0, (value + 60) / 60); // -60dB to 0dB
    return `${Math.min(100, normalized * 100)}%`;
  };

  // Handle session button click
  const handleSessionButtonClick = () => {
    if (audioState.isPlaying) {
      // Show info popover instead of dropdown
      if (sessionButtonRef.current) {
        const rect = sessionButtonRef.current.getBoundingClientRect();
        setPopoverPosition({
          top: rect.top + window.scrollY - 8,
          left: rect.left + window.scrollX + rect.width / 2
        });
      }
      setShowInfoPopover(true);

      // Auto-dismiss after 1 second (much faster)
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
      popoverTimeoutRef.current = setTimeout(() => {
        setShowInfoPopover(false);
      }, 1000);
    } else {
      setShowSessionOptions(!showSessionOptions);
    }
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

  // Hide popover when audio stops
  useEffect(() => {
    if (!audioState.isPlaying && showInfoPopover) {
      setShowInfoPopover(false);
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
    }
  }, [audioState.isPlaying, showInfoPopover]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSessionOptions && sessionButtonRef.current && !sessionButtonRef.current.contains(event.target as Node)) {
        // Check if the click is on the portal dropdown
        const target = event.target as Element;
        if (target && target.closest('[data-portal-dropdown]')) {
          return; // Don't close if clicking on the dropdown
        }
        setShowSessionOptions(false);
      }
    };

    if (showSessionOptions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSessionOptions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  const isSpacious = layout === 'spacious';

  return (
    <>
    <div className={isSpacious ? '' : 'card mb-6'} style={{ overflow: 'visible' }}>
      <div className={
        isSpacious
          ? 'flex flex-col items-center space-y-12'
          : 'flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6'
      } style={{ overflow: 'visible' }}>
        {/* Main Transport Controls */}
        <div className={`flex items-center ${isSpacious ? 'space-x-10' : 'space-x-4'}`}>
          <button
            onClick={audioState.isPlaying ? onStop : onStart}
            className={`rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSpacious ? 'px-12 py-5 text-2xl' : 'px-8 py-3 text-lg'
            } ${
              audioState.isPlaying
                ? 'bg-red-900/70 hover:bg-red-900/90 text-red-100 focus:ring-red-800/50'
                : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
            }`}
          >
            {audioState.isPlaying ? '⏹ Stop' : '▶ Start'}
          </button>

          {/* Session Timer */}
          <div className="text-center">
            <div className={`font-mono font-bold text-neutral-100 ${isSpacious ? 'text-5xl' : 'text-2xl'}`}>
              {formatTime(audioState.elapsedTime)}
            </div>
            <div className={`text-neutral-400 ${isSpacious ? 'text-sm mt-1' : 'text-xs'}`}>
              {audioState.sessionLength ? `Countdown: ${audioState.sessionLength}m` : 'No auto-stop'}
            </div>
          </div>
        </div>

        {/* Secondary Controls Row */}
        <div className={`flex items-center ${isSpacious ? 'space-x-12' : 'space-x-0'} ${
          isSpacious ? '' : 'flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 w-full lg:w-auto justify-between lg:justify-end'
        }`}>
        {/* Session Length Selector */}
        <div className="relative" style={{ overflow: 'visible' }}>
          <button
            ref={sessionButtonRef}
            onClick={handleSessionButtonClick}
            disabled={audioState.isPlaying}
            className={`btn-secondary flex items-center space-x-2 transition-all duration-200 ${
              audioState.isPlaying
                ? 'opacity-50 cursor-not-allowed hover:bg-neutral-700'
                : 'hover:bg-neutral-600'
            }`}
            title={audioState.isPlaying ? "Press stop before changing session time" : "Set session duration"}
          >
            <span>⏱ Session</span>
            <span className="text-xs">▼</span>
          </button>

        </div>

        {/* Master Gain */}
        <EditableSlider
          value={audioState.masterGainDb}
          min={-99}
          max={-3}
          step={0.5}
          onChange={onMasterGainChange}
          label="Master"
          unit=" dB"
          formatValue={(val) => val.toFixed(1)}
          className="flex items-center space-x-3"
        />

        {/* Output Meter */}
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-neutral-300 whitespace-nowrap">
            Output
          </div>
          <div className="flex items-end space-x-1 h-12">
            {/* Left Channel */}
            <div className="w-3 bg-neutral-700 rounded-sm relative">
              <div
                className={`absolute bottom-0 w-full rounded-sm transition-all duration-100 ${getMeterColor(meterData.left)}`}
                style={{ height: getMeterHeight(meterData.left) }}
              />
            </div>
            {/* Right Channel */}
            <div className="w-3 bg-neutral-700 rounded-sm relative">
              <div
                className={`absolute bottom-0 w-full rounded-sm transition-all duration-100 ${getMeterColor(meterData.right)}`}
                style={{ height: getMeterHeight(meterData.right) }}
              />
            </div>
          </div>
          <div className="text-xs text-neutral-400 font-mono">
            {meterData.peak > -59.9 ? `${meterData.peak.toFixed(1)} dB` : '-∞'}
          </div>
        </div>
        </div>
      </div>

    </div>

    {/* Portal Dropdown - Rendered to document body */}
    {showSessionOptions && createPortal(
      <div
        className="fixed bg-neutral-800/90 backdrop-blur-sm border border-neutral-700/50 rounded-lg shadow-2xl z-[99999] min-w-[200px]"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
        data-portal-dropdown
      >
        <div className="p-2">
          <button
            onClick={() => {
              onSessionLengthChange(null);
              setShowSessionOptions(false);
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-700/50 text-neutral-200 ${
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
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-700/50 text-neutral-200 ${
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

    {/* Info Popover - Rendered to document body */}
    {showInfoPopover && createPortal(
      <div
        className="fixed bg-neutral-700 backdrop-blur-sm border-2 border-indigo-500 rounded-2xl shadow-2xl z-[99999] px-5 py-4 max-w-xs"
        style={{
          top: `${popoverPosition.top}px`,
          left: `${popoverPosition.left}px`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-indigo-400 text-xl">⚠️</span>
          <div className="text-neutral-100 text-sm font-semibold">
            Press stop before changing the session time.
          </div>
        </div>
        {/* Arrow pointing down */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-indigo-500"
        />
      </div>,
      document.body
    )}
  </>
  );
};
