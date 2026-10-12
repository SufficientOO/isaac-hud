import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import TempestaText from './TempestaText';
import { STAT_SPRITES } from '../statSprites';

const ICON_SIZE = 22;

const TEXT_SCALE = 1.5;

const DELTA_SCALE = 1.1;

const DELTA_MS = 5000;
const DELTA_EPS = 1e-9;

type StatKey = keyof GameState['stats'];
const DELTA_KEYS: StatKey[] = ['damage', 'tears', 'shotSpeed', 'speed', 'range', 'luck'];

interface DeltaInfo {
  val: number;
  expires: number;
}

interface Props {
  state: GameState;
}

const StatRow = React.memo(function StatRow({
  icon,
  value,
  delta,
}: {
  icon: any;
  value: string;
  delta?: DeltaInfo;
}) {
  return (
    <View style={styles.row}>
      <Image source={icon} style={styles.icon} resizeMode="stretch" />
      <TempestaText scale={TEXT_SCALE}>{value}</TempestaText>
      {delta && delta.val !== 0 && (
        <TempestaText
          scale={DELTA_SCALE}
          color={delta.val > 0 ? 'green' : 'red'}
        >
          {`${delta.val > 0 ? '+' : ''}${delta.val.toFixed(2)}`}
        </TempestaText>
      )}
    </View>
  );
});

function StatsPanelInner({ state }: Props) {
  const { stats } = state;
  const [deltas, setDeltas] = useState<Partial<Record<StatKey, DeltaInfo>>>({});
  const prev = useRef<Partial<Record<StatKey, number>>>({});

  useEffect(() => {
    const now = Date.now();
    const diffs: [StatKey, number][] = [];
    for (const k of DELTA_KEYS) {
      const cur = stats[k];
      const p = prev.current[k];
      prev.current[k] = cur;
      if (p !== undefined) {
        const diff = cur - p;
        if (Math.abs(diff) >= DELTA_EPS) diffs.push([k, diff]);
      }
    }
    if (diffs.length === 0) return;
    setDeltas((d) => {
      const next = { ...d };
      for (const [k, diff] of diffs) {
        next[k] = { val: (d[k]?.val ?? 0) + diff, expires: now + DELTA_MS };
      }
      return next;
    });
  }, [stats]);

  useEffect(() => {
    const pending = Object.values(deltas) as DeltaInfo[];
    if (pending.length === 0) return;
    const nextExp = Math.min(...pending.map((d) => d.expires));
    const delay = Math.max(250, nextExp - Date.now());
    const id = setTimeout(() => {
      const now = Date.now();
      setDeltas((d) => {
        let any = false;
        const next = { ...d };
        for (const k of Object.keys(next) as StatKey[]) {
          if ((next[k] as DeltaInfo).expires <= now) {
            delete next[k];
            any = true;
          }
        }
        return any ? next : d;
      });
    }, delay);
    return () => clearTimeout(id);
  }, [deltas]);

  const val = (key: keyof GameState['stats'], dp: number): string => {
    const v = stats[key];
    return typeof v === 'number' && isFinite(v) ? v.toFixed(dp) : '';
  };

  const pct = (key: 'devil' | 'angel'): string => {
    const v = stats[key];

    return typeof v === 'number' && isFinite(v) ? `${v.toFixed(1)}%` : '';
  };
  const rows: [StatKey, string][] = [
    ['speed', val('speed', 2)],
    ['tears', val('tears', 2)],
    ['damage', val('damage', 2)],
    ['range', val('range', 2)],
    ['shotSpeed', val('shotSpeed', 2)],
    ['luck', val('luck', 2)],
    ['devil', pct('devil')],
    ['angel', pct('angel')],
  ];

  return (
    <View style={styles.container}>
      {rows.map(([key, value]) => (
        <StatRow
          key={key}
          icon={STAT_SPRITES[key]}
          value={value}
          delta={deltas[key]}
        />
      ))}
    </View>
  );
}

export default React.memo(
  StatsPanelInner,
  (a, b) => {
    const as = a.state.stats;
    const bs = b.state.stats;
    for (const k of DELTA_KEYS) {
      if (as[k] !== bs[k]) return false;
    }
    return as.devil === bs.devil && as.angel === bs.angel;
  },
);

const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 4,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    ...PIXELATED,
  },
});
