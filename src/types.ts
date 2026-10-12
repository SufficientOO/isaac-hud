
export type HeartType =
  | 'RedFull' | 'RedHalf' | 'RedEmpty'
  | 'Rotten' | 'RottenBone'
  | 'BlueFull' | 'BlueHalf'
  | 'BlackFull' | 'BlackHalf'
  | 'BoneFull' | 'BoneHalf' | 'BoneEmpty'
  | 'CoinFull' | 'CoinHalf' | 'CoinEmpty'
  | 'Broken' | 'BrokenCoin'
  | 'HolyMantle' | 'WoodenCross' | 'MantleBlanket';

export type HeartOverlay = 'E' | 'Eh' | 'Gold';

export interface GameState {

  modVersion?: string;
  hp: {
    red: number;
    max: number;
    soul: number;
    black: number;
    bone: number;

    lives?: number;

    hearts?: { t: HeartType; o?: HeartOverlay }[];
  };
  stats: {
    damage: number;

    tears: number;

    fireDelay: number;
    shotSpeed: number;
    speed: number;

    range: number;

    tearRange: number;
    luck: number;

    devil: number;

    angel: number;
  };
  resources: {
    coins: number;
    bombs: number;
    keys: number;
  };
  items: { id: number; name: string }[];
  activeItem: {
    id: number;
    name: string;
    charge: number;
    maxCharge: number;
    batteryCharge: number;
  };
  pocketItem: {
    type: 'none' | 'card' | 'pill';
    id: number;
    name: string;
  };
  trinket: {
    id: number;
    name: string;
  };
  floor: {
    stage: number;
    stageType: number;
    name: string;
    seed: string;

    time?: number;

    curses?: number;

    backdrop?: number;
  };
  minimap: {
    listIndex: number;
    index: number;
    type: number;
    shape: number;
    visited: boolean;
    cleared: boolean;
    displayFlags: number;
    x: number;
    y: number;
    isCurrent: boolean;
    pickups: string[];
  }[];

  messages?: { id: number; text: string; ttl: number }[];
}
