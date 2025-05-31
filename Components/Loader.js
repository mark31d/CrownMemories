// Components/Loader.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width * 0.8;  // 80% ширины экрана

export default function Loader({ withLogo = true, onFinish }) {
  const [percent, setPercent] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация от 0 до 1 за 1.8 секунды
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start(() => {
      onFinish?.(); // можно передать колбэк для перехода дальше
    });

    // Слушаем изменение value и обновляем процент
    const id = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });
    return () => progress.removeListener(id);
  }, [progress, onFinish]);

  // Ширина заполненной части барa в %
  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_WIDTH],
  });

  return (
    <View style={s.root}>
      {withLogo && (
        <Image
          source={require('../assets/logo_crown.png')}
          style={s.logo}
        />
      )}

      <View style={s.barContainer}>
        <Animated.View style={[s.barFill, { width: widthInterpolated }]}>
          <LinearGradient
            colors={['#f8de8c', '#c7a252']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <Text style={s.percentText}>{percent}%</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  barContainer: {
    width: BAR_WIDTH,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c7a252',
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  percentText: {
    marginTop: 12,
    color: '#FDF5D5',
    fontSize: 24,
    fontWeight: '500',
  },
});
