import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import { COLLECTIBLE_SPRITES } from '../collectibleSprites';
import { ACTIVE_ITEM_SPRITES } from '../activeItemSprites';

interface Props {
  state: GameState;
}

const ITEM_SIZE = 64;
const ITEM_DISPLAY_SCALE = 1.15;

const BAR_EMPTY = require('../../assets/sprites/chargebar/empty.png');
const BAR_FULL = require('../../assets/sprites/chargebar/full.png');

const BAR_BATTERY = require('../../assets/sprites/chargebar/battery.png');

const BAR_OVERLAYS: Record<number, any> = {
  1: require('../../assets/sprites/chargebar/overlay1.png'),
  2: require('../../assets/sprites/chargebar/overlay2.png'),
  3: require('../../assets/sprites/chargebar/overlay3.png'),
  4: require('../../assets/sprites/chargebar/overlay4.png'),
  5: require('../../assets/sprites/chargebar/overlay5.png'),
  6: require('../../assets/sprites/chargebar/overlay6.png'),
  8: require('../../assets/sprites/chargebar/overlay8.png'),
  12: require('../../assets/sprites/chargebar/overlay12.png'),
};

const BAR_W = 32;
const BAR_H = 64;

const INNER_TOP = 8;
const INNER_BOT = 49;
const INNER_H = INNER_BOT - INNER_TOP + 1;

const TIP_TOP = 6;

const SEGMENT_TOPS: Record<number, number[]> = {
  1: [8],
  2: [30, 8],
  3: [38, 22, 8],
  4: [42, 30, 18, 8],
  5: [44, 34, 24, 14, 8],
  6: [46, 38, 30, 22, 14, 8],
  8: [48, 42, 36, 30, 24, 18, 12, 8],
  12: [46, 42, 38, 34, 30, 26, 22, 18, 14, 10],
};

function fillTopRow(charge: number, maxCharge: number): number {
  const q = Math.max(0, Math.min(charge, maxCharge));
  if (q === 0) return BAR_H;

  if (q === maxCharge) return TIP_TOP;
  const tops = SEGMENT_TOPS[maxCharge];
  if (!tops) {

    return INNER_BOT + 1 - Math.round((q / maxCharge) * INNER_H);
  }
  if (q <= tops.length) return tops[q - 1];

  const last = tops[tops.length - 1];
  const extra = q - tops.length;
  const room = maxCharge - tops.length;
  return Math.round(last - (extra / room) * (last - INNER_TOP));
}

function ActiveItemInner({ state }: Props) {
  const { activeItem } = state;

  if (!activeItem || activeItem.id === 0) {
    return null;
  }

  const spritePath =
    ACTIVE_ITEM_SPRITES[activeItem.id] ?? COLLECTIBLE_SPRITES[activeItem.id] ?? null;

  const m = activeItem.maxCharge;
  const charge = activeItem.charge;

  const dual = activeItem.batteryCharge > 0;
  const levels = dual ? 2 * m : m;
  const greenTop = fillTopRow(charge, levels);
  const blueTop = dual
    ? fillTopRow(Math.min(charge + activeItem.batteryCharge, levels), levels)
    : BAR_H;

  const overlayKey = dual && BAR_OVERLAYS[levels] ? levels : m;
  const overlay = BAR_OVERLAYS[overlayKey] ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.itemRow}>
        {spritePath && (
          <Image
            source={spritePath}
            style={styles.itemIcon}
            resizeMode="stretch"
          />
        )}
        <View style={styles.barContainer}>
          {}
          <Image
            source={BAR_EMPTY}
            style={styles.barBg}
            resizeMode="stretch"
          />
          {}
          <View style={[styles.fillClip, { height: BAR_H - greenTop }]}>
            <Image
              source={BAR_FULL}
              style={[styles.barFill, { width: BAR_W, height: BAR_H }]}
              resizeMode="stretch"
            />
          </View>
          {}
          {dual && blueTop < greenTop && (
            <View style={[styles.batteryClip, { top: blueTop, height: greenTop - blueTop }]}>
              <Image
                source={BAR_BATTERY}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -blueTop,
                  width: BAR_W,
                  height: BAR_H,
                  ...PIXELATED,
                }}
                resizeMode="stretch"
              />
            </View>
          )}
          {}
          {overlay && (
            <Image
              source={overlay}
              style={styles.barOverlay}
              resizeMode="stretch"
            />
          )}
        </View>
      </View>
      {}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: -7,
  },
  itemIcon: {
    width: ITEM_SIZE * ITEM_DISPLAY_SCALE,
    height: ITEM_SIZE * ITEM_DISPLAY_SCALE,
    ...PIXELATED,

    marginVertical: -6,
    marginHorizontal: -6,
  },
  barContainer: {
    width: BAR_W,
    height: BAR_H,
    position: 'relative',
  },

  batteryClip: {
    position: 'absolute',
    left: 0,
    width: BAR_W,
    overflow: 'hidden',
  },
  barBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BAR_W,
    height: BAR_H,
    ...PIXELATED,
  },
  fillClip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: BAR_W,
    overflow: 'hidden',
  },
  barFill: {
    ...PIXELATED,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  barOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BAR_W,
    height: BAR_H,
    ...PIXELATED,
  },
});

export default React.memo(
  ActiveItemInner,
  (a, b) =>
    a.state.activeItem.id === b.state.activeItem.id &&
    a.state.activeItem.charge === b.state.activeItem.charge &&
    a.state.activeItem.maxCharge === b.state.activeItem.maxCharge &&
    a.state.activeItem.batteryCharge === b.state.activeItem.batteryCharge,
);
