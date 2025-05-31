import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientButton from '../Components/GradientButton';
import { useMemories } from '../Components/MemoriesContext';

export default function NewMemory({ navigation }) {
  const { addMemory } = useMemories();
  const [title, setTitle] = useState('');
  const [desc , setDesc ] = useState('');
  const [photo, setPhoto] = useState(null);
  const [date , setDate ] = useState(new Date());
  const [showDate, setShowDate]   = useState(false);
  const [showTime, setShowTime]   = useState(false);

  const onSave = () => {
    addMemory({ id: Date.now().toString(), title, desc, photo, date });
    navigation.replace('SuccessMemory');
  };

  return (
    <View style={s.root}>
      <Text style={s.h1}>A NEW MEMORY</Text>

      <Text style={s.label}>Name a memory:</Text>
      <TextInput
        placeholder=""
        placeholderTextColor="#666"
        style={s.input}
        value={title} onChangeText={setTitle}
      />

      <TouchableOpacity style={s.photo}>
        <Image
          source={photo ? { uri: photo } : require('../assets/add_photo.png')}
          style={photo ? s.photoImg : s.photoIcon}
        />
        {!photo && <Text style={s.addTxt}>Add photo</Text>}
      </TouchableOpacity>

      <TextInput
        placeholder="Description of the memory…."
        placeholderTextColor="#666"
        style={[s.input, { height: 120 }]}
        multiline
        value={desc} onChangeText={setDesc}
      />

      {/* дата / время */}
      <View style={s.row}>
        <TouchableOpacity style={s.cell} onPress={() => setShowDate(true)}>
          <Text style={s.cellTxt}>{date.toLocaleDateString()}</Text>
          <Image source={require('../assets/ic_date.png')} style={s.cellIc} />
        </TouchableOpacity>
        <TouchableOpacity style={s.cell} onPress={() => setShowTime(true)}>
          <Text style={s.cellTxt}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <Image source={require('../assets/ic_time.png')} style={s.cellIc} />
        </TouchableOpacity>
      </View>

      {showDate && (
        <DateTimePicker
          value={date} mode="date" display="spinner"
          textColor="#000" // iOS only
          onChange={(_, d) => { setShowDate(false); d && setDate(d); }}
        />
      )}
      {showTime && (
        <DateTimePicker
          value={date} mode="time" display="spinner"
          onChange={(_, d) => { setShowTime(false); d && setDate(d); }}
        />
      )}

      <GradientButton title="Create memories" style={s.saveBtn} onPress={onSave} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', padding: 20 },
  h1  : { color: '#fff', fontSize: 24, fontWeight: '700', alignSelf: 'center', marginBottom: 32 },
  label: { color: '#fff', marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#333', borderRadius: 8,
    color: '#fff', paddingHorizontal: 12, marginBottom: 18, height: 48,
  },
  photo: {
    height: 160, borderRadius: 8, backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  photoIcon: { width: 48, height: 48, resizeMode: 'contain', tintColor: '#BB8B17' },
  addTxt: { color: '#888', marginTop: 6 },
  photoImg: { ...StyleSheet.absoluteFillObject, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  cell: {
    width: '48%', height: 48, borderWidth: 1, borderColor: '#333',
    borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  cellTxt: { color: '#fff' },
  cellIc : { width: 18, height: 18, tintColor: '#BB8B17' },
  saveBtn: { marginTop: 'auto' },
});
