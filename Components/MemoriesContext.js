// Components/MemoriesContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@cm_memories';
const Ctx = createContext();
export const useMemories = () => useContext(Ctx);

export default function MemoriesProvider({ children }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(r => r && setList(JSON.parse(r)));
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(list));
  }, [list]);

  const add    = m => setList([m, ...list]);
  const remove = id => setList(list.filter(i => i.id !== id));
  const update = updated =>
    setList(list.map(i => (i.id === updated.id ? updated : i)));

  return (
    <Ctx.Provider value={{ list, add, remove, update }}>
      {children}
    </Ctx.Provider>
  );
}
