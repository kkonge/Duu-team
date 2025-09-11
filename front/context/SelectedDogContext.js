// context/SelectedDogContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SelectedDogContext = createContext(null);
const KEY_SELECTED_DOG = "SELECTED_DOG_V1";

export function SelectedDogProvider({ children }) {
  const [selectedDog, setSelectedDogState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 앱 시작 시 마지막 선택 강아지 복원
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_SELECTED_DOG);
        if (raw) setSelectedDogState(JSON.parse(raw));
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  async function setSelectedDog(nextDog) {
    setSelectedDogState(nextDog);
    if (nextDog) {
      await AsyncStorage.setItem(KEY_SELECTED_DOG, JSON.stringify(nextDog));
    } else {
      await AsyncStorage.removeItem(KEY_SELECTED_DOG);
    }
  }

  const value = useMemo(
    () => ({
      selectedDog,
      selectedDogId: selectedDog?.id ?? null,
      isLoaded,
      setSelectedDog,
      clearSelectedDog: () => setSelectedDog(null),
    }),
    [selectedDog, isLoaded]
  );

  return (
    <SelectedDogContext.Provider value={value}>
      {children}
    </SelectedDogContext.Provider>
  );
}

export function useSelectedDog() {
  const ctx = useContext(SelectedDogContext);
  if (!ctx) throw new Error("useSelectedDog must be used within SelectedDogProvider");
  return ctx;
}