
export const ROOM_ICONS: Record<number, any> = {

  2: require('../assets/sprites/mapicons/shop.png'),
  3: require('../assets/sprites/mapicons/treasure.png'),
  4: require('../assets/sprites/mapicons/treasure.png'),
  5: require('../assets/sprites/mapicons/boss.png'),
  6: require('../assets/sprites/mapicons/miniboss.png'),
  7: require('../assets/sprites/mapicons/secret.png'),
  8: require('../assets/sprites/mapicons/super_secret.png'),
  9: require('../assets/sprites/mapicons/arcade.png'),
  10: require('../assets/sprites/mapicons/curse.png'),
  11: require('../assets/sprites/mapicons/ambush.png'),
  12: require('../assets/sprites/mapicons/library.png'),
  13: require('../assets/sprites/mapicons/sacrifice.png'),
  14: require('../assets/sprites/mapicons/devil.png'),
  15: require('../assets/sprites/mapicons/angel.png'),
  16: null,
  17: require('../assets/sprites/mapicons/boss_ambush.png'),
  18: require('../assets/sprites/mapicons/isaacs_room.png'),
  19: require('../assets/sprites/mapicons/barren.png'),
  20: require('../assets/sprites/mapicons/chest.png'),
  21: require('../assets/sprites/mapicons/dice.png'),
  22: null,
  23: null,
  24: require('../assets/sprites/mapicons/planetarium.png'),
  25: require('../assets/sprites/mapicons/teleporter.png'),
  26: require('../assets/sprites/mapicons/teleporter.png'),
  27: null,
  28: null,
  29: require('../assets/sprites/mapicons/super_secret.png'),
  30: null,
};

export function getRoomIcon(type: number): any | null {
  return ROOM_ICONS[type] ?? null;
}
