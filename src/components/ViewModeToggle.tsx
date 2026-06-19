export type ViewMode = 'preset' | 'editor';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex rounded-lg bg-neutral-700/50 p-1 border border-neutral-600/50">
      <button
        onClick={() => onViewModeChange('preset')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          viewMode === 'preset'
            ? 'bg-indigo-800 text-white'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        Preset
      </button>
      <button
        onClick={() => onViewModeChange('editor')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
          viewMode === 'editor'
            ? 'bg-indigo-500 text-white'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        Editor
      </button>
    </div>
  );
};
