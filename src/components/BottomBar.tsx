import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import TempestaText from './TempestaText';
import { getCardSprite } from '../cardSprites';
import { getTrinketSprite } from '../trinketSprites';
import { TEMPESTA_SIZES } from '../tempestaFont';

const PILL_ICON = require('../../assets/sprites/pickups/pill.png');

interface Props {
  state: GameState;

  dockBg: string;

  dividerColor: string;
}

const ICON_SIZE = 16;

const TEXT_SCALE = 1.6;

const TEXT_NUDGE_Y = 2;

// Rendered width of a string at a given scale, from the real glyph metrics
// (per-char advance = max(xa, w+1); missing glyphs 5px).
function textWidth(text: string, scale = TEXT_SCALE): number {
  let t = 0;
  for (const ch of text) {
    const m = (TEMPESTA_SIZES as Record<string, { w: number; xa: number }>)[ch];
    t += (m ? Math.max(m.xa, m.w + 1) : 5) * scale;
  }
  return t;
}

function formatPlaytime(ticks: number): string {
  const totalSeconds = Math.floor(ticks / 30);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function BottomBarInner({ state, dockBg, dividerColor }: Props) {
  const { pocketItem, trinket, floor } = state;

  const hasPocket = pocketItem && pocketItem.type !== 'none' && pocketItem.id !== 0;
  const hasTrinket = trinket && trinket.id > 0;

  // "Level - playtime" center string
  const centerParts: string[] = [];
  if (floor && floor.name) centerParts.push(floor.name);
  if (floor && typeof floor.time === 'number') {
    centerParts.push(formatPlaytime(floor.time));
  }
  const centerText = centerParts.join(' - ');

  // Crowding rule: long floor name + long pocket-item name (>30 chars
  // combined) → trinket NAME stops rendering (icon stays) and the center
  // string anchors left, never touching the held-item name. The playtime
  // is ALSO never clipped: in crowded mode the center's content right-
  // aligns inside its strip, so the floor NAME's start yields instead of
  // the time's digits.
  const crowdedName =
    ((floor?.name?.length ?? 0) + (hasPocket ? (pocketItem?.name?.length ?? 0) : 0)) > 30;
  const longNames = crowdedName;

  if (!hasPocket && !hasTrinket && !centerText) return null;

  const pocketIcon = hasPocket
    ? pocketItem.type === 'card'
      ? getCardSprite(pocketItem.id)
      : PILL_ICON
    : null;

  const trinketIcon = hasTrinket ? getTrinketSprite(trinket.id) : null;
  const showTrinketName = hasTrinket && !longNames;

  // The center is ABSOLUTELY positioned full-width so it stays dead-centered
  // regardless of what the left/right sections contain (picking up a pill
  // must not shift it). Only when crowded does it become left-anchored:
  // left inset = left section's real width (trinket icon + optional name),
  // right inset = right section's real width (icon + held-item name, both
  // measured with the exact glyph metrics), +6 breathing gap. The text then
  // fills the remaining strip; it clips only when that's genuinely too
  // small — the right name always renders complete.
  const leftInset = trinketIcon
    ? ICON_SIZE + (showTrinketName ? 6 + textWidth(trinket.name) : 0)
    : 0;
  const rightInset = hasPocket
    ? (pocketIcon ? ICON_SIZE + 6 : 0) + (hasPocket ? textWidth(pocketItem.name) : 0)
    : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: dockBg, borderTopColor: dividerColor },
      ]}
    >
      <View style={styles.section}>
        {trinketIcon && (
          <Image
            source={trinketIcon}
            style={styles.icon}
            resizeMode="stretch"
          />
        )}
        {showTrinketName && (
          <TempestaText scale={TEXT_SCALE} style={styles.dockText} numberOfLines={1}>
            {trinket.name}
          </TempestaText>
        )}
      </View>

      {centerText ? (
        longNames ? (
          <View style={styles.centerCrowded} pointerEvents="none">
            <TempestaText scale={TEXT_SCALE} style={styles.dockText} numberOfLines={1}>
              {centerText}
            </TempestaText>
          </View>
        ) : (
          <View style={styles.center} pointerEvents="none">
            <View style={styles.centerInner}>
              <TempestaText scale={TEXT_SCALE} style={styles.dockText} numberOfLines={1}>
                {centerText}
              </TempestaText>
            </View>
          </View>
        )
      ) : null}

      <View style={styles.sectionRight}>
        {pocketIcon && (
          <Image
            source={pocketIcon}
            style={styles.icon}
            resizeMode="stretch"
          />
        )}
        {hasPocket && (
          <TempestaText scale={TEXT_SCALE} style={styles.dockText} numberOfLines={1}>
            {pocketItem.name}
          </TempestaText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',

    borderTopWidth: 1,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  center: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // crowded: a normal FLOW child between the sections — starts right after
  // the trinket (left section is fixed-size), yields with overflow-hidden
  // when the held-item name needs the room (its section never shrinks)
  centerCrowded: {
    flexShrink: 1,
    overflow: 'hidden',
    paddingLeft: 5,
    paddingRight: 5,
    marginHorizontal: 6,
  },
  centerInner: {
    overflow: 'hidden',
    paddingLeft: 5,
    paddingRight: 5,
  },
  dockText: {
    transform: [{ translateY: TEXT_NUDGE_Y }],
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    ...PIXELATED,
  },
});

function bottomBarSignature(s: GameState): string {
  const f = s.floor;
  return `${f?.time}|${f?.name}|${s.trinket?.id}|${s.pocketItem?.type}:${s.pocketItem?.id}:${s.pocketItem?.name}`;
}

export default React.memo(
  BottomBarInner,
  (a, b) =>
    bottomBarSignature(a.state) === bottomBarSignature(b.state) &&
    a.dockBg === b.dockBg &&
    a.dividerColor === b.dividerColor,
);