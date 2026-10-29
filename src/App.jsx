import React, { useState, useCallback } from 'react';
import LockScreen from './components/LockScreen.jsx';
import BirthdayRollScreen from './components/BirthdayRollScreen.jsx';
import Trans2 from './components/Trans2.jsx';
import BabyPinkCelestialScreen from './components/BabyPinkCelestialScreen.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('lock'); // 'lock' | 'roll' | 'celestial'
  const [showTrans2, setShowTrans2] = useState(false);

  const handleBubuRopePull = useCallback(() => {
    // Start Trans2 floral vortex transition
    setShowTrans2(true);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* View router */}
      {currentView === 'lock' && (
        <LockScreen
          onUnlocked={() => setCurrentView('roll')}
          correctPin="0411"
        />
      )}

      {currentView === 'roll' && (
        <BirthdayRollScreen
          onReset={() => setCurrentView('lock')}
          onPullRedirect={handleBubuRopePull}
        />
      )}

      {currentView === 'celestial' && (
        <BabyPinkCelestialScreen
          onBack={() => setCurrentView('roll')}
        />
      )}

      {/* Trans2: Cinematic floral swirl & curtain-split transition */}
      {showTrans2 && (
        <Trans2
          onCovered={() => {
            // When flowers fully blanket the screen, switch to baby pink celestial screen
            setCurrentView('celestial');
          }}
          onDone={() => {
            // When floral curtains have fully parted to left & right, unmount
            setShowTrans2(false);
          }}
        />
      )}
    </div>
  );
}
