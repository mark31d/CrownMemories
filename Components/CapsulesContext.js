import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@cm_capsules';
const Ctx = createContext();
export const useCapsules = () => useContext(Ctx);

export default function CapsulesProvider({ children }) {
  const [caps, setCaps] = useState([]);
  useEffect(() => { AsyncStorage.getItem(KEY).then(r => r && setCaps(JSON.parse(r))); }, []);
  useEffect(() => { AsyncStorage.setItem(KEY, JSON.stringify(caps)); }, [caps]);
  const add  = c  => setCaps([c, ...caps]);
  const open = id => setCaps(caps.map(c => c.id === id ? { ...c, opened: true } : c));
  const remove = id => setCaps(prev => prev.filter(c => c.id !== id));
  return <Ctx.Provider value={{ caps, add, open, remove }}>{children}</Ctx.Provider>;
}
