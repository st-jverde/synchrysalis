import { useState, useRef, useEffect } from 'react';

interface EditableSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export const EditableSlider = ({
  value,
  min,
  max,
  step,
  onChange,
  label,
  unit = '',
  formatValue,
  className = ''
}: EditableSliderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default formatter if none provided
  const format = formatValue || ((val: number) => {
    if (unit === '%') {
      return (val * 100).toFixed(0);
    }
    if (unit === 's' || unit === 'Hz') {
      return val.toFixed(2);
    }
    if (unit === 'dB') {
      return val.toFixed(1);
    }
    return val.toFixed(0);
  });

  // Start editing
  const handleLabelClick = () => {
    setIsEditing(true);
    setInputValue(format(value));
    setIsValid(true);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate input
    const numValue = parseFloat(newValue);
    const isValidInput = !isNaN(numValue) && numValue >= min && numValue <= max;
    setIsValid(isValidInput);
  };

  // Handle input blur or Enter key
  const handleInputSubmit = () => {
    const numValue = parseFloat(inputValue);

    if (!isValid || isNaN(numValue)) {
      // Revert to original value
      setInputValue(format(value));
      setIsValid(true);
    } else {
      // Clamp to valid range and apply step
      const clampedValue = Math.max(min, Math.min(max, numValue));
      const steppedValue = Math.round(clampedValue / step) * step;
      onChange(steppedValue);
    }

    setIsEditing(false);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(format(value));
      setIsValid(true);
      setIsEditing(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label}:{' '}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputSubmit}
            onKeyDown={handleKeyDown}
            className={`inline-block w-16 px-1 py-0.5 text-sm bg-slate-800 border rounded transition-all duration-200 ${
              isValid
                ? 'border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                : 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
            } text-slate-100`}
          />
        ) : (
          <span
            className="cursor-pointer hover:text-indigo-300 transition-colors duration-200"
            onClick={handleLabelClick}
            title="Click to edit"
          >
            {format(value)}{unit}
          </span>
        )}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider"
      />
    </div>
  );
};
