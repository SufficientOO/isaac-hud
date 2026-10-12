import './pixel.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SettingsScreen from './src/screens/SettingsScreen';
import HudScreen from './src/screens/HudScreen';

export default function App() {
  const [hostIp, setHostIp] = useState<string | null>(null);

  return (
    <>
      <StatusBar style="light" />
      {hostIp ? (
        <HudScreen hostIp={hostIp} onDrop={() => setHostIp(null)} />
      ) : (
        <SettingsScreen onConnect={setHostIp} />
      )}
    </>
  );
}