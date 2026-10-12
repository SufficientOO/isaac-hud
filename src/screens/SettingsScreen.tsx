import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOD_PORT = 8088;

interface Props {
  onConnect: (ip: string) => void;
}

const PROBE_MS = 2000;
const PROBE_TIMEOUT_MS = 1500;

export default function SettingsScreen({ onConnect }: Props) {
  const [ip, setIp] = useState('127.0.0.1');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const enter = useCallback((cleanIp: string) => {
    AsyncStorage.setItem('hostIp', cleanIp);
    onConnect(cleanIp);
  }, [onConnect]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const probe = async () => {
      const controller = new AbortController();
      const killer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      try {
        const resp = await fetch(`http://127.0.0.1:${MOD_PORT}/state`, { signal: controller.signal });
        clearTimeout(killer);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        if (active) enter('127.0.0.1');
        return;
      } catch {
        clearTimeout(killer);

      }
      if (active) timer = setTimeout(probe, PROBE_MS);
    };
    probe();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [enter]);

  const manualConnect = useCallback(async () => {
    const cleanIp = ip.trim();
    if (!cleanIp) {
      Alert.alert('Error', 'Enter an IP address');
      return;
    }
    enter(cleanIp);
  }, [ip, enter]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Isaac HUD Companion</Text>
      <View style={styles.statusRow}>
        <ActivityIndicator size="small" color="#4ecca3" />
        <Text style={styles.subtitle}>
          Waiting for the game (localhost:8088) — auto-connects when a run starts
        </Text>
      </View>
      <Text style={styles.tipText}>
        Tip: Press the right stick (R3) to show/hide the main screen HUD
      </Text>
      <TouchableOpacity
        style={styles.advHeader}
        onPress={() => setAdvancedOpen((v) => !v)}
      >
        <Text style={styles.advTitle}>Connect Manually (Advanced)</Text>
        <Text style={styles.advArrow}>{advancedOpen ? '▾' : '▸'}</Text>
      </TouchableOpacity>
      {advancedOpen && (
        <>
          <TextInput
            style={styles.input}
            value={ip}
            onChangeText={setIp}
            placeholder="192.168.1.100"
            placeholderTextColor="#555"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.button} onPress={manualConnect}>
            <Text style={styles.buttonText}>Connect Manually</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6e6e6',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8899aa',
    textAlign: 'center',
    flexShrink: 1,
  },
  input: {
    width: '80%',
    height: 46,
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    backgroundColor: '#16213e',
    color: '#e6e6e6',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#e6e6e6',
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 12,
    color: '#667788',
    textAlign: 'center',
    marginTop: 4,
  },
  advHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  advTitle: {
    fontSize: 14,
    color: '#8899aa',
    fontWeight: '600',
  },
  advArrow: {
    fontSize: 14,
    color: '#4ecca3',
  },
});
