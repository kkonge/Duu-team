// context/FamilyContext.js (JS)
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "FAMILY_USERS_V1";
const FamilyContext = createContext(null);

export function FamilyProvider({ children }) {
  const [users, setUsers] = useState({});        // { [id]: { id, nickname, username?, photoUri? } }
  const [activeUserId, setActiveUserIdState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUsers(parsed.users || {});
          setActiveUserIdState(parsed.activeUserId || null);
        }
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  async function persist(nextUsers, nextActive) {
    setUsers(nextUsers);
    setActiveUserIdState(nextActive);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ users: nextUsers, activeUserId: nextActive })
    );
  }

  const upsertUser = async (u) => {
    const next = { ...users, [u.id]: u };
    await persist(next, activeUserId ?? u.id); // 첫 사용자면 active 지정
  };

  const setActiveUserId = async (id) => {
    if (!users[id]) return;
    await persist(users, id);
  };

  const getUser = (id = null) => {
    const key = id || activeUserId;
    return key ? users[key] || null : null;
  };

  const value = useMemo(
    () => ({ users, activeUserId, upsertUser, setActiveUserId, getUser, isLoaded }),
    [users, activeUserId, isLoaded]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used inside FamilyProvider");
  return ctx;
}