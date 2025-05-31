// ─────────────────────────────────────────────────────────────
//  Components/ArchiveScreen.js
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView as RNScroll,
  Modal,
  Share,
} from 'react-native';
import LinearGradient         from 'react-native-linear-gradient';
import DateTimePicker         from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useMemories }        from '../Components/MemoriesContext';

const GRAD = {
  colors: ['#FEFBE9', '#DDBB78', '#C19237'],
  start:  { x: 0, y: 0 },
  end:    { x: 1, y: 0 },
};

export default function ArchiveScreen({ navigation }) {
  /* ─────────── источники данных и поиск ─────────── */
  const { list, remove, update } = useMemories();
  const [q, setQ]               = useState('');
  const [filtered, setFiltered] = useState(list);

  /* выбранная карточка / режимы */
  const [selected, setSelected]   = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  /* форма редактирования */
  const [title, setTitle] = useState('');
  const [desc,  setDesc ] = useState('');
  const [photo, setPhoto] = useState('');
  const [date,  setDate ] = useState(new Date());

  /* модальные окна */
  const [showDateModal,   setShowDateModal]   = useState(false);
  const [showTimeModal,   setShowTimeModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* вспомогательные состояния */
  const deleteIdRef  = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* toast-уведомление */
  const toastY = useRef(new Animated.Value(-100)).current;
  const fireToast = () => {
    Animated.spring(toastY, { toValue: Platform.OS === 'ios' ? 44 : 18, useNativeDriver: true }).start();
    setTimeout(() => Animated.timing(toastY, { toValue: -100, duration: 300, useNativeDriver: true }).start(), 1800);
  };

  /* фильтрация списка */
  useEffect(() => {
    setFiltered(
      list.filter(
        m =>
          m.title.toLowerCase().includes(q.toLowerCase()) ||
          m.desc .toLowerCase().includes(q.toLowerCase()),
      ),
    );
  }, [q, list]);

  /* открыть модал удаления */
  const openDeleteModal = (id) => {
    deleteIdRef.current = id;
    setShowDeleteModal(true);
  };

  /* подтвердить удаление */
  const handleDelete = () => {
    const id = deleteIdRef.current;
    if (id) {
      remove(id);
      setSelected(null);
      fireToast();
    }
    setShowDeleteModal(false);
  };

  /* выбрать фото */
  const pickPhoto = () =>
    launchImageLibrary({ mediaType: 'photo' }, r => {
      if (!r.didCancel && r.assets?.[0]?.uri) setPhoto(r.assets[0].uri);
    });

  /* активный Share */
  const shareMemory = async () => {
    try {
      await Share.share({
        title: selected.title,
        message:
          `${selected.title}\n\n${selected.desc || ''}\n\n${selected.dateStr} / ${selected.timeStr}`,
        url: selected.photo,
      });
    } catch { /* ignore */ }
  };

  /* сохранить изменения */
  const saveEdits = () => {
    if (!title || !photo) { alert('Fill in name and pick a photo.'); return; }

    update({
      ...selected,
      title,
      desc,
      photo,
      dateStr: date.toLocaleDateString(),
      timeStr: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ts: date.getTime(),
    });

    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); setSelected(null); }, 1500);
  };

  /* заполняем форму при входе в edit */
  useEffect(() => {
    if (isEditing && selected) {
      setTitle(selected.title);
      setDesc (selected.desc);
      setPhoto(selected.photo);
      setDate (new Date(selected.ts));
    }
  }, [isEditing, selected]);

  /* ─────────── success overlay ─────────── */
  if (showSuccess) {
    return (
      <View style={styles.root}>
        <View style={styles.successWrap}>
          <LinearGradient {...GRAD} style={styles.successCircle}>
            <Image source={require('../assets/ic_confirm.png')} style={styles.successIcon} />
          </LinearGradient>
          <Text style={styles.successTxt}>The changes were{'\n'}made successfully!</Text>
        </View>
      </View>
    );
  }

  /* ─────────── рендер карточки ─────────── */
  const renderCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress   ={() => { setSelected(item); setIsEditing(false); }}
      onLongPress={() => openDeleteModal(item.id)}
      style={styles.card}
    >
      <Image source={{ uri: item.photo }} style={styles.img} />
      <TouchableOpacity style={styles.dailyBadge} onPress={() => update({ ...item, isDaily: !item.isDaily })}>
        <Image source={require('../assets/ic_sun.png')} style={[styles.dailyIcon, item.isDaily && { tintColor: '#F8DE8C' }]} />
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.dateStr} / {item.timeStr}</Text>
        {!!item.desc && <Text style={styles.desc}>{item.desc}</Text>}
      </View>
    </TouchableOpacity>
  );

  /* ─────────── DETAIL VIEW ─────────── */
  if (selected && !isEditing) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
            <Image source={require('../assets/ic_back.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selected.title.toUpperCase()}</Text>
        </View>

        <RNScroll contentContainerStyle={styles.scrollArea}>
          <View style={styles.detailCard}>
            <Image source={{ uri: selected.photo }} style={[styles.img, { height: 200 }]} />
            <View style={styles.detailBody}>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <Text style={styles.detailDate}>{selected.dateStr} / {selected.timeStr}</Text>
              <Text style={styles.detailDesc}>{selected.desc || 'No description.'}</Text>

              <View style={styles.detailActions}>
                <TouchableOpacity style={styles.bigBtn} onPress={() => setIsEditing(true)}>
                  <LinearGradient {...GRAD} style={styles.bigGradient}>
                    <Text style={styles.bigText}>Edit content</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={shareMemory}>
                  <LinearGradient {...GRAD} style={styles.share}>
                    <Image source={require('../assets/ic_share.png')} style={styles.shareIcon} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </RNScroll>

        <Animated.View style={[styles.toast, { transform: [{ translateY: toastY }] }]}>
          <Image source={require('../assets/ic_alert.png')} style={styles.toastIcon} />
          <Text style={styles.toastText}>The memory was deleted</Text>
        </Animated.View>

        {/* Delete modal */}
        <Modal transparent visible={showDeleteModal} animationType="fade">
          <View style={styles.deleteOverlay}>
            <View style={styles.deleteBox}>
              <LinearGradient {...GRAD} style={styles.deleteCircle}>
                <Image source={require('../assets/ic_alert.png')} style={styles.deleteExIcon} />
              </LinearGradient>
              <Text style={styles.deleteTitle}>Delete memories</Text>
              <Text style={styles.deleteMsg}>Are you sure you want to{'\n'}delete the memory?</Text>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteYesWrap}>
                <LinearGradient {...GRAD} style={styles.deleteYesBtn}>
                  <Text style={styles.deleteYesTxt}>Yes</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.deleteNoTxt}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  /* ─────────── EDIT VIEW ─────────── */
  if (selected && isEditing) {
    return (
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <RNScroll contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.backBtn}>
              <Image source={require('../assets/ic_back.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EDIT</Text>
          </View>

          <Text style={styles.label}>Name a memory:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder=""
            placeholderTextColor="#666"
          />

          <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <Image source={require('../assets/ic_add_photo.png')} style={styles.addPhotoIcon} />
            )}
            {!photo && <Text style={styles.photoHint}>Replace photo</Text>}
          </TouchableOpacity>

          <TextInput
            style={styles.descBox}
            multiline
            value={desc}
            onChangeText={setDesc}
            placeholder="Description..."
            placeholderTextColor="#666"
          />

          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDateModal(true)}>
              <Text style={styles.pickerTxt}>{date.toLocaleDateString()}</Text>
              <Image source={require('../assets/ic_calendar.png')} style={styles.pickerIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimeModal(true)}>
              <Text style={styles.pickerTxt}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Image source={require('../assets/ic_clock.png')} style={styles.pickerIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.saveWrap, !(title && photo) && { opacity: 0.5 }]}
              disabled={!(title && photo)}
              onPress={saveEdits}
            >
              <LinearGradient {...GRAD} style={styles.saveBtn}>
                <Text style={styles.saveTxt}>Save changes</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ic_delete --> сразу модал */}
            <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => openDeleteModal(selected.id)}>
              <LinearGradient {...GRAD} style={styles.smallDeleteBtn}>
                <Image source={require('../assets/ic_delete.png')} style={styles.smallDeleteIcon} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </RNScroll>

        {/* Date / Time pickers */}
        <Modal transparent visible={showDateModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerContainer}>
                <DateTimePicker mode="date" display="spinner" value={date} onChange={(_, d) => d && setDate(d)} style={{ backgroundColor: '#fff' }} />
              </View>
              <TouchableOpacity style={styles.confirmWrap} onPress={() => setShowDateModal(false)}>
                <LinearGradient {...GRAD} style={styles.confirmBtn}>
                  <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal transparent visible={showTimeModal} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.pickerContainer}>
                <DateTimePicker mode="time" display="spinner" value={date} onChange={(_, d) => d && setDate(d)} style={{ backgroundColor: '#fff' }} />
              </View>
              <TouchableOpacity style={styles.confirmWrap} onPress={() => setShowTimeModal(false)}>
                <LinearGradient {...GRAD} style={styles.confirmBtn}>
                  <Image source={require('../assets/ic_confirm.png')} style={styles.confirmIcon} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* такой же delete-modal для edit */}
        <Modal transparent visible={showDeleteModal} animationType="fade">
          <View style={styles.deleteOverlay}>
            <View style={styles.deleteBox}>
              <LinearGradient {...GRAD} style={styles.deleteCircle}>
                <Image source={require('../assets/ic_alert.png')} style={styles.deleteExIcon} />
              </LinearGradient>
              <Text style={styles.deleteTitle}>Delete memories</Text>
              <Text style={styles.deleteMsg}>Are you sure you want to{'\n'}delete the memory?</Text>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteYesWrap}>
                <LinearGradient {...GRAD} style={styles.deleteYesBtn}>
                  <Text style={styles.deleteYesTxt}>Yes</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.deleteNoTxt}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  /* ─────────── LIST VIEW ─────────── */
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/ic_back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ARCHIVE OF MEMORIES</Text>
      </View>

      <View style={styles.searchWrap}>
        <Image source={require('../assets/ic_search.png')} style={styles.searchIcon} />
        <TextInput
          style={styles.search}
          placeholder="Search"
          placeholderTextColor="#666"
          value={q}
          onChangeText={setQ}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        renderItem={renderCard}
        contentContainerStyle={{ padding: 18, paddingBottom: 120 }}
      />
    </View>
  );
}

/* ─────────────────────────── styles ─────────────────────────── */
const styles = StyleSheet.create({
  root:{ flex: 1, backgroundColor: '#000' },

  /* success overlay */
  successWrap:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
  successCircle:{ width: 220, height: 220, borderRadius: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  successIcon:{ width: 96, height: 96, tintColor: '#473300' },
  successTxt:{ color: '#fff', fontSize: 24, fontWeight: '600', lineHeight: 34, textAlign: 'center' },

  /* header */
  header:{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: Platform.OS === 'ios' ? 44 : 18, paddingBottom: 12 },
  backBtn:{ padding: 4 },
  

  backIcon: { width: 35, height: 35, tintColor: '#F8DE8C' },


  headerTitle:{ flex: 1, textAlign: 'center', color: '#fff', fontSize: 23, fontWeight: '600' , marginRight: 20, },

  /* search */
  searchWrap:{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 12, borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, height: 46 },
  searchIcon:{ width: 20, height: 20, tintColor: '#666', marginRight: 8 },
  search:{ flex: 1, color: '#fff' },

  /* list card */
  card:{ backgroundColor: '#1C1C1C', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  img:{ width: '100%', height: 120 },
  dailyBadge:{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  dailyIcon:{ width: 18, height: 18, tintColor: '#fff' },
  body:{ padding: 12 },
  title:{ color: '#fff', fontSize: 18, fontWeight: '600' },
  date:{ color: '#bbb', fontSize: 12, marginVertical: 4 },
  desc:{ color: '#ddd' },

  /* detail */
  scrollArea:{ padding: 18, paddingBottom: 120 },
  detailCard:{ backgroundColor: '#1C1C1C', borderRadius: 12, overflow: 'hidden' },
  detailBody:{ padding: 12 },
  detailTitle:{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  detailDate:{ color: '#bbb', fontSize: 12, marginBottom: 12 },
  detailDesc:{ color: '#ddd', lineHeight: 20 },
  detailActions:{ flexDirection: 'row', marginTop: 24 },

  bigBtn:{ flex: 1, marginRight: 12, borderRadius: 28, overflow: 'hidden' },
  bigGradient:{ paddingVertical: 14, alignItems: 'center', borderRadius: 28 },
  bigText:{ color: '#000', fontSize: 17, fontWeight: '600' },

  share:{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  shareIcon:{ width: 24, height: 24, tintColor: '#000' },

  /* edit form */
  container:{ padding: 18, paddingBottom: 100 },
  label:{ color: '#fff', marginBottom: 6 },
  input:{ borderWidth: 1, borderColor: '#333', borderRadius: 12, height: 40, paddingHorizontal: 12, color: '#fff' },

  photoBox:{ height: 200, borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginTop: 16, alignItems: 'center', justifyContent: 'center' },
  photoPreview:{ width: '100%', height: '100%' },
  addPhotoIcon:{ width: 56, height: 56, tintColor: '#F8DE8C' },
  photoHint:{ color: '#fff', marginTop: 8 },

  descBox:{ borderWidth: 1, borderColor: '#333', borderRadius: 12, minHeight: 90, padding: 12, marginTop: 16, color: '#fff' },

  pickerRow:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  pickerBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, height: 48, marginHorizontal: 4 },
  pickerTxt:{ color: '#fff', flex: 1 },
  pickerIcon:{ width: 20, height: 20, tintColor: '#F8DE8C' },

  actionRow:{ flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  saveWrap:{ flex: 1, borderRadius: 28, overflow: 'hidden' },
  saveBtn:{ paddingVertical: 14, alignItems: 'center', borderRadius: 28 },
  saveTxt:{ color: '#473300', fontSize: 17, fontWeight: '600' },

  smallDeleteBtn:{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  smallDeleteIcon:{ width: 24, height: 24, tintColor: '#473300' },

  /* date / time picker modals */
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent:{ backgroundColor: '#000', borderRadius: 12, padding: 16, alignItems: 'center' },
  pickerContainer:{ width: 300, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  confirmWrap:{ marginTop: 12 },
  confirmBtn:{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  confirmIcon:{ width: 32, height: 32, tintColor: '#000' },

  /* delete modal */
  deleteOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  deleteBox:{ width: '100%', maxWidth: 340, backgroundColor: '#1C1C1C', borderRadius: 12, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 18 },
  deleteCircle:{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  deleteExIcon:{ width: 42, height: 42, tintColor: '#473300' },
  deleteTitle:{ color: '#fff', fontSize: 24, fontWeight: '600', marginBottom: 12 },
  deleteMsg:{ color: '#ddd', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  deleteYesWrap:{ alignSelf: 'stretch', marginBottom: 16 },
  deleteYesBtn:{ height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  deleteYesTxt:{ color: '#473300', fontSize: 22, fontWeight: '600' },
  deleteNoTxt:{ color: '#fff', fontSize: 18 },

  /* toast */
  toast:{ position: 'absolute', left: 18, right: 18, backgroundColor: '#111', borderRadius: 12, padding: 12, alignItems: 'center', flexDirection: 'row' },
  toastIcon:{ width: 24, height: 24, marginRight: 12 },
  toastText:{ color: '#fff', fontSize: 14 },
});
