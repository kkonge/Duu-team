// src/config/api.js
import { Platform } from "react-native";
import Constants from "expo-constants";

const injected = Constants.expoConfig?.extra?.API_BASE_URL;

// 에뮬레이터 기본값 (없을 때만 사용)
const fallbackDev =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";

export const API_BASE_URL = injected || fallbackDev;