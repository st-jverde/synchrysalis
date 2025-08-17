# Synchrysalis - Brainwave Entrainment App

Synchrysalis is a production-ready web application for experimenting with multi-layer brainwave entrainment audio using Tone.js. It allows users to stack multiple entrainment layers (binaural, isochronic, or monaural) and control various parameters per layer.

## ⚠️ Important Safety Information

**Medical Disclaimer**: Synchrysalis is an experimental audio tool for entertainment and relaxation purposes only. It is not intended to diagnose, treat, cure, or prevent any medical condition. Brainwave entrainment effects vary between individuals and may not be suitable for everyone.

**Safety Warnings**:

- Do not use while driving or operating machinery
- Stop immediately if you experience discomfort, dizziness, or seizures
- Consult a healthcare professional if you have epilepsy or neurological conditions
- Keep volume at comfortable levels to prevent hearing damage
- Not recommended for children under 13 years old

**Safe Usage Guidelines**:

- Start with shorter sessions (10-15 minutes)
- Use in a quiet, comfortable environment
- Take breaks between sessions
- Listen at moderate volume levels
- Be mindful of your body's responses

## ✨ Features

### 🎛️ Transport & Safety

- Big Start/Stop button with user gesture requirement to unlock audio
- Master volume control (-18 dB default) with hard limiter
- Fade-in/out on transport (2s in, 1.5s out)
- Output meter with RMS/peak bars
- Session length timer with optional auto-stop (10, 20, 30, 45, 60 minutes)

### 🎵 Layer System

- Add/remove layers (up to 8 maximum)
- Three entrainment types:
  - **Binaural**: Two oscillators with different frequencies for each ear
  - **Isochronic**: Single oscillator with amplitude modulation
  - **Monaural**: Two oscillators summed to create amplitude modulation
- Per-layer controls:
  - Carrier frequencies (80-600 Hz)
  - Beat frequency (0.5-40 Hz)
  - Waveform selection (sine, triangle, square, sawtooth)
  - Gain control (-48 to 0 dB)
  - Panning (-1 to +1)
  - Amplitude envelope (ADSR)
  - Optional LFO modulation

### 🎚️ Presets

Built-in presets include:

- **Alpha Focus**: 10 Hz binaural beats for enhanced focus
- **Theta Deep Relax**: 5 Hz mix of binaural + isochronic for relaxation
- **Delta Sleep**: 2 Hz low carriers for deep sleep
- **Gamma Burst**: 40 Hz monaural with alpha support for cognitive enhancement
- **Theta-Gamma Coupling**: 6 Hz + 40 Hz layers for learning and memory
- **Blank Layer**: Start with a single binaural layer

### 📹 Recording & Export

- Record master output via MediaRecorder
- Show elapsed recording time
- Download as WAV file with timestamped filename
- Format: `entrainment-YYYYMMDD-HHMM.wav`

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Audio**: Tone.js (latest)
- **Styling**: Tailwind CSS
- **Architecture**: Client-only, no server required

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Modern web browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/synchrysalis.git
cd synchrysalis

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open http://localhost:5173 in your browser.

### Building for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 🎧 Audio Implementation Details

### Binaural Beats

- Two Tone.Oscillators: Left at `carrier - beat/2`, Right at `carrier + beat/2`
- Each routed to a Tone.Panner (-1 / +1)
- Optional subtle reverb send

### Isochronic Tones

- One Tone.Oscillator at carrier frequency
- Tone.Gain gated by Tone.LFO at beat frequency
- No headphones required, moderate gain

### Monaural Beats

- Two oscillators at carrier and carrier + beat
- Summed pre-pan to create amplitude modulation
- Pan center by default

### Shared Features

- Per-layer Tone.Gain for volume control
- Tone.Panner for stereo positioning
- Optional Tone.Filter (high-pass/low-pass)
- Smooth parameter changes with `rampTo`
- Global chain: layers → master gain → limiter → destination

## 🎛️ Usage Guide

### Getting Started

1. **First Launch**: Read and acknowledge the safety disclaimer
2. **Add Layers**: Click "+ Binaural", "+ Isochronic", or "+ Monaural" buttons
3. **Load Preset**: Use the preset dropdown to load built-in configurations
4. **Start Audio**: Click the "Start" button (requires user interaction)

### Layer Controls

- **Basic Controls**: Type, beat frequency, waveform, gain
- **Expanded Controls**: Click the expand arrow (▶) to access:
  - Carrier frequencies (left/right for binaural)
  - Panning control
  - Envelope settings (Attack, Decay, Sustain, Release)
  - LFO modulation (rate, depth, target)

### Advanced Features

- **Mute/Solo**: Use the 🔇 and 🎯 buttons to mute or solo individual layers
- **Duplicate**: Click 📋 to create a copy of a layer
- **Recording**: Use the recording controls in the header to capture your session
- **Presets**: Save your custom configurations for later use

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Disclaimer.tsx      # Safety modal
│   ├── TransportBar.tsx    # Start/stop, timer, meter
│   ├── PresetBar.tsx       # Preset management
│   └── LayerCard.tsx       # Individual layer controls
├── hooks/
│   ├── useAudioEngine.ts   # Main audio management
│   ├── useRecorder.ts      # Recording functionality
│   └── usePresets.ts       # Preset storage
├── lib/
│   ├── audioGraph.ts       # Tone.js audio graph
│   ├── types.ts           # TypeScript definitions
│   └── presets.ts         # Built-in presets
├── App.tsx                # Main application
└── main.tsx              # Entry point
```

## 🎯 Brainwave Frequency Ranges

- **Delta (0.5-4 Hz)**: Deep sleep, regeneration
- **Theta (4-8 Hz)**: Deep relaxation, meditation
- **Alpha (8-13 Hz)**: Relaxed alertness, focus
- **Beta (13-30 Hz)**: Active thinking, concentration
- **Gamma (30-100 Hz)**: High-level processing, insight

## 🔧 Development

### Key Dependencies

- `tone`: Web Audio framework
- `react`: UI library
- `typescript`: Type safety
- `tailwindcss`: Styling
- `vite`: Build tool

### Audio Constraints

- No audio starts before user gesture (browser requirement)
- Clamped frequency ranges for safety
- Smooth parameter changes to avoid clicks
- Master limiter prevents clipping

## 🤝 Contributing

Contributions are welcome! Please ensure:

- Code follows TypeScript best practices
- Audio safety measures are maintained
- UI remains accessible and mobile-friendly
- Tests are added for new features

## 📜 License

This project is licensed under the Apache 2.0 License.

## 🌟 Inspiration

Synchrysalis represents the transformation of raw audio synthesis into meaningful brainwave entrainment experiences, merging scientific principles with creative audio design to create immersive, therapeutic sound environments.

---

**Remember**: This is an experimental tool. Use responsibly and always prioritize your safety and well-being.
