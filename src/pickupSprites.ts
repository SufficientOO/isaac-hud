
import { ImageSourcePropType } from 'react-native';

const sprites: Record<string, ImageSourcePropType> = {
  heart: require('../assets/sprites/mappickups/heart.png'),
  coin: require('../assets/sprites/mappickups/coin.png'),
  key: require('../assets/sprites/mappickups/key.png'),
  bomb: require('../assets/sprites/mappickups/bomb.png'),
  pill: require('../assets/sprites/mappickups/pill.png'),
  card: require('../assets/sprites/mappickups/card.png'),
  trinket: require('../assets/sprites/mappickups/trinket.png'),
  chest: require('../assets/sprites/mappickups/chest.png'),
  battery: require('../assets/sprites/mappickups/battery.png'),
  grabbag: require('../assets/sprites/mappickups/chest.png'),
  collectible: require('../assets/sprites/mappickups/battery.png'),
};

export function getPickupSprite(type: string): ImageSourcePropType | null {
  return sprites[type] ?? null;
}
