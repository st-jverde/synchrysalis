import type { Preset, AudioState, MeterData } from '../lib/types';
import { PresetSelector } from './PresetSelector';
import { TransportBar } from './TransportBar';

interface PresetViewProps {
  selectedPreset: Preset | null;
  onSelectPreset: (preset: Preset) => void;
  audioState: AudioState;
  meterData: MeterData;
  onStart: () => void;
  onStop: () => void;
  onMasterGainChange: (db: number) => void;
  onSessionLengthChange: (minutes: number | null) => void;
}

export const PresetView = ({
  selectedPreset,
  onSelectPreset,
  audioState,
  meterData,
  onStart,
  onStop,
  onMasterGainChange,
  onSessionLengthChange,
}: PresetViewProps) => {
  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-12rem)] py-12 px-4">
      {/* Preset Selection & Info */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-lg">
        <PresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={onSelectPreset}
          className="w-full"
          buttonClassName="w-full btn-secondary flex items-center justify-between text-lg py-3 px-5"
        />

        {selectedPreset && (
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-neutral-100">
              {selectedPreset.name}
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
              {selectedPreset.description}
            </p>
          </div>
        )}
      </div>

      {/* Transport Controls */}
      <div className="w-full max-w-2xl">
        <TransportBar
          audioState={audioState}
          meterData={meterData}
          onStart={onStart}
          onStop={onStop}
          onMasterGainChange={onMasterGainChange}
          onSessionLengthChange={onSessionLengthChange}
          layout="spacious"
        />
      </div>
    </div>
  );
};
