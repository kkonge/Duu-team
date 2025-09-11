// screens/HomeScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useSelectedDog } from "../context/SelectedDogContext"; // ⬅️ 전역 선택 강아지

const { width: SCREEN_W } = Dimensions.get("window");
const AVATAR = 120;

const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const HERO_BG = "#0F1115";

const LEGACY_KEY = "@diary_local_entries";
const LOCAL_KEY = (dogId) => `@diary_local_entries:${dogId || "unknown"}`;

function getAgeLabel(birth) {
  if (!birth) return "-";
  const d = new Date(birth);
  if (isNaN(d.getTime())) return "-";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  let days = now.getDate() - d.getDate();
  if (days < 0) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0 && months <= 0) return "0m";
  if (years <= 0) return `${months}m`;
  return `${years}y ${months}m`;
}

function CoreTile({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]} hitSlop={6}>
      <Ionicons name={icon} size={26} color="#111" />
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}
function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function Chip({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={14} color="#111" /> : null}
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}
function ProgressBar({ value = 0, total = 1 }) {
  const pct = Math.max(0, Math.min(1, total ? value / total : 0));
  return (
    <View style={styles.barWrap}>
      <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();

  // ⬇️ 전역 선택 강아지 사용 (params 대신)
  const { selectedDog, selectedDogId } = useSelectedDog();
  const dog = selectedDog || {};
  const dogId = selectedDogId || dog?.id;

  const ageText = useMemo(() => getAgeLabel(dog?.birth), [dog?.birth]);

  // 루틴 로컬 상태 (강아지별로 분리하려면 key를 dogId에 묶어 저장/로드 추가 가능)
  const [routines, setRoutines] = useState([
    { id: "r1", label: "아침 산책", category: "walk", goalPerDay: 1, progress: 0 },
    { id: "r2", label: "아침 사료", category: "meal", goalPerDay: 2, progress: 1 },
    { id: "r3", label: "저녁 사료", category: "meal", goalPerDay: 2, progress: 1 },
  ]);
  const bumpRoutine = (id) =>
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, progress: Math.min(Math.max(1, r.goalPerDay || 1), (r.progress || 0) + 1) } : r))
    );
  const resetRoutine = (id) => setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, progress: 0 } : r)));
  const addPreset = (preset) => setRoutines((prev) => [...prev, { id: Date.now().toString(), ...preset, progress: 0 }]);

  const [newRoutine, setNewRoutine] = useState("");
  const [showRoutineInput, setShowRoutineInput] = useState(false);
  const addRoutineManual = () => {
    const label = newRoutine.trim();
    if (!label) return;
    const lower = label.toLowerCase();
    let category = "other";
    if (/산책|walk/.test(lower)) category = "walk";
    else if (/사료|식사|밥|meal|feed/.test(lower)) category = "meal";
    else if (/약|영양제|med/.test(lower)) category = "meds";
    const goalPerDay = category === "meal" ? 2 : 1;
    setRoutines((prev) => [...prev, { id: Date.now().toString(), label, category, goalPerDay, progress: 0 }]);
    setNewRoutine(""); setShowRoutineInput(false);
  };

  const [extraLogs, setExtraLogs] = useState({ walk: 0, meal: 0, meds: 0 });
  const quickAdd = (category) => setExtraLogs((p) => ({ ...p, [category]: Math.max(0, (p[category] || 0) + 1) }));

  const DEFAULT_GOAL = { walk: 1, meal: 2, meds: 1 };
  const totalsByCat = useMemo(() => {
    const sum = { walk: 0, meal: 0, meds: 0 };
    routines.forEach((r) => {
      if (r.category === "walk") sum.walk += Math.max(1, r.goalPerDay || 1);
      if (r.category === "meal") sum.meal += Math.max(1, r.goalPerDay || 1);
      if (r.category === "meds") sum.meds += Math.max(1, r.goalPerDay || 1);
    });
    return {
      walk: sum.walk || DEFAULT_GOAL.walk,
      meal: sum.meal || DEFAULT_GOAL.meal,
      meds: sum.meds || DEFAULT_GOAL.meds,
    };
  }, [routines]);
  const doneByCat = useMemo(() => {
    const sum = { walk: 0, meal: 0, meds: 0 };
    routines.forEach((r) => {
      const goal = Math.max(1, r.goalPerDay || 1);
      const p = Math.min(goal, r.progress || 0);
      if (r.category === "walk") sum.walk += p;
      if (r.category === "meal") sum.meal += p;
      if (r.category === "meds") sum.meds += p;
    });
    return {
      walk: sum.walk + (extraLogs.walk || 0),
      meal: sum.meal + (extraLogs.meal || 0),
      meds: sum.meds + (extraLogs.meds || 0),
    };
  }, [routines, extraLogs]);
  const status = {
    walk: { done: doneByCat.walk, total: totalsByCat.walk, icon: "footsteps-outline", label: "산책", key: "walk" },
    meal: { done: doneByCat.meal, total: totalsByCat.meal, icon: "restaurant-outline", label: "식사", key: "meal" },
    meds: { done: doneByCat.meds, total: totalsByCat.meds, icon: "medkit-outline", label: "약", key: "meds" },
  };

  /* ---------- 갤러리(강아지별) ---------- */
  const [latest3, setLatest3] = useState([]); // [{uri, date}]
  const loadLatestPhotos = useCallback(async () => {
    try {
      const rawByDog = await AsyncStorage.getItem(LOCAL_KEY(dogId));
      const byDog = rawByDog ? JSON.parse(rawByDog) : [];
      const rawLegacy = await AsyncStorage.getItem(LEGACY_KEY);
      const legacy = rawLegacy ? JSON.parse(rawLegacy) : [];
      const legacyForDog = legacy.filter((e) => !dogId || e.dogId === dogId);

      const merged = [...byDog, ...legacyForDog].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );

      const flat = [];
      merged.forEach((entry) => {
        const d = entry.date || 0;
        (entry.photos || []).forEach((uri) => uri && flat.push({ uri, date: d }));
      });
      flat.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setLatest3(flat.slice(0, 3));
    } catch (e) {
      console.warn("loadLatestPhotos error:", e);
      setLatest3([]);
    }
  }, [dogId]);

  useEffect(() => { loadLatestPhotos(); }, [loadLatestPhotos]);
  useFocusEffect(useCallback(() => { loadLatestPhotos(); }, [loadLatestPhotos]));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.heroBg} />
      <View style={styles.container}>
        {/* 상단 바 */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>HOME</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* 히어로 */}
          <View style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarMask}>
                  {dog?.imageUri ? (
                    <Image source={{ uri: dog.imageUri }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                      <Ionicons name="paw-outline" size={42} color="#BFC3C8" />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.hello}>안녕하세요!</Text>
                <Text style={styles.nameLine}>
                  저는 <Text style={styles.nameBold}>{dog?.name || "KONG"}</Text> 에요
                </Text>
                <View style={styles.badgeRow}>
                  <Text style={styles.badge}>{ageText}</Text>
                  {dog?.breed ? <Text style={[styles.badge, styles.badgeDim]}>{dog.breed}</Text> : null}
                </View>
              </View>
            </View>

            <View style={styles.statusWrapHero}>
              {["walk", "meal", "meds"].map((k) => {
                const s = status[k];
                const pct = Math.max(0, Math.min(1, s.total ? s.done / s.total : 0));
                return (
                  <View key={k} style={styles.statusItem}>
                    <View style={styles.statusIconLabel}>
                      <Ionicons name={s.icon} size={16} color="#fff" />
                      <Text style={styles.statusLabelHero}>{s.label}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={styles.statusValueHero}>
                        {s.done}/{s.total}
                      </Text>
                      <Pressable onPress={() => quickAdd(k)} style={({ pressed }) => [styles.plusTiny, pressed && styles.pressed]} hitSlop={6}>
                        <Ionicons name="add" size={14} color="#111" />
                      </Pressable>
                    </View>
                    <View style={styles.barWrapHero}>
                      <View style={[styles.barFillHero, { width: `${pct * 100}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 시트 */}
          <View style={styles.sheet}>
            <View style={styles.coreGrid}>
              <CoreTile icon="book-outline" label="Diary" onPress={() => navigation.navigate("Diary")} />
              <CoreTile icon="walk-outline" label="Walk" onPress={() => navigation.navigate("Walk")} />
              <CoreTile icon="heart-outline" label="Care" onPress={() => navigation.navigate("HealthCare")} />
              <CoreTile icon="calendar-outline" label="Calendar" onPress={() => navigation.navigate("Calendar")} />
            </View>

            <SectionHeader title="Pet Routines" />
            <View style={styles.presetRow}>
              <Chip label="산책(1회/일)" icon="footsteps-outline" onPress={() => addPreset({ label: "산책", category: "walk", goalPerDay: 1 })} />
              <Chip label="식사(2회/일)" icon="restaurant-outline" onPress={() => addPreset({ label: "식사", category: "meal", goalPerDay: 2 })} />
              <Chip label="약(1회/일)" icon="medkit-outline" onPress={() => addPreset({ label: "약", category: "meds", goalPerDay: 1 })} />
            </View>

            <View style={styles.card}>
              {routines.length === 0 ? (
                <>
                  <Text style={styles.emptyDim}>아직 등록된 루틴이 없어요</Text>
                  {showRoutineInput ? (
                    <View style={styles.inputRow}>
                      <TextInput
                        placeholder="예) 저녁 산책"
                        value={newRoutine}
                        onChangeText={setNewRoutine}
                        style={styles.input}
                        placeholderTextColor="#9AA4AF"
                        returnKeyType="done"
                        onSubmitEditing={addRoutineManual}
                      />
                      <TouchableOpacity onPress={addRoutineManual} style={styles.addBtn}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.plusBtn} onPress={() => setShowRoutineInput(true)}>
                      <Ionicons name="add-circle-outline" size={26} color="#111" />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  {routines.map((r) => {
                    const goal = Math.max(1, r.goalPerDay || 1);
                    const p = Math.min(goal, r.progress || 0);
                    const catIcon =
                      r.category === "walk" ? "footsteps-outline" :
                      r.category === "meal" ? "restaurant-outline" :
                      r.category === "meds" ? "medkit-outline" : "ellipse-outline";
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => bumpRoutine(r.id)}
                        onLongPress={() => resetRoutine(r.id)}
                        style={({ pressed }) => [styles.routineRow, pressed && styles.pressed]}
                      >
                        <Ionicons name={catIcon} size={16} color="#111" />
                        <Text style={styles.routineTxt}>{r.label}</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.routineCount}>{p}/{goal}</Text>
                      </Pressable>
                    );
                  })}
                  {showRoutineInput ? (
                    <View style={styles.inputRow}>
                      <TextInput
                        placeholder="예) 저녁 산책"
                        value={newRoutine}
                        onChangeText={setNewRoutine}
                        style={styles.input}
                        placeholderTextColor="#9AA4AF"
                        returnKeyType="done"
                        onSubmitEditing={addRoutineManual}
                      />
                      <TouchableOpacity onPress={addRoutineManual} style={styles.addBtn}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.plusBtn} onPress={() => setShowRoutineInput(true)}>
                      <Ionicons name="add-circle-outline" size={26} color="#111" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <SectionHeader
              title="Recent Memories"
              actionLabel={latest3.length ? "더보기" : undefined}
              onAction={() => navigation.navigate("Diary")}
            />
            <View style={styles.galleryRow}>
              {latest3.length === 0 ? (
                <View style={[styles.galleryBox, styles.galleryPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color="#9AA4AF" />
                  <Text style={styles.galleryDim}>사진이 없어요</Text>
                </View>
              ) : (
                latest3.map((p, idx) => (
                  <Pressable
                    key={`${p.uri}-${idx}`}
                    onPress={() => navigation.navigate("Diary")}
                    style={({ pressed }) => [styles.galleryBox, pressed && styles.pressed]}
                  >
                    <Image source={{ uri: p.uri }} style={styles.galleryImg} />
                  </Pressable>
                ))
              )}
            </View>

            <SectionHeader title="Family Activities" />
            <View style={styles.card}>
              <Text style={styles.emptyDim}>아직 활동 로그가 없어요</Text>
            </View>

            <SectionHeader title="Memo" />
            <View style={styles.card}>
              <TextInput
                placeholder="자유롭게 메모를 남겨보세요"
                placeholderTextColor="#9AA4AF"
                style={styles.memoInput}
                multiline
              />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 하단 탭 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("IdCard")}>
          <Ionicons name="person-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, styles.tabCenter, styles.tabActive]}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("ChatBot")}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CARD_BASE = {
  borderRadius: 18,
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: BORDER,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  heroBg: { ...StyleSheet.absoluteFillObject, backgroundColor: HERO_BG, height: 530 },
  container: { flex: 1 },

  topBar: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)",
  },
  appTitle: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 2 },

  hero: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 28 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  avatarRing: {
    width: AVATAR, height: AVATAR, borderRadius: AVATAR / 2, borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)", backgroundColor: "transparent", alignItems: "center", justifyContent: "center",
  },
  avatarMask: { width: AVATAR - 4, height: AVATAR - 4, borderRadius: (AVATAR - 4) / 2, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)" },
  avatarImg: { width: "100%", height: "100%", borderRadius: (AVATAR - 4) / 2, resizeMode: "cover", transform: [{ scale: 1.002 }] },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },

  heroInfo: { flex: 1 },
  hello: { fontSize: 15, color: "#E9EAEC", fontWeight: "800" },
  nameLine: { marginTop: 2, fontSize: 20, color: "#fff", fontWeight: "700" },
  nameBold: { fontWeight: "900", color: "#fff" },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)", backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff", fontWeight: "800", fontSize: 12,
  },
  badgeDim: { opacity: 0.85 },

  statusWrapHero: {
    marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  statusIconLabel: { flexDirection: "row", alignItems: "center", gap: 8, width: 90 },
  statusLabelHero: { fontWeight: "800", color: "#fff" },
  statusValueHero: { textAlign: "right", color: "#fff", fontWeight: "800" },
  plusTiny: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  barWrapHero: {
    flex: 1, height: 8, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  barFillHero: { height: "100%", backgroundColor: "#fff" },

  barWrap: { flex: 1, height: 8, borderRadius: 8, backgroundColor: "#F3F4F6", overflow: "hidden", borderWidth: 1, borderColor: "#EFEFEF" },
  barFill: { height: "100%", backgroundColor: "#111" },

  sheet: { marginTop: 0, paddingTop: 18, paddingBottom: 24, paddingHorizontal: 18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: BG },

  sectionHeader: { marginTop: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, color: TEXT, fontWeight: "900" },
  sectionAction: { fontSize: 13, color: TEXT_DIM, fontWeight: "800" },

  coreGrid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: -90 },
  tile: {
    width: (SCREEN_W - 18 * 2 - 12) / 2, aspectRatio: 1.05, alignItems: "center", justifyContent: "center",
    gap: 10, marginBottom: 8, ...CARD_BASE,
  },
  tileLabel: { fontSize: 16, fontWeight: "800", color: TEXT },

  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10, marginTop: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  chipText: { fontSize: 12, fontWeight: "800", color: "#111" },

  card: { padding: 12, ...CARD_BASE, marginBottom: 30 },
  emptyDim: { textAlign: "center", color: TEXT_DIM, fontWeight: "700", marginVertical: 6 },

  routineRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  routineTxt: { color: TEXT, fontWeight: "800", flexShrink: 1 },
  routineCount: { color: TEXT, fontWeight: "900", width: 50, textAlign: "right" },

  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, color: TEXT, fontSize: 14 },
  addBtn: { marginLeft: 8, backgroundColor: "#111", borderRadius: 12, padding: 10 },
  plusBtn: { alignSelf: "center", marginTop: 6 },

  galleryRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  galleryBox: { width: (SCREEN_W - 18 * 2 - 10 * 2) / 3, aspectRatio: 1, borderRadius: 12, overflow: "hidden", ...CARD_BASE, marginBottom: 20 },
  galleryImg: { width: "100%", height: "100%" },
  galleryPlaceholder: { alignItems: "center", justifyContent: "center" },
  galleryDim: { color: TEXT_DIM, fontWeight: "700", fontSize: 12, marginTop: 6 },

  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  logDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#111" },
  logText: { flex: 1, color: TEXT, fontWeight: "700" },
  logWho: { fontWeight: "900", color: TEXT },
  logTime: { color: TEXT_DIM, fontWeight: "800", fontSize: 12 },

  memoInput: { minHeight: 80, textAlignVertical: "top", color: TEXT, fontWeight: "700" },

  tabBar: {
    position: "absolute", left: 18, right: 18, bottom: 18, height: 60, borderRadius: 18, borderWidth: 1, borderColor: BORDER,
    backgroundColor: "#fff", flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  tabBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tabCenter: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff" },
  tabActive: { backgroundColor: "#F9FAFB" },

  barWrap: { flex: 1, height: 8, borderRadius: 8, backgroundColor: "#F3F4F6", overflow: "hidden", borderWidth: 1, borderColor: "#EFEFEF" },
  barFill: { height: "100%", backgroundColor: "#111" },

  pressed: { transform: [{ scale: 0.98 }] },
});