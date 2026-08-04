import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const FRONT_COLOR = '#4f29f0';
const BACK_COLOR = '#c3c8de';

type RingSpec = {
  sizeRatio: number;
  viewBox: number;
  center: number;
  radius: number;
  dashArray: string;
  keyframes: readonly [number, number, number, number, number];
  backDelay: number;
  frontDelay: number;
};

const RINGS: RingSpec[] = [
  {
    sizeRatio: 86 / 64,
    viewBox: 86,
    center: 43,
    radius: 40,
    dashArray: '62.75 188.25',
    keyframes: [25, 0, 301, 276, 276],
    backDelay: 300,
    frontDelay: 150,
  },
  {
    sizeRatio: 60 / 64,
    viewBox: 60,
    center: 30,
    radius: 27,
    dashArray: '42.5 127.5',
    keyframes: [17, 0, 204, 187, 187],
    backDelay: 250,
    frontDelay: 100,
  },
  {
    sizeRatio: 34 / 64,
    viewBox: 34,
    center: 17,
    radius: 14,
    dashArray: '22 66',
    keyframes: [9, 0, 106, 97, 97],
    backDelay: 200,
    frontDelay: 50,
  },
];

function AnimatedRing({
  spec,
  dimension,
  strokeWidth,
  stroke,
  delay,
}: {
  spec: RingSpec;
  dimension: number;
  strokeWidth: number;
  stroke: string;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(
      progress.value,
      [0, 0.25, 0.65, 0.8, 1],
      spec.keyframes,
    ),
  }));

  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${spec.viewBox} ${spec.viewBox}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <AnimatedCircle
        cx={spec.center}
        cy={spec.center}
        r={spec.radius}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={spec.dashArray}
        transform={`rotate(-100 ${spec.center} ${spec.center})`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

interface WifiLoaderProps {
  size: number;
  showLabel?: boolean;
  label?: string;
}

export function WifiLoader({ size }: WifiLoaderProps) {
  const strokeWidth = Math.max(3, (6 * size) / 64);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {RINGS.map((spec) => {
        const dimension = (size * spec.sizeRatio);
        return (
          <View
            key={spec.sizeRatio}
            style={{ position: 'absolute', width: dimension, height: dimension }}
          >
            <AnimatedRing
              spec={spec}
              dimension={dimension}
              strokeWidth={strokeWidth}
              stroke={BACK_COLOR}
              delay={spec.backDelay}
            />
            <View style={StyleSheet.absoluteFillObject}>
              <AnimatedRing
                spec={spec}
                dimension={dimension}
                strokeWidth={strokeWidth}
                stroke={FRONT_COLOR}
                delay={spec.frontDelay}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
