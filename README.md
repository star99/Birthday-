# For You — A Little Locked Garden 🌸

A private, interactive digital keepsake and birthday experience recreated with modern React, Vite, Tailwind animations, GSAP, and Canvas Confetti.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```
The static bundle will be generated in `dist/`.

---

## 🔑 Default Passcode

The default unlock code is **`0000`**.

> You can change this code at any time in [`src/App.jsx`](file:///Users/jeswa/Desktop/sample/src/App.jsx) by setting the `correctPin` prop on `<LockScreen correctPin="0000" />`.

---

## 🌟 Interactive Experience & Screens

1. **Lock Screen** ([`src/components/LockScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/LockScreen.jsx))
   - Cherry blossom soft-floating in center with dynamic cursor/touch glow follower.
   - Glassmorphic numeric keypad (1–9, 0, Backspace).
   - Enter `0000` to unlock. Flower smoothly centers and prompts *"Touch the blossom"*.
   - Touching the blossom initiates the **PetalSpiral** animation ([`src/components/PetalSpiral.jsx`](file:///Users/jeswa/Desktop/sample/src/components/PetalSpiral.jsx)) using Fibonacci golden ratio angles ($137.5^\circ$), followed by a cinematic screen split.

2. **Hey Baby (Letter Intro)** ([`src/components/LetterIntroScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/LetterIntroScreen.jsx))
   - Floating birthday cake illustration.
   - Handwritten note in *Short Stack* typography: *"Hey Baby, I know this isn't a normal birthday gift... But I made this just for you. ❤️"*

3. **Birthday Cake & Cutting Interaction** ([`src/components/CakeScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/CakeScreen.jsx))
   - Frosted frosted backdrop with an ignite button (🔥).
   - Real-time procedural Canvas burning shader with floating embers, smoke, and glow effects.
   - Animated birthday cake gif reveals with glowing candles.
   - Interactive cut: drag across the cake with a glowing blade. Complete the 100% swipe to trigger double celebration confetti bursts!

4. **Beautiful Memories** ([`src/components/MemoriesScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/MemoriesScreen.jsx))
   - Stack of 10 swipeable photo cards located in `public/assets/images/1.png` – `10.png`.
   - Physics-based card drag, rotation, and swipe discard gestures.

5. **Pull-String Hanging Lamp** ([`src/components/LampScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/LampScreen.jsx))
   - Ambient room lighting with floating luminous motes.
   - Hanging lamp with physics chain links and pull knob. Drag the string down to pull the switch, turning off the lights and transitioning to the final letter.

6. **Wax-Sealed Love Letter** ([`src/components/MessageScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/MessageScreen.jsx))
   - 3D envelope with a royal wax seal (`✦`) and *"Tap to unseal ♡"*.
   - Vintage parchment stationery with gold-accented corner brackets.
   - Typewriter character-by-character letter reveal with blinking cursor.

---

## 🎨 How to Customize

- **Change Passcode**: In [`src/App.jsx`](file:///Users/jeswa/Desktop/sample/src/App.jsx), modify `correctPin="0000"`.
- **Change Photos**: Replace images `1.png` to `10.png` in [`public/assets/images/`](file:///Users/jeswa/Desktop/sample/public/assets/images/).
- **Change Love Letter Message**: Edit `DEFAULT_ROMANTIC_MESSAGE` in [`src/components/MessageScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/MessageScreen.jsx).
- **Change Intro Note**: Edit the text in [`src/components/LetterIntroScreen.jsx`](file:///Users/jeswa/Desktop/sample/src/components/LetterIntroScreen.jsx).
