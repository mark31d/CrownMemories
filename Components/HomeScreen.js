// Components/HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMemories } from '../Components/MemoriesContext';

export default function HomeScreen({ navigation }) {
  const { list } = useMemories();

  const MenuBtn = ({ icon, label, to }) => (
    <TouchableOpacity
      style={styles.cardWrap}
      activeOpacity={0.85}
      onPress={() => navigation.navigate(to)}
    >
      <LinearGradient
        colors={['#FEFBE9', '#DDBB78', '#C19237']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <Image source={icon} style={styles.icon} />
        <Text style={styles.cardText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleExit = () => {
    // closes the app on Android; no-op on iOS
    BackHandler.exitApp();
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.exit} onPress={handleExit}>
        <Text style={styles.exitText}>Exit</Text>
      </TouchableOpacity>

      <Image
        source={require('../assets/logo_crown.png')}
        style={styles.logo}
      />

      <View style={styles.menu}>
        <MenuBtn
          icon={require('../assets/icon_add.png')}
          label="Create new memories"
          to="NewMemory"
        />
        <MenuBtn
          icon={require('../assets/icon_archive.png')}
          label="Archive of memories"
          to="Archive"
        />
        <MenuBtn
          icon={require('../assets/icon_task.png')}
          label="Task of the day"
          to="Task"
        />
        <MenuBtn
          icon={require('../assets/icon_capsule.png')}
          label="Time capsule"
          to="Capsule"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 60,
  },
  exit: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  exitText: {
    color: '#FDF5D5',
    fontSize: 16,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: -20,
    marginBottom: -20,
  },
  menu: {
    width: '90%',
    alignItems: 'center',
  },
  cardWrap: {
    width: '100%',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 8,
    tintColor: '#000',
  },
  cardText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});
