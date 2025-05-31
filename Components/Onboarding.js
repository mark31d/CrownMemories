import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: 's1',
    img: require('../assets/onb1.png'),
    h1: 'Welcome to',
    h2: 'Crown Memories!',
    desc: 'the app will help you save the best\nmoments of your life.',
  },
  {
    key: 's2',
    img: require('../assets/onb2.png'),
    h1: 'Simplicity',
    h2: 'in every detail',
    desc: 'save your thoughts with one touch',
  },
  {
    key: 's3',
    img: require('../assets/onb3.png'),
    h1: 'Assemble the',
    h2: 'puzzle',
    desc: 'and get secret prize for you',
  },
  {
    key: 's4',
    img: require('../assets/onb4.png'),
    h1: 'Let’s',
    h2: 'get started!',
    desc: 'your memories will always be with you',
    last: true,
  },
];

export default function Onboarding({ navigation }) {
  const listRef = useRef(null);
  const [index, setIdx] = useState(0);

  const next = () => {
    const nextIdx = index + 1;
    if (nextIdx < SLIDES.length) {
      listRef.current?.scrollToIndex({ index: nextIdx });
      setIdx(nextIdx);
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('@cm_seen_onboard', '1');
    navigation.replace('Main');
  };

  const Btn = ({ title, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s.btnWrap}>
      <LinearGradient
        colors={['#FEFBE9', '#DDBB78', '#C19237']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.btn}
      >
        <Text style={s.btnTxt}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={[s.page, { width }]}>        
      <Image source={item.img} style={s.img} />
      <View style={s.textWrap}>
        <Text style={s.h1}>{item.h1}</Text>
        <Text style={s.h2}>{item.h2}</Text>
        <Text style={s.desc}>{item.desc}</Text>
      </View>
      <Btn
        title={item.last ? 'Ready to start' : 'Continue'}
        onPress={item.last ? finish : next}
      />
    </View>
  );

  return (
    <View style={s.root}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.key}
        onMomentumScrollEnd={e =>
          setIdx(Math.round(e.nativeEvent.contentOffset.x / width))
        }
      />
      <View style={s.dotsWrap}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const DOT = 8;
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  page: { flex: 1, alignItems: 'center' },
  img: { width, height: height * 0.55, resizeMode: 'cover' },
  textWrap: { alignSelf: 'flex-start', paddingHorizontal: 24, marginTop: 26 },
  h1: { color: '#fff', fontSize: 32, lineHeight: 38 },
  h2: { color: '#fff', fontSize: 36, fontWeight: '700', lineHeight: 42 },
  desc: { color: '#bbb', fontSize: 16, marginTop: 14, maxWidth: '86%' },

  /* обёртка для кнопки */
  btnWrap: {
    position: 'absolute',
    bottom: 60,
    width: '86%',
  },
  /* градиент */
  btn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  btnTxt: { color: '#000', fontSize: 17, fontWeight: '600' },

  dotsWrap: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#F8DE8C' },
});
