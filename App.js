import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* screens */
import Loader from './Components/Loader';
import Onboarding from './Components/Onboarding';
import HomeScreen from './Components/HomeScreen';
import ArchiveScreen from './Components/ArchiveScreen';
import TaskScreen from './Components/TaskScreen';
import CapsuleScreen from './Components/CapsuleScreen';
import NewMemoryScreen from './Components/NewMemoryScreen';
import MemoryCreatedScreen from './Components/MemoryCreatedScreen';

/* contexts */
import MemoriesProvider from './Components/MemoriesContext';
import CapsulesProvider from './Components/CapsulesContext';
import TaskProvider from './Components/TaskContext';

const RootStack = createNativeStackNavigator();

export default function App() {
  const [bootDone, setBootDone] = useState(false);
  const [seenOnboard, setSeenOnboard] = useState(false);

  useEffect(() => {
    (async () => {
      const flag = await AsyncStorage.getItem('@cm_seen_onboard');
      setSeenOnboard(flag === '1');
      setTimeout(() => setBootDone(true), 1800);
    })();
  }, []);

  if (!bootDone) return <Loader />;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!seenOnboard && (
            <RootStack.Screen
              name="Onboarding"
              component={Onboarding}
            />
          )}

          <RootStack.Screen name="Home">
            {() => (
              <MemoriesProvider>
                <CapsulesProvider>
                  <TaskProvider>
                    <RootStack.Navigator screenOptions={{ headerShown: false }}>
                      <RootStack.Screen
                        name="HomeMain"
                        component={HomeScreen}
                      />
                      <RootStack.Screen
                        name="Archive"
                        component={ArchiveScreen}
                      />
                      <RootStack.Screen
                        name="Task"
                        component={TaskScreen}
                      />
                      <RootStack.Screen
                        name="Capsule"
                        component={CapsuleScreen}
                      />
                      <RootStack.Screen
                        name="NewMemory"
                        component={NewMemoryScreen}
                      />
                      <RootStack.Screen
                        name="MemoryCreated"
                        component={MemoryCreatedScreen}
                      />
                    </RootStack.Navigator>
                  </TaskProvider>
                </CapsulesProvider>
              </MemoriesProvider>
            )}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});