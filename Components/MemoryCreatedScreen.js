// Components/MemoryCreatedScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function MemoryCreatedScreen({ navigation }) {
  return (
    <View style={t.root}>
      <LinearGradient
        colors={['#FEFBE9','#DDBB78','#C19237']}
        start={{x:0,y:0}}
        end={{x:1,y:0}}
        style={t.iconWrap}
      >
        <Image
          source={require('../assets/ic_confirm.png')}
          style={t.doneIcon}
        />
      </LinearGradient>

      <Text style={t.message}>Your memory is created!</Text>

      <TouchableOpacity
        style={t.homeWrap}
        onPress={() => navigation.replace('HomeMain')}
      >
        <LinearGradient
          colors={['#FEFBE9','#DDBB78','#C19237']}
          start={{x:0,y:0}}
          end={{x:1,y:0}}
          style={t.homeBtn}
        >
          <Image
            source={require('../assets/ic_home.png')}
            style={t.homeIcon}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const t = StyleSheet.create({
  root: { flex:1, backgroundColor:'#000', justifyContent:'center', alignItems:'center' },
  iconWrap: {
    width:120, height:120,
    borderRadius:60,
    alignItems:'center',
    justifyContent:'center',
    marginBottom:24,
  },
  doneIcon: { width:48, height:48, tintColor:'#000' },
  message: {
    color:'#fff', fontSize:20, fontWeight:'600', marginBottom:32
  },
  homeWrap:{},
  homeBtn:{
    width:64, height:64,
    borderRadius:32,
    alignItems:'center',
    justifyContent:'center'
  },
  homeIcon:{ width:28, height:28, tintColor:'#000' },
});
