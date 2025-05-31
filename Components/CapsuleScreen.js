/* ------------------------------------------------------------------
   Components/CapsuleScreen.js ― final version (Timer fixed, auto-unlock)
------------------------------------------------------------------- */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Text, Modal,
  TextInput, Image, Animated,  Platform, ScrollView,Share, 
} from 'react-native';
import DateTimePicker               from '@react-native-community/datetimepicker';
import LinearGradient               from 'react-native-linear-gradient';
import MaskedView                   from '@react-native-community/masked-view';
import { launchImageLibrary }       from 'react-native-image-picker';
import { useNavigation }            from '@react-navigation/native';
import { useCapsules }              from './CapsulesContext';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

/* ───────── constants / helpers ───────── */
const GRAD = ['#FEFBE9', '#C19237'];
const DAY  = 86_400_000;          // мс в сутках

const GradientText = ({ children, style }) => (
  <MaskedView maskElement={<Text style={[style, { color:'#fff' }]}>{children}</Text>}>
    <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}}>
      <Text style={[style,{opacity:0}]}>{children}</Text>
    </LinearGradient>
  </MaskedView>
);

const GButton = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled}
    style={[styles.btnWrap, disabled && {opacity:.4}, style]}>
    <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btnGrad}>
      <Text style={styles.btnTxt}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const useToast = () => {
       const y = useRef(new Animated.Value(-120)).current;
      const [msg,setMsg]   = useState('');
       const [icon,setIcon] = useState(null);
       const fire = (txt, ic = null) => {              // ← 2-й аргумент — иконка
             setMsg(txt);
             setIcon(ic);
    Animated.spring(y,{toValue:Platform.OS==='ios'?60:30,useNativeDriver:true}).start();
    setTimeout(()=>Animated.timing(y,{toValue:-120,duration:250,useNativeDriver:true}).start(),1800);
  };
  const Toast = () => (
         <Animated.View style={[styles.toast,{transform:[{translateY:y}]}]}>
           <LinearGradient
             colors={GRAD}
             start={{x:0,y:0}} end={{x:1,y:1}}
             style={styles.toastCircle}
           >
             {icon && (
               <Image
                 source={icon}
                 style={{width:22,height:22,tintColor:'#000' , }}
                resizeMode="contain"
              />
             )}
           </LinearGradient>
           <Text style={styles.toastTxt}>{msg}</Text>
         </Animated.View>
       );
  return { fire:fire, Toast };
};

/* ───────── component ───────── */
export default function CapsuleScreen() {
  const nav                       = useNavigation();
  const { caps, add, remove }     = useCapsules();
  const { fire:toast, Toast }     = useToast();

  const [stage,setStage]          = useState('list');   // list | form | confirm | locked | view | delete
  const [draft,setDraft]          = useState(null);

  /* form fields */
  const [title,setTitle]          = useState('');
  const [desc,setDesc]            = useState('');
  const [photo,setPhoto]          = useState(null);
  const [openDate,setOpenDate]    = useState(new Date(Date.now()+DAY));

  /* pickers */
  const [showDate,setShowDate]    = useState(false);
  const [showTime,setShowTime]    = useState(false);

  /* timer (seconds) */
  const [secLeft,setSecLeft]      = useState(0);
const shareCapsule = async cap => {
    try {
      await Share.share({
        title  : cap.title,
        message: `${cap.title}\n\n${cap.text}\n\nCreated: ${new Date(cap.createAt)
          .toLocaleString()}\nOpen date: ${new Date(cap.openAt).toLocaleString()}`,
        // url прикладываем ТОЛЬКО если это http/https; локальные file:// чаще всего
        // не открываются в системном шэре без сторонних библиотек
        url    : cap.photo?.startsWith('http') ? cap.photo : undefined,
      });
    } catch (err) {
      if (err?.message !== 'User did not share') toast('Share failed');
    }
  };
  /* ───────── TIMER ───────── */
  useEffect(()=>{
    if (stage!=='locked' || !draft) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((draft.openAt - Date.now())/1000));
      setSecLeft(diff);

      // автоснятие блокировки
      if(diff===0){
        toast('The capsule is now open!');
        setStage('view');
      }
    };
    tick();                       // первый вызов сразу
    const id = setInterval(tick,1000);
    return ()=>clearInterval(id);
  },[stage,draft]);

  const dd = String(Math.floor(secLeft/86_400)).padStart(2,'0');
  const hh = String(Math.floor((secLeft%86_400)/3_600)).padStart(2,'0');
  const mm = String(Math.floor((secLeft%3_600)/60)).padStart(2,'0');

  /* helpers */
  const resetForm = () =>{
    setTitle(''); setDesc(''); setPhoto(null);
    setOpenDate(new Date(Date.now()+DAY));
  };
  const pickPhoto = ()=>launchImageLibrary({mediaType:'photo'},r=>{
    if(!r.didCancel && r.assets?.[0]?.uri) setPhoto(r.assets[0].uri);
  });

  /* ───────── LIST ───────── */
  if(stage==='list'){
    const renderItem = ({item})=>{
      const locked = Date.now() < item.openAt;

      return(
        <View style={styles.card}>
          <TouchableOpacity activeOpacity={0.9}
            onPress={()=>{setDraft(item);setStage(locked?'locked':'view');}}>
            {locked
              ?<LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.preview}>
                 <Image source={require('../assets/ic_lock_closed.png')} style={styles.lockIcon}/>
               </LinearGradient>
              :<Image source={{uri:item.photo}} style={styles.preview}/>}
          </TouchableOpacity>

          <View style={styles.infoBlock}>
            <Text style={styles.cardTtl}>{item.title}</Text>
            <Text style={styles.meta}>Opening date: <Text style={styles.metaVal}>{new Date(item.openAt).toLocaleString()}</Text></Text>
            <Text style={styles.meta}>Creation date: <Text style={styles.metaVal}>{new Date(item.createAt).toLocaleDateString()}</Text></Text>
            <GButton title="Open" style={{marginTop:18}}
              onPress={()=>{setDraft(item);setStage(locked?'locked':'view');}}/>
          </View>
        </View>
      );
    };

    return(
      <View style={styles.root}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>nav.goBack()} style={styles.backHit}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon}/>
          </TouchableOpacity>
          <Text style={styles.hTitle}>TIME CAPSULE</Text>
          <TouchableOpacity onPress={()=>{resetForm();setStage('form');}}>
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.addCircle}>
              <Text style={styles.addPlus}>＋</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          data={caps}
          keyExtractor={c=>c.id}
          renderItem={renderItem}
          contentContainerStyle={{padding:18,paddingBottom:140}}
        />
        <Toast/>
      </View>
    );
  }

  /* ───────── FORM ───────── */
  if(stage==='form'){
    return(
      <ScrollView style={styles.root} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>setStage('list')} style={styles.backHit}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon}/>
          </TouchableOpacity>
          <Text style={styles.hTitle}>A NEW CAPSULE</Text>
        </View>

        <Text style={styles.label}>Capsule name:</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="" placeholderTextColor="#666"/>

        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          {photo
            ?<Image source={{uri:photo}} style={styles.photoImg}/>
            :<>
               <Image source={require('../assets/ic_add_photo.png')} style={styles.photoIcon}/>
               <Text style={styles.photoTxt}>Add photo</Text>
             </>}
        </TouchableOpacity>

        <TextInput
          style={styles.descBox}
          multiline placeholder="Description of the capsule..."
          placeholderTextColor="#666"
          value={desc} onChangeText={setDesc}
        />

        <View style={styles.row}>
          <TouchableOpacity style={[styles.dateBtn,{marginRight:6}]} onPress={()=>setShowDate(true)}>
            <Text style={styles.dateTxt}>{openDate.toLocaleDateString()}</Text>
            <Image source={require('../assets/ic_calendar.png')} style={styles.dateIcon}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dateBtn,{marginLeft:6}]} onPress={()=>setShowTime(true)}>
            <Text style={styles.dateTxt}>{openDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text>
            <Image source={require('../assets/ic_clock.png')} style={styles.dateIcon}/>
          </TouchableOpacity>
        </View>

        <GButton title="Done" style={{marginTop:30}} disabled={!(title&&photo)}
          onPress={()=>{
            const newCap={
              id        : Date.now().toString(),
              title     : title,
              photo     : photo,
              createAt  : Date.now(),
              openAt    : openDate.getTime(),  // <-- надёжный формат
              text      : desc||'-',
            };
            setDraft(newCap);
            setStage('confirm');
          }}/>

        {/* date modal */}
        {showDate && (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker mode="date" display="spinner" value={openDate}
                    minimumDate={new Date()}
                    onChange={(_,d)=>d&&setOpenDate(d)}
                    style={{backgroundColor:'#fff'}}/>
                </View>
                <TouchableOpacity style={styles.confirmWrap} onPress={()=>setShowDate(false)}>
                  <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.confirmBtn}>
                    <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon}/>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* time modal */}
        {showTime && (
          <Modal transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker mode="time" display="spinner" value={openDate}
                    onChange={(_,d)=>{
                      if(!d) return;
                      const n=new Date(openDate);
                      n.setHours(d.getHours(),d.getMinutes());
                      setOpenDate(n);
                    }}
                    style={{backgroundColor:'#fff'}}/>
                </View>
                <TouchableOpacity style={styles.confirmWrap} onPress={()=>setShowTime(false)}>
                  <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.confirmBtn}>
                    <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon}/>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    );
  }

  /* ───────── CONFIRM ───────── */
  if(stage==='confirm'){
    return(
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>setStage('form')} style={styles.backHit}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon}/>
          </TouchableOpacity>
          <Text style={styles.hTitle}>CONFIRMATION</Text>
        </View>

        <ScrollView contentContainerStyle={{padding:18}}>
          <View style={styles.detailCard}>
            <Image source={{uri:draft.photo}} style={styles.detailImg}/>
            <Text style={[styles.cardTtl,{marginTop:16}]}>{draft.title}</Text>
            <Text style={[styles.meta,{marginTop:12}]}>{draft.text}</Text>
            <Text style={[styles.meta,{marginTop:20}]}>Creation date: <Text style={styles.metaVal}>{new Date(draft.createAt).toLocaleDateString()}</Text></Text>
            <Text style={styles.meta}>Opening date: <Text style={styles.metaVal}>{new Date(draft.openAt).toLocaleString()}</Text></Text>
            <GButton title="Close the capsule" style={{marginTop:28}}
              onPress={()=>{ add(draft); toast('The time capsule was created'); setStage('list'); }}/>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ───────── LOCKED ───────── */
  if(stage==='locked'){
    return(
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>setStage('list')} style={styles.backHit}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon}/>
          </TouchableOpacity>
          <Text style={styles.hTitle}>TIME CAPSULE</Text>
        </View>

        <ScrollView contentContainerStyle={{padding:18}}>
          <View style={styles.detailCard}>
            {/* lock centred */}
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.detailImg,{alignItems:'center',justifyContent:'center'}]}>
              <Image source={require('../assets/ic_lock_closed.png')} style={styles.bigLock}/>
            </LinearGradient>

            <Text style={[styles.cardTtl,{marginTop:16}]}>{draft.title}</Text>
            <Text style={styles.meta}>Opening date: <Text style={styles.metaVal}>{new Date(draft.openAt).toLocaleString()}</Text></Text>
            <Text style={styles.meta}>Creation date: <Text style={styles.metaVal}>{new Date(draft.createAt).toLocaleDateString()}</Text></Text>

            <View style={styles.timerBox}>
              <Text style={styles.timerLbl}>THE CAPSULE IS STILL CLOSED</Text>
              <GradientText style={styles.timerLarge}>{dd} : {hh} : {mm}</GradientText>
              <View style={styles.rowLabels}>
                <Text style={styles.rowLbl}>Day</Text>
                <Text style={styles.rowLbl}>Hours</Text>
                <Text style={styles.rowLbl}>Minutes</Text>
              </View>
            </View>

            <View style={styles.rowCenter}>
            <TouchableOpacity onPress={()=>shareCapsule(draft)}>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.circleSmall}>
                  <Image source={require('../assets/ic_share.png')} style={styles.actionIcon}/>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setStage('delete')}>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.circleSmall}>
                  <Image source={require('../assets/ic_delete.png')} style={styles.actionIcon}/>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ───────── VIEW ───────── */
  if(stage==='view'){
    return(
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=>setStage('list')} style={styles.backHit}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon}/>
          </TouchableOpacity>
          <Text style={styles.hTitle}>TIME CAPSULE</Text>
        </View>

        <ScrollView contentContainerStyle={{padding:18}}>
          <View style={styles.detailCard}>
            <Image source={{uri:draft.photo}} style={styles.detailImg}/>
            <Text style={[styles.cardTtl,{marginTop:16}]}>{draft.title}</Text>
            <Text style={[styles.meta,{marginTop:12}]}>{draft.text}</Text>
            <Text style={styles.meta}>Opened: <Text style={styles.metaVal}>{new Date(draft.openAt).toLocaleString()}</Text></Text>
            <View style={styles.rowCenter}>
            <TouchableOpacity onPress={()=>shareCapsule(draft)}>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.circleSmall}>
                  <Image source={require('../assets/ic_share.png')} style={styles.actionIcon}/>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setStage('delete')}>
                <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.circleSmall}>
                  <Image source={require('../assets/ic_delete.png')} style={styles.actionIcon}/>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          
        </ScrollView>
      </View>
    );
  }

  /* ───────── DELETE confirm ───────── */
  if(stage==='delete'){
    return(
      <Modal transparent animationType="fade">
        <View style={styles.dim}>
          <View style={styles.delBox}>
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.delCircle}>
              <Text style={styles.delMark}>!</Text>
            </LinearGradient>
            <GradientText style={styles.delTitle}>Delete time capsule?</GradientText>
            <Text style={styles.delSub}>Are you sure you want to delete the capsule?</Text>

            <GButton title="Yes" style={{marginTop:26}}
            onPress={()=>{
                   remove(draft.id);
                   toast('Time capsule deleted', require('../assets/ic_confirm.png'));
                   setStage('list');
                 }}/>
            <Text style={styles.noTxt} onPress={()=>setStage('list')}>No</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:'#000'},

  header:{flexDirection:'row',alignItems:'center',paddingTop:Platform.OS==='ios'?44:20,paddingHorizontal:18,marginBottom:12},
  backHit:{padding:4,marginRight:6},
  backIcon:{width:30,height:30,tintColor:'#C19237'},
  hTitle:{flex:1,color:'#fff',fontSize:22,fontWeight:'700'},

  addCircle:{width:66,height:66,borderRadius:33,alignItems:'center',justifyContent:'center'},
  addPlus:{fontSize:40,color:'#000',lineHeight:44},

  card:{backgroundColor:'#181818',borderRadius:12,marginBottom:18,overflow:'hidden'},
  preview:{width:'100%',height:130,alignItems:'center',justifyContent:'center'},
  lockIcon:{width:40,height:40,tintColor:'#1C1C1C'},

  infoBlock:{padding:14},
  cardTtl:{color:'#fff',fontSize:18,fontWeight:'600',marginBottom:6},
  meta:{color:'#bbb',fontSize:13,marginTop:2},
  metaVal:{color:'#fff'},

  btnWrap:{alignSelf:'center'},
  btnGrad:{height:56,borderRadius:28,alignItems:'center',justifyContent:'center',paddingHorizontal:32},
  btnTxt:{color:'#000',fontSize:17,fontWeight:'600'},

  toast:{position:'absolute',left:18,right:18,backgroundColor:'#1A1A1A',borderRadius:12,padding:14,flexDirection:'row',alignItems:'center'},
  toastCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  toastTxt:{color:'#fff',flex:1},

  label:{color:'#fff',fontSize:16,marginTop:18,marginBottom:6},
  input:{borderWidth:1,borderColor:'#333',borderRadius:10,height:48,paddingHorizontal:12,color:'#fff'},
  photoBox:{height:160,borderWidth:1,borderColor:'#333',borderRadius:10,alignItems:'center',justifyContent:'center',marginTop:18},
  photoIcon:{width:48,height:48,tintColor:'#C19237',marginBottom:8},
  photoTxt:{color:'#777'},
  photoImg:{width:'100%',height:'100%',borderRadius:10},

  descBox:{borderWidth:1,borderColor:'#333',borderRadius:10,minHeight:120,padding:12,marginTop:18,textAlignVertical:'top',color:'#fff'},

  row:{flexDirection:'row',marginTop:18},
  dateBtn:{flex:1,height:48,borderWidth:1,borderColor:'#333',borderRadius:10,flexDirection:'row',alignItems:'center',paddingHorizontal:12},
  dateTxt:{color:'#fff',flex:1},
  dateIcon:{width:22,height:22,tintColor:'#C19237'},

  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'},
  modalContent:{backgroundColor:'#000',borderRadius:12,padding:16,alignItems:'center'},
  pickerContainer:{width:300,borderRadius:12,overflow:'hidden',backgroundColor:'#fff'},
  confirmWrap:{marginTop:12},
  confirmBtn:{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center'},
  confirmIcon:{width:32,height:32,tintColor:'#000'},

  detailCard:{backgroundColor:'#1A1A1A',borderRadius:12,padding:18,overflow:'hidden'},
  detailImg:{width:'100%',height:220},
  bigLock:{width:64,height:64,tintColor:'#1C1C1C'},

  timerBox:{borderWidth:1,borderColor:'#333',borderRadius:10,padding:20,marginTop:24,alignItems:'center'},
  timerLbl:{color:'#bbb',marginBottom:14},
  timerLarge:{fontSize:34,fontWeight:'700'},
  rowLabels:{flexDirection:'row',justifyContent:'space-evenly',width:'100%',marginTop:4},
  rowLbl:{color:'#bbb',width:80,textAlign:'center'},

  rowCenter:{flexDirection:'row',justifyContent:'space-evenly',marginTop:26,width:'100%'},
  circleSmall:{width:86,height:86,borderRadius:43,alignItems:'center',justifyContent:'center'},
  actionIcon:{width:32,height:32,tintColor:'#000'},

  dim:{flex:1,backgroundColor:'#0C0C0C',alignItems:'center',justifyContent:'center' , },
  delBox:{width:'80%',backgroundColor:'#1A1A1A',borderRadius:12,alignItems:'center',padding:24},
  delCircle:{width:100,height:100,borderRadius:50,alignItems:'center',justifyContent:'center'},
  delMark:{fontSize:40,color:'#000'},
  delTitle:{fontSize:20,fontWeight:'700',marginTop:24,textAlign:'center'},
  delSub:{color:'#bbb',textAlign:'center',marginTop:12},
  noTxt:{color:'#bbb',marginTop:20},
});
