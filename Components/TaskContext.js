import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@cm_task';
const Ctx = createContext();
export const useTask = () => useContext(Ctx);

export default function TaskProvider({ children }) {
  const [state, setState] = useState({ date: '', status: 'idle' }); // idle|running|done|timeout
  useEffect(() => { AsyncStorage.getItem(KEY).then(r => r && setState(JSON.parse(r))); }, []);
  useEffect(() => { AsyncStorage.setItem(KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.date !== today) setState({ date: today, status: 'idle' });
  }, [state.date]);
  return <Ctx.Provider value={{ state, setState }}>{children}</Ctx.Provider>;
}
