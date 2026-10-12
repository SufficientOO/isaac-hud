import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import { getRoomTile } from '../minimapTiles';
import { getRoomIcon } from '../roomIcons';
import { getPickupSprite } from '../pickupSprites';

interface Props {
  state: GameState;
}

const FLAG_VISIBLE = 1;
const FLAG_SHADOW = 2;
const FLAG_SHOW_ICON = 4;

const PARCHMENT_BG = require('../../assets/sprites/ui/parchment.png');

const TILE_W = 18;
const TILE_H = 16;

const MAP_BORDER = 0;

const MAX_TILE_H_FRAC = 1 / 6;

function getRoomGrid(shape: number): { w: number; h: number } {
  switch (shape) {
    case 1: return { w: 1, h: 1 };
    case 2: return { w: 1, h: 1 };
    case 3: return { w: 1, h: 1 };
    case 4: return { w: 1, h: 2 };
    case 5: return { w: 1, h: 2 };
    case 6: return { w: 2, h: 1 };
    case 7: return { w: 2, h: 1 };
    case 8: return { w: 2, h: 2 };
    case 9: return { w: 2, h: 2 };
    case 10: return { w: 2, h: 2 };
    case 11: return { w: 2, h: 2 };
    case 12: return { w: 2, h: 2 };
    default: return { w: 1, h: 1 };
  }
}

const RoomCell = React.memo(function RoomCell(props: {
  room: GameState['minimap'][number];
  x: number;
  y: number;
  roomW: number;
  roomH: number;
  cellW: number;
  cellH: number;
  iconOnlyRoom: boolean;
}) {
  const { room, x, y, roomW, roomH, cellW, cellH, iconOnlyRoom } = props;
  const showIcon = (room.displayFlags & FLAG_SHOW_ICON);
  const icon = (showIcon || room.isCurrent) ? getRoomIcon(room.type) : null;
  const { w, h } = getRoomGrid(room.shape);
  return (
    <React.Fragment key={room.listIndex ?? room.index}>
      {}
      {!iconOnlyRoom && (
        <Image
          source={getRoomTile(
            room.isCurrent ? 'current' : room.visited ? 'visited' : 'unvisited',
            room.shape,
          )}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: roomW,
            height: roomH,
            ...PIXELATED,
          }}
          resizeMode="stretch"
        />
      )}
      {icon && (
        <Image
          source={icon}
          style={{
            position: 'absolute',
            left: iconOnlyRoom
              ? x + (cellW - Math.min(cellW, cellH)) / 2
              : x + (roomW - Math.min(roomW, roomH)) / 2,
            top: iconOnlyRoom
              ? y + (cellH - Math.min(cellW, cellH)) / 2
              : y + (roomH - Math.min(roomW, roomH)) / 2,
            width: Math.min(iconOnlyRoom ? cellW : roomW, iconOnlyRoom ? cellH : roomH),
            height: Math.min(iconOnlyRoom ? cellW : roomW, iconOnlyRoom ? cellH : roomH),
            ...PIXELATED,
          }}
          resizeMode="stretch"
        />
      )}
      {!iconOnlyRoom && (
        <RoomPickups
          pickups={room.pickups && room.pickups.length > 0 ? room.pickups : []}
          x={x}
          y={y}
          roomW={roomW}
          roomH={roomH}
        />
      )}
    </React.Fragment>
  );
});

function roomsSignature(rooms: GameState['minimap']): string {
  let s = '';
  for (const r of rooms) {
    s += `${r.listIndex}:${r.x},${r.y},${r.shape},${r.displayFlags},${r.visited ? 1 : 0},${r.isCurrent ? 1 : 0},${(r.pickups || []).join('+')};`;
  }
  return s;
}

function MinimapInner({ state }: Props) {
  const { minimap } = state;
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const visibleRooms = useMemo(() => {

    return minimap.filter(
      (r) => (r.displayFlags & (FLAG_VISIBLE | FLAG_SHOW_ICON)) || r.isCurrent,
    );
  }, [minimap]);

  const iconOnly = useMemo(() => {
    return new Set(
      visibleRooms
        .filter((r) => !(r.displayFlags & FLAG_VISIBLE) && !r.isCurrent)
        .map((r) => r.listIndex),
    );
  }, [visibleRooms]);

  const tileRooms = useMemo(
    () =>
      visibleRooms.filter(
        (r) => !iconOnly.has(r.listIndex),
      ),
    [visibleRooms, iconOnly],
  );

  const bounds = useMemo(() => {
    if (visibleRooms.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const r of visibleRooms) {
      const { w, h } = getRoomGrid(r.shape);
      if (r.x < minX) minX = r.x;
      if (r.x + w - 1 > maxX) maxX = r.x + w - 1;
      if (r.y < minY) minY = r.y;
      if (r.y + h - 1 > maxY) maxY = r.y + h - 1;
    }
    return { minX, maxX, minY, maxY, cols: maxX - minX + 1, rows: maxY - minY + 1 };
  }, [visibleRooms]);

  const padding = 8;

  const MAP_MARGIN = 20;

  const BORDER_W = MAP_BORDER;

  const win = Dimensions.get('window');
  const availW = containerSize.w > 0
    ? containerSize.w - (padding + MAP_MARGIN + BORDER_W) * 2
    : win.width * 0.55;
  const availH = containerSize.h > 0
    ? containerSize.h - (padding + MAP_MARGIN + BORDER_W) * 2
    : win.height * 0.5;

  const layoutSignature =
    `${containerSize.w}x${containerSize.h}|` +
    visibleRooms.map((r) => `${r.listIndex}:${r.x},${r.y},${r.shape},${r.displayFlags},${r.visited ? 1 : 0},${r.isCurrent ? 1 : 0}`).join(';');

  const layout = useMemo(() => {
    if (!bounds) return null;
    const scaleW = availW / (bounds.cols * TILE_W);
    const scaleH = availH / (bounds.rows * TILE_H);
    const maxScale = (availH * MAX_TILE_H_FRAC) / TILE_H;
    const scale = Math.min(scaleW, scaleH, maxScale);
    const cellW = TILE_W * scale;
    const cellH = TILE_H * scale;

    const colEdge = (cx: number) => Math.round((cx - bounds.minX) * cellW);
    const rowEdge = (cy: number) => Math.round((cy - bounds.minY) * cellH);

    const origin = padding + MAP_MARGIN + BORDER_W;
    const contentW = colEdge(bounds.maxX + 1) + origin * 2;
    const contentH = rowEdge(bounds.maxY + 1) + origin * 2;
    return { cellW, cellH, colEdge, rowEdge, origin, contentW, contentH };

  }, [layoutSignature]);

  if (!bounds || !layout || visibleRooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No map data</Text>
        </View>
      </View>
    );
  }
  const { cellW, cellH, colEdge, rowEdge, origin, contentW, contentH } = layout;

  return (
    <View style={styles.container} onLayout={(e) => { const { width, height } = e.nativeEvent.layout; setContainerSize({ w: width, h: height }); }}>
      <View style={styles.mapFrame}>
        {}
        <Image
          source={PARCHMENT_BG}
          style={styles.parchment}
          resizeMode="stretch"
        />
        <View style={[styles.mapContent, { width: contentW, height: contentH }]}>
        {visibleRooms.map((room) => {
          const { w, h } = getRoomGrid(room.shape);

          const x = origin + colEdge(room.x);
          const y = origin + rowEdge(room.y);

          const roomW = colEdge(room.x + w) - colEdge(room.x) + 1;
          const roomH = rowEdge(room.y + h) - rowEdge(room.y) + 1;

          const iconOnlyRoom = iconOnly.has(room.listIndex);

          return (
            <RoomCell
              key={room.listIndex ?? room.index}
              room={room}
              x={x}
              y={y}
              roomW={roomW}
              roomH={roomH}
              cellW={cellW}
              cellH={cellH}
              iconOnlyRoom={iconOnlyRoom}
            />
          );
        })}
        </View>
      </View>
    </View>
  );
}

function RoomPickups({ pickups, x, y, roomW, roomH }: { pickups: string[]; x: number; y: number; roomW: number; roomH: number }) {
  if (!pickups || pickups.length === 0) return null;
  const iconSize = Math.floor(Math.min(roomW, roomH) * 0.4);
  const gap = 2;
  const totalW = pickups.length * iconSize + (pickups.length - 1) * gap;
  const startX = x + (roomW - totalW) / 2;
  const startY = y + roomH - iconSize - 2;
  return (
    <>
      {pickups.map((ptype, i) => {
        const sprite = getPickupSprite(ptype);
        if (!sprite) return null;
        return (
          <Image
            key={i}
            source={sprite}
            style={{
              position: 'absolute',
              left: startX + i * (iconSize + gap),
              top: startY,
              width: iconSize,
              height: iconSize,
              ...PIXELATED,
            }}
            resizeMode="stretch"
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  mapFrame: {
    flex: 1,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: MAP_BORDER,

  },
  parchment: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  mapContent: {
    position: 'relative',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
  },
});

export default React.memo(
  MinimapInner,
  (a, b) => roomsSignature(a.state.minimap) === roomsSignature(b.state.minimap),
);
