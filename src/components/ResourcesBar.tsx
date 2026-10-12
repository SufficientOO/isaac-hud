import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import TempestaText from './TempestaText';

const SPRITES = {
  coin: require('../../assets/sprites/pickups/coin.png'),
  bomb: require('../../assets/sprites/pickups/bomb.png'),
  key: require('../../assets/sprites/pickups/key.png'),
};

const ICON_SIZE = 46;

const TEXT_SCALE = 2.8;

const ICON_PADDING_TRIM = -6;

const ROW_OVERLAP = -10;

interface Props {
  state: GameState;
}

function ResourcesBarInner({ state }: Props) {
  const { resources } = state;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={SPRITES.coin} style={styles.icon} resizeMode="stretch" />
        <TempestaText scale={TEXT_SCALE}>{String(resources.coins).padStart(2, '0')}</TempestaText>
      </View>
      <View style={[styles.row, styles.rowTight]}>
        <Image source={SPRITES.bomb} style={styles.icon} resizeMode="stretch" />
        <TempestaText scale={TEXT_SCALE}>{String(resources.bombs).padStart(2, '0')}</TempestaText>
      </View>
      <View style={[styles.row, styles.rowTight]}>
        <Image source={SPRITES.key} style={styles.icon} resizeMode="stretch" />
        <TempestaText scale={TEXT_SCALE}>{String(resources.keys).padStart(2, '0')}</TempestaText>
      </View>
    </View>
  );
}

export default React.memo(
  ResourcesBarInner,
  (a, b) =>
    a.state.resources.coins === b.state.resources.coins &&
    a.state.resources.bombs === b.state.resources.bombs &&
    a.state.resources.keys === b.state.resources.keys,
);

const styles = StyleSheet.create({
  container: {
    padding: 4,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTight: {
    marginTop: ROW_OVERLAP,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginVertical: ICON_PADDING_TRIM,
    ...PIXELATED,
  },
});
