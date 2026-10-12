import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { GameState } from '../types';
import TempestaText from './TempestaText';
import { TEMPESTA_SIZES } from '../tempestaFont';

interface Props {
  state: GameState;
}

interface OverlayMessage {
  id: number;
  text: string;
  ttl: number;
}

const STREAK_BG = require('../../assets/sprites/ui/streak.png');

const FADE_S = 0.75;

const MAX_SHOWN = 3;

const MIN_SCALE = 2.2;
const MAX_SCALE = 7;

function charAdvance(ch: string): number {
  const m = TEMPESTA_SIZES[ch];
  if (!m) return 5;
  return m.xa > 0 ? m.xa : m.w + 1;
}

function OverlayMessageBanner({
  msg,
  availWidth,
  stackIndex,
}: {
  msg: OverlayMessage;
  availWidth: number;
  stackIndex: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [fading, setFading] = useState(false);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      delay: stackIndex * 90,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [opacity, stackIndex]);

  useEffect(() => {
    if (msg.ttl <= FADE_S && !fading) {
      setFading(true);
      Animated.timing(opacity, {
        toValue: 0,
        duration: Math.max(0, msg.ttl) * 1000,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [msg.ttl, fading, opacity]);

  const scale = useMemo(() => {
    const baseWidth = [...msg.text].reduce((sum, ch) => sum + charAdvance(ch), 0);
    if (baseWidth <= 0) return MIN_SCALE;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, availWidth / baseWidth));
  }, [msg.text, availWidth]);

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      {}
      <Image
        source={STREAK_BG}
        style={styles.streak}
        resizeMode="stretch"
      />
      <View style={styles.streakContent}>
        <TempestaText scale={scale} numberOfLines={1}>
          {msg.text}
        </TempestaText>
      </View>
    </Animated.View>
  );
}

export default function OverlayMessages({ state }: Props) {
  const messages = (state.messages ?? []).slice(0, MAX_SHOWN);
  const { width } = useWindowDimensions();

  const availWidth = width - 56;
  if (messages.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {messages.map((m, i) => (
        <OverlayMessageBanner
          key={m.id}
          msg={m}
          availWidth={availWidth}
          stackIndex={i}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 2,
  },
  banner: {
    width: '100%',
  },

  streak: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    ...PIXELATED,
  },
  streakContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 4,
  },
});
