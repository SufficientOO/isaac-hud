
import { ImageSourcePropType } from 'react-native';

const v1 = require('../assets/sprites/minimap/visited_1.png');
const v2 = require('../assets/sprites/minimap/visited_2.png');
const v3 = require('../assets/sprites/minimap/visited_3.png');
const v4 = require('../assets/sprites/minimap/visited_4.png');
const v5 = require('../assets/sprites/minimap/visited_5.png');
const v6 = require('../assets/sprites/minimap/visited_6.png');
const v7 = require('../assets/sprites/minimap/visited_7.png');
const v8 = require('../assets/sprites/minimap/visited_8.png');
const v9 = require('../assets/sprites/minimap/visited_9.png');
const v10 = require('../assets/sprites/minimap/visited_10.png');
const v11 = require('../assets/sprites/minimap/visited_11.png');
const v12 = require('../assets/sprites/minimap/visited_12.png');

const u1 = require('../assets/sprites/minimap/unvisited_1.png');
const u2 = require('../assets/sprites/minimap/unvisited_2.png');
const u3 = require('../assets/sprites/minimap/unvisited_3.png');
const u4 = require('../assets/sprites/minimap/unvisited_4.png');
const u5 = require('../assets/sprites/minimap/unvisited_5.png');
const u6 = require('../assets/sprites/minimap/unvisited_6.png');
const u7 = require('../assets/sprites/minimap/unvisited_7.png');
const u8 = require('../assets/sprites/minimap/unvisited_8.png');
const u9 = require('../assets/sprites/minimap/unvisited_9.png');
const u10 = require('../assets/sprites/minimap/unvisited_10.png');
const u11 = require('../assets/sprites/minimap/unvisited_11.png');
const u12 = require('../assets/sprites/minimap/unvisited_12.png');

const c1 = require('../assets/sprites/minimap/current_1.png');
const c2 = require('../assets/sprites/minimap/current_2.png');
const c3 = require('../assets/sprites/minimap/current_3.png');
const c4 = require('../assets/sprites/minimap/current_4.png');
const c5 = require('../assets/sprites/minimap/current_5.png');
const c6 = require('../assets/sprites/minimap/current_6.png');
const c7 = require('../assets/sprites/minimap/current_7.png');
const c8 = require('../assets/sprites/minimap/current_8.png');
const c9 = require('../assets/sprites/minimap/current_9.png');
const c10 = require('../assets/sprites/minimap/current_10.png');
const c11 = require('../assets/sprites/minimap/current_11.png');
const c12 = require('../assets/sprites/minimap/current_12.png');

const visited: ImageSourcePropType[] = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12];
const unvisited: ImageSourcePropType[] = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11, u12];
const current: ImageSourcePropType[] = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12];

export function getRoomTile(state: 'visited' | 'unvisited' | 'current', shape: number): ImageSourcePropType {
  const idx = shape - 1;
  if (idx < 0 || idx > 11) return visited[0];
  if (state === 'visited') return visited[idx];
  if (state === 'unvisited') return unvisited[idx];
  return current[idx];
}
