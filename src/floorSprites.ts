
import { ImageSourcePropType } from 'react-native';

const sprites: Record<number, ImageSourcePropType> = {
  1: require('../assets/floors/1.png'),
  2: require('../assets/floors/2.png'),
  3: require('../assets/floors/3.png'),
  4: require('../assets/floors/4.png'),
  5: require('../assets/floors/5.png'),
  6: require('../assets/floors/6.png'),
  7: require('../assets/floors/7.png'),
  8: require('../assets/floors/8.png'),
  9: require('../assets/floors/9.png'),
  10: require('../assets/floors/10.png'),
  11: require('../assets/floors/11.png'),
  12: require('../assets/floors/12.png'),
  13: require('../assets/floors/13.png'),
  14: require('../assets/floors/14.png'),
  15: require('../assets/floors/15.png'),
  16: require('../assets/floors/16.png'),
  17: require('../assets/floors/17.png'),
  19: require('../assets/floors/19.png'),
  20: require('../assets/floors/20.png'),
  23: require('../assets/floors/23.png'),
  24: require('../assets/floors/24.png'),
  30: require('../assets/floors/30.png'),
  31: require('../assets/floors/31.png'),
  32: require('../assets/floors/32.png'),
  33: require('../assets/floors/33.png'),
  34: require('../assets/floors/34.png'),
  40: require('../assets/floors/40.png'),
  41: require('../assets/floors/41.png'),
  43: require('../assets/floors/43.png'),
  44: require('../assets/floors/44.png'),
  45: require('../assets/floors/45.png'),
  46: require('../assets/floors/46.png'),
  47: require('../assets/floors/47.png'),
  48: require('../assets/floors/48.png'),
  50: require('../assets/floors/50.png'),
  58: require('../assets/floors/58.png'),
  59: require('../assets/floors/59.png'),
};

export function getFloorTexture(backdrop: number | undefined): ImageSourcePropType | null {
  if (backdrop === undefined) return null;
  return sprites[backdrop] ?? null;
}
