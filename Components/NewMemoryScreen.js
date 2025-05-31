// Components/NewMemoryScreen.js
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useMemories } from '../Components/MemoriesContext';

export default function NewMemoryScreen({ navigation }) {
  const { add } = useMemories();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const pickPhoto = () =>
    launchImageLibrary({ mediaType: 'photo' }, (r) => {
      if (r.didCancel) return;
      r.assets?.[0]?.uri && setPhoto(r.assets[0].uri);
    });

  const save = () => {
    if (!title || !photo) {
      return Alert.alert('Fill in name and pick a photo.');
    }
    add({
      id: `${Date.now()}`,
      title,
      desc,
      photo,
      dateStr: date.toLocaleDateString(),
      timeStr: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ts: date.getTime(),
    });
    navigation.replace('MemoryCreated');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.heading}>A NEW MEMORY</Text>
        </View>

        {/* Name */}
        <Text style={styles.label}>Name a memory:</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        {/* Photo picker */}
        <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <Image source={require('../assets/ic_add_photo.png')} style={styles.photoIcon} />
          )}
        </TouchableOpacity>

        {/* Description */}
        <TextInput
          style={styles.descBox}
          multiline
          placeholder="Description of the memory..."
          placeholderTextColor="#666"
          value={desc}
          onChangeText={setDesc}
        />

        {/* Date / Time row */}
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.pickerTxt}>{date.toLocaleDateString()}</Text>
            <Image source={require('../assets/ic_calendar.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowTimeModal(true)}
          >
            <Text style={styles.pickerTxt}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Image source={require('../assets/ic_clock.png')} style={styles.pickerIcon} />
          </TouchableOpacity>
        </View>

        {/* Create button */}
        <TouchableOpacity
          style={[styles.createWrap, !(title && photo) && { opacity: 0.5 }]}
          disabled={!(title && photo)}
          onPress={save}
        >
          <LinearGradient
            colors={['#FEFBE9', '#DDBB78', '#C19237']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createBtn}
          >
            <Text style={styles.createTxt}>Create memories</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal transparent visible={showDateModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                mode="date"
                display="spinner"
                value={date}
                onChange={(_, d) => d && setDate(d)}
                style={{ backgroundColor: '#fff' }}
              />
            </View>
            <TouchableOpacity
              style={styles.confirmWrap}
              onPress={() => setShowDateModal(false)}
            >
              <LinearGradient
                colors={['#FEFBE9', '#DDBB78', '#C19237']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal transparent visible={showTimeModal} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                mode="time"
                display="spinner"
                value={date}
                onChange={(_, d) => d && setDate(d)}
                style={{ backgroundColor: '#fff' }}
              />
            </View>
            <TouchableOpacity
              style={styles.confirmWrap}
              onPress={() => setShowTimeModal(false)}
            >
              <LinearGradient
                colors={['#FEFBE9', '#DDBB78', '#C19237']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  container: { padding: 18 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 30 : 18,
    marginBottom: 15,
  },
  back: { padding: 4 },
  backIcon: { width: 35, height: 35, tintColor: '#F8DE8C' },
  heading: {
    flex: 1,
    color: '#fff',
    fontSize: 23,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 28,
  },

  /* Form fields */
  label: { color: '#fff', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    color: '#fff',
  },
  photoBox: {
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  photoIcon: { width: 40, height: 40, tintColor: '#666' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 8 },

  descBox: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    height: 90,
    padding: 12,
    marginTop: 16,
    color: '#fff',
  },

  /* Picker row */
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 4,
  },
  pickerTxt: { color: '#fff', flex: 1 },
  pickerIcon: { width: 20, height: 20, tintColor: '#F8DE8C' },

  /* Create button */
  createWrap: { marginTop: 24, alignItems: 'center' },
  createBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTxt: { color: '#000', fontSize: 17, fontWeight: '600' },

  /* Picker modal overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pickerContainer: {
    width: 300,         // adjust as needed
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  confirmWrap: { marginTop: 12 },
  confirmBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmIcon: { width: 32, height: 32, tintColor: '#000' },
});
