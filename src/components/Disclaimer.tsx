import { useState } from 'react';

interface DisclaimerProps {
  onDismiss: () => void;
}

export const Disclaimer = ({ onDismiss }: DisclaimerProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('synchrysalis_disclaimer_dismissed', 'true');
    }
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            ⚠️ Important Safety Information
          </h2>
          <p className="text-slate-400">
            Please read this information before using Synchrysalis
          </p>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-semibold text-amber-300 mb-2">🩺 Medical Disclaimer</h3>
            <p className="text-amber-200">
              Synchrysalis is an experimental audio tool for entertainment and relaxation purposes only.
              It is not intended to diagnose, treat, cure, or prevent any medical condition.
              Brainwave entrainment effects vary between individuals and may not be suitable for everyone.
            </p>
          </div>

          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-semibold text-blue-300 mb-2">🎧 Headphones Recommended</h3>
            <p className="text-blue-200">
              For best results, use high-quality headphones. Binaural beats require stereo separation
              to work effectively. Speakers may not provide the intended entrainment effects.
            </p>
          </div>

          <div className="bg-rose-900/30 border border-rose-700/50 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-semibold text-rose-300 mb-2">⚠️ Safety Warnings</h3>
            <ul className="text-rose-200 space-y-1 list-disc list-inside">
              <li>Do not use while driving or operating machinery</li>
              <li>Stop immediately if you experience discomfort, dizziness, or seizures</li>
              <li>Consult a healthcare professional if you have epilepsy or neurological conditions</li>
              <li>Keep volume at comfortable levels to prevent hearing damage</li>
              <li>Not recommended for children under 13 years old</li>
            </ul>
          </div>

          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-semibold text-emerald-300 mb-2">✅ Safe Usage Guidelines</h3>
            <ul className="text-emerald-200 space-y-1 list-disc list-inside">
              <li>Start with shorter sessions (10-15 minutes)</li>
              <li>Use in a quiet, comfortable environment</li>
              <li>Take breaks between sessions</li>
              <li>Listen at moderate volume levels</li>
              <li>Be mindful of your body's responses</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Don't show this again</span>
          </label>

          <button
            onClick={handleDismiss}
            className="btn-primary"
          >
            I Understand - Continue
          </button>
        </div>
      </div>
    </div>
  );
};
