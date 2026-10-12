import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState, HeartType, HeartOverlay } from '../types';
import TempestaText from './TempestaText';

const HEARTS: Record<HeartType, any> = {
  RedFull: require('../../assets/sprites/hearts/red_full.png'),
  RedHalf: require('../../assets/sprites/hearts/red_half.png'),
  RedEmpty: require('../../assets/sprites/hearts/empty.png'),
  Rotten: require('../../assets/sprites/hearts/rotten_full.png'),
  RottenBone: require('../../assets/sprites/hearts/rotten_bone.png'),
  BlueFull: require('../../assets/sprites/hearts/blue_full.png'),
  BlueHalf: require('../../assets/sprites/hearts/blue_half.png'),
  BlackFull: require('../../assets/sprites/hearts/black_full.png'),
  BlackHalf: require('../../assets/sprites/hearts/black_half.png'),
  BoneFull: require('../../assets/sprites/hearts/bone_full.png'),
  BoneHalf: require('../../assets/sprites/hearts/bone_half.png'),
  BoneEmpty: require('../../assets/sprites/hearts/bone_empty.png'),
  CoinFull: require('../../assets/sprites/hearts/coin_full.png'),
  CoinHalf: require('../../assets/sprites/hearts/coin_half.png'),
  CoinEmpty: require('../../assets/sprites/hearts/coin_empty.png'),
  Broken: require('../../assets/sprites/hearts/broken.png'),
  BrokenCoin: require('../../assets/sprites/hearts/broken_coin.png'),
  HolyMantle: require('../../assets/sprites/hearts/mantle.png'),

  WoodenCross: require('../../assets/sprites/hearts/wooden_mantle.png'),

  MantleBlanket: require('../../assets/sprites/hearts/mantle_blanket.png'),
};

const OVERLAYS: Record<HeartOverlay, any> = {
  E: require('../../assets/sprites/hearts/gold_overlay.png'),
  Eh: require('../../assets/sprites/hearts/white_half.png'),
  Gold: require('../../assets/sprites/hearts/gold_overlay.png'),
};

const HEART_UNKNOWN = require('../../assets/sprites/hearts/unknown.png');

const HEART_SIZE = 64;
const HEART_GAP = 2;

const HEARTS_WIDTH_BUDGET = 400;

interface HeartDisplay {
  source: any;
  overlay?: any;
  key: string;
}

function buildFromHearts(hearts: { t: HeartType; o?: HeartOverlay }[]): HeartDisplay[] {
  return hearts.map((h, i) => ({
    source: HEARTS[h.t],
    overlay: h.o ? OVERLAYS[h.o] : undefined,
    key: `h-${i}-${h.t}`,
  }));
}

function buildFromScalars(hp: GameState['hp']): HeartDisplay[] {
  const hearts: HeartDisplay[] = [];
  const H = (t: HeartType) => HEARTS[t];

  const maxContainers = Math.ceil(hp.max / 2);
  const redHalves = hp.red / 2;

  for (let i = 0; i < maxContainers; i++) {
    const fullHearts = Math.floor(redHalves);
    if (i < fullHearts) {
      hearts.push({ source: H('RedFull'), key: `red-${i}` });
    } else if (i === fullHearts && redHalves % 1 !== 0) {
      hearts.push({ source: H('RedHalf'), key: `red-${i}` });
    } else {
      hearts.push({ source: H('RedEmpty'), key: `empty-${i}` });
    }
  }

  const soulTotal = hp.soul;
  const blackMask = hp.black || 0;
  const numSoulHearts = Math.ceil(soulTotal / 2);

  for (let i = 0; i < numSoulHearts; i++) {
    const isBlack = ((blackMask >> i) & 1) === 1;
    const isFull = i * 2 + 1 < soulTotal;

    hearts.push({
      source: isFull
        ? isBlack
          ? H('BlackFull')
          : H('BlueFull')
        : isBlack
          ? H('BlackHalf')
          : H('BlueHalf'),
      key: `soul-${i}`,
    });
  }

  for (let i = 0; i < hp.bone; i++) {
    hearts.push({ source: H('BoneFull'), key: `bone-${i}` });
  }

  return hearts;
}

interface Props {
  state: GameState;
  /** Curse of the Unknown: ONE question-mark heart (vanilla) */
  unknown?: boolean;
}

function heartsSignature(state: GameState, unknown?: boolean): string {
  if (unknown) return 'unknown';
  const hp = state.hp;
  if (hp.hearts) {
    let s = '';
    for (const h of hp.hearts) s += h.t + (h.o ?? '') + ',';
    return s;
  }

  return `s|${hp.red},${hp.max},${hp.soul},${hp.black},${hp.bone}`;
}

function HealthBarInner({ state, unknown }: Props) {
  const hearts = unknown
    ? [{ source: HEART_UNKNOWN, key: 'unknown' }]
    : state.hp.hearts
      ? buildFromHearts(state.hp.hearts)
      : buildFromScalars(state.hp);

  const lives = unknown ? 0 : (state.hp.lives ?? 0);

  const HEARTS_PER_ROW = 8;
  const rows = Math.ceil(hearts.length / HEARTS_PER_ROW) || 1;
  const perRow = Math.min(hearts.length, HEARTS_PER_ROW);
  const heartSize = unknown
    ? HEART_SIZE
    : Math.min(
        HEART_SIZE,
        Math.floor((HEARTS_WIDTH_BUDGET - (perRow - 1) * HEART_GAP) / perRow),
      );

  return (
    <View style={[styles.container, styles.heartStack]}>
      <View style={styles.heartArea}>
        {}
        {[...Array(rows)].map((_, row) => (
          <View key={row} style={styles.heartsRow}>
            {hearts.slice(row * HEARTS_PER_ROW, (row + 1) * HEARTS_PER_ROW).map((h) => (
              <View
                key={h.key}
                style={{ width: heartSize, height: heartSize }}
              >
                <Image
                  source={h.source}
                  style={{
                    width: heartSize,
                    height: heartSize,
                    ...PIXELATED,
                  }}
                  resizeMode="stretch"
                />
                {h.overlay && (
                  <Image
                    source={h.overlay}
                    style={[
                      styles.overlay,
                      { width: heartSize, height: heartSize },
                    ]}
                    resizeMode="stretch"
                  />
                )}
              </View>
            ))}
          </View>
        ))}
        {hearts.length === 0 && (
          <Text style={styles.emptyText}>No hearts</Text>
        )}
      </View>
      {lives > 0 && (
        <View style={styles.lives}>
          <TempestaText scale={4.5}>{`x${lives}`}</TempestaText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,

    position: 'relative',
    zIndex: 10,
    elevation: 10,
  },
  heartStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartArea: {
    flexDirection: 'column',

    gap: 2,
  },
  heartsRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: HEART_GAP,
    alignItems: 'center',
  },
  lives: {
    marginLeft: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    ...PIXELATED,
  },
  emptyText: {
    fontSize: 11,
    color: '#555',
    fontStyle: 'italic',
  },
});

export default React.memo(
  HealthBarInner,
  (a, b) =>
    a.unknown === b.unknown &&
    heartsSignature(a.state) === heartsSignature(b.state) &&
    (a.state.hp.lives ?? 0) === (b.state.hp.lives ?? 0),
);
