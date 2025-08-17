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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            ⚠️ Important Safety Information
          </h2>
          <p className="text-neutral-600">
            Please read this information before using Synchrysalis
          </p>
        </div>

        <div className="space-y-4 text-sm text-neutral-700">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">🩺 Medical Disclaimer</h3>
            <p className="text-yellow-700">
              Synchrysalis is an experimental audio tool for entertainment and relaxation purposes only.
              It is not intended to diagnose, treat, cure, or prevent any medical condition.
              Brainwave entrainment effects vary between individuals and may not be suitable for everyone.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎧 Headphones Recommended</h3>
            <p className="text-blue-700">
              For best results, use high-quality headphones. Binaural beats require stereo separation
              to work effectively. Speakers may not provide the intended entrainment effects.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Safety Warnings</h3>
            <ul className="text-red-700 space-y-1 list-disc list-inside">
              <li>Do not use while driving or operating machinery</li>
              <li>Stop immediately if you experience discomfort, dizziness, or seizures</li>
              <li>Consult a healthcare professional if you have epilepsy or neurological conditions</li>
              <li>Keep volume at comfortable levels to prevent hearing damage</li>
              <li>Not recommended for children under 13 years old</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">✅ Safe Usage Guidelines</h3>
            <ul className="text-green-700 space-y-1 list-disc list-inside">
              <li>Start with shorter sessions (10-15 minutes)</li>
              <li>Use in a quiet, comfortable environment</li>
              <li>Take breaks between sessions</li>
              <li>Listen at moderate volume levels</li>
              <li>Be mindful of your body's responses</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
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
