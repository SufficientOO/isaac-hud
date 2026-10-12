import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { GameState } from '../types';
import HealthBar from '../components/HealthBar';
import ResourcesBar from '../components/ResourcesBar';
import ActiveItem from '../components/ActiveItem';
import BottomBar from '../components/BottomBar';
import Minimap from '../components/Minimap';
import StatsPanel from '../components/StatsPanel';
import OverlayMessages from '../components/OverlayMessages';
import { Curse, hasCurse } from '../curses';
import { THEME } from '../theme';
import { getFloorTexture } from '../floorSprites';

interface Props {
  hostIp: string;

  onDrop: () => void;
}

const MOD_PORT = 8088;

const POLL_MS = 250;

const FETCH_TIMEOUT_MS = 1500;

const MAX_FAILURES = 4;

const RECONNECT_MS = 2000;

export default function HudScreen({ hostIp, onDrop }: Props) {
  const [state, setState] = useState<GameState | null>(null);
  const [stale, setStale] = useState(false);
  const theme = THEME;

  const baseUrl = `http://${hostIp}:${MOD_PORT}`;

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let lastBody: string | null = null;

    let failures = 0;

    const poll = async () => {

      const controller = new AbortController();
      const killer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const resp = await fetch(`${baseUrl}/state`, { signal: controller.signal });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const body = await resp.text();
        if (active) {
          failures = 0;

          if (body !== lastBody) {
            lastBody = body;
            setState(JSON.parse(body) as GameState);
          }
          setStale(false);
        }
      } catch {
        if (active) {
          failures += 1;
          if (failures >= MAX_FAILURES) setStale(true);
        }
      } finally {
        clearTimeout(killer);
        if (active) {
          timer = setTimeout(
            poll,
            failures >= MAX_FAILURES ? RECONNECT_MS : POLL_MS,
          );
        }
      }
    };

    poll();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [baseUrl]);

  if (!state) return null;

  const hideHealth = hasCurse(state.floor.curses, Curse.Unknown);
  const hideMap = hasCurse(state.floor.curses, Curse.Lost);

  const floorTexture = getFloorTexture(state.floor.backdrop);

  return (
    <View style={[styles.app, { backgroundColor: theme.screenBg }]}>
      {floorTexture && (
        <Image
          source={floorTexture}
          style={styles.floorBg}
          resizeMode="repeat"
        />
      )}
      {}
      <View style={styles.leftBelow}>
        <ResourcesBar state={state} />
      </View>

      {}
      {!hideMap && (
        <View style={styles.bottomRight}>
          <Minimap state={state} />
        </View>
      )}

      {}
      <View style={styles.topLeft}>
        <ActiveItem state={state} />
        <HealthBar state={state} unknown={hideHealth} />
      </View>

      {}
      <View style={styles.statsPanel}>
        <StatsPanel state={state} />
      </View>

      {}
      <OverlayMessages state={state} />

      {}
      {stale && (
        <View style={styles.staleBadge} pointerEvents="none">
          <ActivityIndicator size="small" color="#4ecca3" />
        </View>
      )}

      <BottomBar state={state} dockBg={theme.dockBg} dividerColor={theme.dockDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,

  },
  floorBg: {
    position: 'absolute',
    top: 0,
    left: 0,

    width: '100%',
    height: '100%',

    pointerEvents: 'none',
  },
  topLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  leftBelow: {

    position: 'absolute',
    top: 84,
    left: 4,
  },

  statsPanel: {

    position: 'absolute',
    top: 220,
    bottom: 28,
    left: 4,
    zIndex: 5,

    pointerEvents: 'box-none',
  },
  bottomRight: {
    position: 'absolute',

    top: 84,
    bottom: 20,

    left: 100,
    right: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  staleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
  },
});
