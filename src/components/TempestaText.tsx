import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { PIXELATED } from '../styleHelpers';
import { getTempestaSprite, getTempestaColoredSprite, TEMPESTA_SIZES } from '../tempestaFont';

interface Props {
  children: string;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  numberOfLines?: number;

  color?: 'green' | 'red';
}

function TempestaText({ children, style, scale = 2, numberOfLines, color }: Props) {
  const text = String(children);

  return (
    <View style={[styles.container, style]}>
      {text.split('').map((ch, i) => {
        const sprite = color
          ? getTempestaColoredSprite(ch, color)
          : getTempestaSprite(ch);
        const m = TEMPESTA_SIZES[ch];
        if (!sprite) {
          return <View key={i} style={{ width: 5 * scale }} />;
        }
        const w = m.w * scale;
        const h = m.h * scale;
        const xo = m.xo * scale;
        const yo = m.yo * scale;
        const xa = (m.xa > 0 ? m.xa : m.w + 1) * scale;
        return (
          <Image
            key={i}
            source={sprite}
            style={{
              width: w,
              height: h,
              marginLeft: i === 0 ? Math.min(0, xo) : 0,
              marginRight: xa - w + (i === 0 ? Math.min(0, -xo) : 0),
              marginTop: yo,
              ...PIXELATED,
            } as ImageStyle}
            resizeMode="stretch"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default React.memo(TempestaText);
