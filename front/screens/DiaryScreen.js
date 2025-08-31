// screens/DiaryScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import DiaryList from "./DiaryList";
import GalleryView from "./GalleryView";


const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};
const LEGACY_KEY = "@diary_local_entries";   // 레거시 공용
const LOCAL_KEY = (id) => `@diary_local_entries:${id || "unknown"}`;

const DIARY_KEY = "@diary_tab_is_diary";

export default function DiaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedDog = route.params?.selectedDog;
  const dogId = route.params?.dogId ?? selectedDog?.id;

  const [diary, setDiary] = useState(true);
  const [stats, setStats] = useState({ total: 0, week: 0, photos: 0 });
  const [loadingStats, setLoadingStats] = useState(true);


  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(DIARY_KEY);
      if (saved !== null) setDiary(JSON.parse(saved));
    })();
  }, []);
  const toggleTab = async (isDiary) => {
    setDiary(isDiary);
    await AsyncStorage.setItem(DIARY_KEY, JSON.stringify(isDiary));
  };


  const [reloadKey, setReloadKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (route.params?.didSave) {
        setReloadKey((k) => k + 1);
        navigation.setParams({ didSave: undefined });
      }
    }, [route.params?.didSave])
  );


  const calcStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const rawByDog = await AsyncStorage.getItem(LOCAL_KEY(dogId));
      const byDog = rawByDog ? JSON.parse(rawByDog) : [];
      // 2) 레거시 호환: 같은 dogId만
      const rawLegacy = await AsyncStorage.getItem(LEGACY_KEY);
      const legacy = rawLegacy ? JSON.parse(rawLegacy) : [];
      const list = [...byDog, ...legacy.filter(e => e.dogId === dogId)];

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); 

      const total = list.length;
      const week = list.filter((e) => {
        const d = new Date(e.date || 0);
        return d >= startOfWeek;
      }).length;
      const photos = list.reduce((acc, e) => acc + (e.photos?.length || 0), 0);
      setStats({ total, week, photos });
    } finally {
      setLoadingStats(false);
    }
  }, [dogId]);
  useEffect(() => {
    calcStats();
  }, [reloadKey, calcStats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DIARY</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")} style={styles.iconBtn}>
          <Ionicons name="calendar-outline" size={18} color={TEXT} />
        </TouchableOpacity>
      </View>

     
      <View style={styles.heroCard}>
  <Text style={styles.heroTop}>오늘의 기록</Text>

   <Text
    style={styles.heroMain}
    numberOfLines={2}
    adjustsFontSizeToFit
    minimumFontScale={0.9}
    ellipsizeMode="tail"
  >
    {selectedDog?.name ? `${selectedDog.name.toUpperCase()}'S JOURNAL` : "MY DOG'S JOURNAL"}
  </Text>

 
  <View style={styles.heroStatsRow}>
   
    <View style={styles.statPill}>
      <Ionicons name="calendar-outline" size={14} color={TEXT} />
      <Text style={styles.statPillTxt}>이번 주 · {stats.week}</Text>
    </View>
    <View style={styles.statPill}>
      <Ionicons name="image-outline" size={14} color={TEXT} />
      <Text style={styles.statPillTxt}>사진 · {stats.photos}</Text>
    </View>
    <View style={styles.statPill}>
      <Ionicons name="book-outline" size={14} color={TEXT} />
      <Text style={styles.statPillTxt}>전체 · {stats.total}</Text>
    </View>
  </View>
</View>


      <View style={styles.tabHeader}>
        <TouchableOpacity
          onPress={() => toggleTab(true)}
          style={[styles.tabButton, diary && styles.tabSelected]}
        >
          <Text style={[styles.tabText, diary && styles.tabTextSelected]}>DIARY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleTab(false)}
          style={[styles.tabButton, !diary && styles.tabSelected]}
        >
          <Text style={[styles.tabText, !diary && styles.tabTextSelected]}>GALLERY</Text>
        </TouchableOpacity>
      </View>


      
      <View style={{ flex: 1 }}>
        {diary ? (
          <DiaryList
            key={reloadKey}
            dogId={dogId}
            onPressItem={(entry,dogIdParam) => navigation.navigate('DiaryDetail', { diaryId: entry.id, dogId: dogIdParam })}
            onPressWrite={(dogIdParam) => navigation.navigate('DiaryEditor', { dogId: dogIdParam, selectedDog })}
          />
        ) : (
          <GalleryView dogId={dogId} reloadKey={reloadKey} />
        )}
      </View>

  
    
 
    </SafeAreaView>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={14} color={TEXT} />
      <Text style={styles.pillTxt}>
        {label} · <Text style={{ fontWeight: "900", color: TEXT }}>{String(value)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({

headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 18,

  marginTop: 10,
  marginBottom: 8,
},
iconBtn: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: BORDER,
  ...CARD_SHADOW,
},
headerTitle: {
  fontSize: 16,
  fontWeight: "900",
  color: TEXT,
  letterSpacing: 0.5,
  lineHeight: 20,  
  flexShrink: 1,
},


heroCard: {
  marginHorizontal: 16,
  marginBottom: 12,
  paddingVertical: 16,
  paddingHorizontal: 14,
  borderRadius: 16,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: BORDER,
  ...CARD_SHADOW,

  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
},
heroTop: {
  fontSize: 12,
  color: TEXT_DIM,
  fontWeight: "800",
  lineHeight: 16,
},

heroStatsRow: {
  width: "100%",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},
statPill: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: BORDER,
  backgroundColor: "#F9FAFB",
},
statPillTxt: { fontSize: 12, fontWeight: "900", color: TEXT },


heroMain: {
  width: "100%",
  marginTop: 2,
  fontSize: 25,      
  lineHeight: 32,
  fontWeight: "800",
  color: TEXT,
  letterSpacing: 0.2, 
},
  pill: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB",
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  pillTxt: { fontSize: 12, fontWeight: "900", color: TEXT },

  tabHeader: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  tabButton: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER, backgroundColor: "#F9FAFB",
  },
  tabSelected: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, fontWeight: "900", color: TEXT_DIM, letterSpacing: 1 },
  tabTextSelected: { color: TEXT },

  writeCtaWrap: { position: "absolute", left: 18, right: 18, bottom: 86, alignItems: "flex-end" },
  writeCta: {
    height: 44, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#111",
    alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8,
    ...CARD_SHADOW,
  },
  writeCtaTxt: { color: "#fff", fontWeight: "900" },


});