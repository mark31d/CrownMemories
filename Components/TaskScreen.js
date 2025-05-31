/* ------------------------------------------------------------------
   Components/TaskScreen.js
   • idle  → running → done  → prize
   • timeout ветка (иконка «крестик»)
   • “Go to archive” сперва сбрасывает state -> 'idle'
------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Image, Platform,
} from 'react-native';
import LinearGradient       from 'react-native-linear-gradient';
import MaskedView           from '@react-native-community/masked-view';
import { useNavigation }    from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTask }          from './TaskContext';
import { useMemories }      from '../Components/MemoriesContext';

/* единый градиент */
const GRAD = ['#FEFBE9', '#C19237'];

/* ────────── утил-компоненты ────────── */
const GradientText = ({ children, style }) => (
  <MaskedView maskElement={<Text style={[style, { color: '#fff' }]}>{children}</Text>}>
    <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={[style, { opacity: 0 }]}>{children}</Text>
    </LinearGradient>
  </MaskedView>
);

const GradientBtn = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={[disabled && { opacity: 0.45 }, style]}
  >
    <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradBtn}>
      <Text style={styles.btnTxt}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

/* ────────── основной компонент ────────── */
export default function TaskScreen() {
  const navigation          = useNavigation();
  const { state, setState } = useTask();      // { date, status }
  const { add }             = useMemories();

  const [timer, setTimer] = useState(15 * 60);
  const [text,  setText ] = useState('');
  const [photo, setPhoto] = useState(null);

  const pickPhoto = () =>
    launchImageLibrary({ mediaType: 'photo' }, r =>
      !r.didCancel && r.assets?.[0]?.uri && setPhoto(r.assets[0].uri));

  /* ── действия ── */
  const startTask = () => {
    setTimer(15 * 60);
    setText(''); setPhoto(null);
    setState({ date: new Date().toDateString(), status: 'running' });
  };

  const handleComplete = () => {
    if (!text && !photo) { alert('Write something or attach a photo 🙂'); return; }
    const now = new Date();
    add({
      id: `${Date.now()}`,
      title  : 'Task of the day',
      desc   : text,
      photo  : photo ?? 'https://dummyimage.com/600x400/000/fff&text=No+Photo',
      dateStr: now.toLocaleDateString(),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ts     : now.getTime(),
      isDaily: true,
    });
    setState({ date: state.date, status: 'done' });
  };

  /* ── таймер ── */
  useEffect(() => {
    if (state.status !== 'running') return;
    if (timer === 0) { setState({ date: state.date, status: 'timeout' }); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [state.status, timer]);

  /* ────────── UI: RUNNING ────────── */
  if (state.status === 'running') {
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');

    return (
      <View style={styles.rootRun}>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>THERE IS TIME LEFT</Text>
          <GradientText style={styles.timer}>{mm} : {ss}</GradientText>
        </View>

        <Text style={styles.label}>What made you smile:</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="write here"
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          {photo
            ? <Image source={{ uri: photo }} style={styles.photoPreview} />
            : <>
                <Image source={require('../assets/ic_add_photo.png')} style={styles.photoIcon} />
                <Text style={styles.photoTxt}>Add photo</Text>
              </>}
        </TouchableOpacity>

        <GradientBtn
          title="To Complete"
          onPress={handleComplete}
          disabled={!text && !photo}
          style={{ marginTop: 24, width: '100%' }}
        />
      </View>
    );
  }

  /* ────────── UI: TIMEOUT ────────── */
  if (state.status === 'timeout') {
    return (
      <View style={styles.center}>
        <Image source={require('../assets/timeout.png')} style={styles.bigIcon} />
        <GradientText style={styles.h1}>Timeout, try again</GradientText>
        <GradientBtn title="Try again" onPress={startTask} style={{ width: '80%', marginTop: 20 }} />
        <Text style={styles.backHome} onPress={() => navigation.goBack()}>Back home</Text>
      </View>
    );
  }

  /* ────────── UI: PRIZE ────────── */
  if (state.status === 'prize') {
    return (
      <View style={styles.center}>
        <Image source={require('../assets/crown.png')} style={styles.crown} resizeMode="contain" />
        <GradientBtn title="Download" onPress={() => alert('💾  Saved to gallery')} style={{ width: 260, marginTop: 32 }} />
        <Text style={styles.backHome} onPress={() => { setState({ date: new Date().toDateString(), status: 'idle' }); navigation.goBack(); }}>
          Back home
        </Text>
      </View>
    );
  }

  /* ────────── UI: DONE ────────── */
  if (state.status === 'done') {
    return (
      <View style={styles.center}>
        {/* градиентный круг с иконкой */}
        <LinearGradient colors={GRAD} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.circle}>
          <Image source={require('../assets/congratulations.png')} style={styles.congratsIcon} />
        </LinearGradient>
  
        <GradientText style={styles.h1}>Congratulations!</GradientText>
        <Text style={styles.p}>You have completed the task</Text>
        <Text style={styles.pSmall}>Click the button to claim the prize</Text>
  
        <GradientBtn
          title="Take the prize"
          onPress={() => setState({ date: state.date, status: 'prize' })}
          style={{ width: '100%', marginTop: 40 }}
        />
      </View>
    );
  }

  /* ────────── UI: IDLE (стартовый) ────────── */
  return (
    <View style={styles.rootIdle}>
      <GradientText style={styles.topTitle}>TASK OF THE DAY</GradientText>
      <Image source={require('../assets/ornament.png')} style={styles.ornament} resizeMode="contain" />

      <View style={styles.card}>
        <Text style={styles.cardSmall}>TASK OF THE DAY</Text>
        <GradientText style={styles.cardTitle}>
          ADD A NEW MEMORY THAT{'\n'}MADE YOU SMILE TODAY?
        </GradientText>

        <Text style={[styles.cardSmall, { marginTop: 20 }]}>TASK COMPLETION TIME:</Text>
        <GradientText style={styles.cardTime}>15 MINUTES</GradientText>

        <GradientBtn title="Start the task" onPress={startTask} style={{ marginTop: 28, width: '100%' }} />
      </View>

      {/* Home кругленькая */}
      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.goBack()}>
        <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.homeGrad}>
          <Image source={require('../assets/ic_home.png')} style={styles.homeIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────── styles ──────────────────────── */
const styles = StyleSheet.create({
    circle:{
        width:160,
        height:160,
        borderRadius:130,
        alignItems:'center',
        justifyContent:'center',
      },
      congratsIcon:{           // сама пиктограмма фейерверка
        width:120,
        height:120,
        tintColor:'#473300',   // если нужна тёмная заливка; уберите, если PNG уже с нужным цветом
        resizeMode:'contain',
      },
  /* корневые */
  rootIdle:{ flex:1, backgroundColor:'#000', alignItems:'center',
             paddingTop:Platform.OS==='ios'?60:40, paddingHorizontal:24 },
  rootRun :{ flex:1, backgroundColor:'#000',
             paddingTop:Platform.OS==='ios'?60:40, paddingHorizontal:24 },
  center  :{ flex:1, backgroundColor:'#000', alignItems:'center',
             justifyContent:'center', padding:24 },

  /* градиентные тексты */
  topTitle :{ fontSize:28, fontWeight:'700', textAlign:'center', marginBottom:4 },
  h1       :{ fontSize:24, fontWeight:'700', textAlign:'center', marginTop:24 },
  cardTitle:{ fontSize:20, fontWeight:'600', textAlign:'center',
              marginBottom:32, lineHeight:26 },
  cardTime :{ fontSize:18, fontWeight:'600', textAlign:'center', marginBottom:12 },
  timer    :{ fontSize:48, fontWeight:'700' },

  p      :{ color:'#fff', fontSize:17, textAlign:'center', marginTop:12 },
  pSmall :{ color:'#bbb', textAlign:'center', marginTop:12 },

  ornament:{ width:260, height:60, marginBottom:24, tintColor:'#DDBB78' },

  /* карточка idle-экрана */
  card:{ width:'100%', backgroundColor:'#1C1C1C', borderRadius:8,
         paddingVertical:28, paddingHorizontal:20, alignItems:'center' },
  cardSmall:{ color:'#bbb', fontSize:14, textAlign:'center' },

  /* RUNNING */
  timerBox:{ backgroundColor:'#1C1C1C', borderRadius:8, alignItems:'center', paddingVertical:16 },
  timerLabel:{ color:'#bbb', fontSize:14, marginBottom:4 },

  label:{ color:'#fff', fontSize:18, marginTop:32, marginBottom:8 },
  input:{ borderWidth:1, borderColor:'#333', borderRadius:8,
          minHeight:120, color:'#fff', padding:12 },

  photoBox:{ height:160, borderRadius:8, borderWidth:1, borderColor:'#333',
             marginTop:18, alignItems:'center', justifyContent:'center' },
  photoPreview:{ width:'100%', height:'100%', borderRadius:8 },
  photoIcon:{ width:40, height:40, tintColor:'#DDBB78', marginBottom:8 },
  photoTxt:{ color:'#777' },

  /* градиентная кнопка */
  gradBtn:{ height:56, borderRadius:28, justifyContent:'center',
            alignItems:'center', paddingHorizontal:24 },
  btnTxt :{ color:'#000', fontSize:17, fontWeight:'600' },

  /* big round icons */
  bigIcon:{ width:260, height:260, resizeMode:'contain' },

  /* prize crown */
  crown:{ width:320, height:420, borderRadius:16, backgroundColor:'#0E1425' },

  /* back-home link */
  backHome:{ color:'#bbb', marginTop:16, textAlign:'center' },

  /* home */
  homeBtn :{ marginTop:36, marginBottom:20 },
  homeGrad:{ width:72, height:72, borderRadius:36, alignItems:'center', justifyContent:'center' },
  homeIcon:{ width:28, height:28, tintColor:'#000' },
});
