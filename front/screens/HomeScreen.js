// screens/HomeScreen.js
import React, { useMemo, useState } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");
const AVATAR = 120;

/* ---------- Utils ---------- */
function getAgeLabel(birth) {
  if (!birth) return "-";
  const d = new Date(birth);
  if (isNaN(d.getTime())) return "-";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  let days = now.getDate() - d.getDate();
  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return "0m";
  if (years <= 0) return `${months}m`;
  return `${years}y ${months}m`;
}

/* ---------- Common: Progress (light) ---------- */
function ProgressBar({ value = 0, total = 1 }) {
  const pct = Math.max(0, Math.min(1, total ? value / total : 0));
  return (
    <View style={styles.barWrap}>
      <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

/* ---------- Common: Section Header ---------- */
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

/* ---------- Small UI: Chip ---------- */
function Chip({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={14} color="#111" /> : null}
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Common: Core Tile ---------- */
function CoreTile({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.pressed]} hitSlop={6}>
      <Ionicons name={icon} size={26} color="#111" />
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const dog = route.params?.selectedDog || {};
  const ageText = useMemo(() => getAgeLabel(dog?.birth), [dog?.birth]);

  /* ---------- Routines ---------- */
  const routinesInit = Array.isArray(route.params?.routines)
    ? route.params.routines
    : [
        { id: "r1", label: "아침 산책", category: "walk", goalPerDay: 1, progress: 0 },
        { id: "r2", label: "아침 사료", category: "meal", goalPerDay: 2, progress: 1 },
        { id: "r3", label: "저녁 사료", category: "meal", goalPerDay: 2, progress: 1 },
        // 약은 예시로 비워둠
      ];

  const [routines, setRoutines] = useState(routinesInit);

  // 루틴 한 번 탭 = +1(최대 goalPerDay까지), 길게 탭 = 0으로 리셋
  const bumpRoutine = (id) =>
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const goal = Math.max(1, r.goalPerDay || 1);
        const next = Math.min(goal, (r.progress || 0) + 1);
        return { ...r, progress: next };
      })
    );
  const resetRoutine = (id) =>
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, progress: 0 } : r)));

  // 빠른 추가(프리셋)
  const addPreset = (preset) => {
    const id = Date.now().toString();
    setRoutines((prev) => [...prev, { id, ...preset, progress: 0 }]);
  };

  // 직접 추가 입력
  const [newRoutine, setNewRoutine] = useState("");
  const [showRoutineInput, setShowRoutineInput] = useState(false);

  const addRoutineManual = () => {
    const label = newRoutine.trim();
    if (!label) return;
    // 간단 규칙으로 카테고리 추론
    const lower = label.toLowerCase();
    let category = "other";
    if (/산책|walk/.test(lower)) category = "walk";
    else if (/사료|식사|밥|meal|feed/.test(lower)) category = "meal";
    else if (/약|영양제|med/.test(lower)) category = "meds";
    const goalPerDay = category === "meal" ? 2 : 1;
    setRoutines((prev) => [...prev, { id: Date.now().toString(), label, category, goalPerDay, progress: 0 }]);
    setNewRoutine("");
    setShowRoutineInput(false);
  };

  /* ---------- Quick logs (상단에서 바로 + 한 기록: 루틴 없는 경우도 카운트) ---------- */
  const [extraLogs, setExtraLogs] = useState({ walk: 0, meal: 0, meds: 0 });
  const quickAdd = (category) =>
    setExtraLogs((p) => ({ ...p, [category]: Math.max(0, (p[category] || 0) + 1) }));

  
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
      if (r.category === "walk") sum.walk += Math.min(Math.max(1, r.goalPerDay || 1), r.progress || 0);
      if (r.category === "meal") sum.meal += Math.min(Math.max(1, r.goalPerDay || 1), r.progress || 0);
      if (r.category === "meds") sum.meds += Math.min(Math.max(1, r.goalPerDay || 1), r.progress || 0);
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


  const gallery = Array.isArray(dog?.gallery) ? dog.gallery : dog?.imageUri ? [dog.imageUri] : [];
  const gallery3 = gallery.slice(0, 3);

  const activityLog = Array.isArray(route.params?.activityLog)
    ? route.params.activityLog
    : [
        { id: "a1", who: "Me", text: "저녁 산책 완료", time: "19:42" },
        { id: "a2", who: "Mom", text: "사료 80g 급여", time: "08:10" },
      ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* 풀블리드 히어로 배경 */}
      <View style={styles.heroBg} />

      <View style={styles.container}>
        {/* 상단바 */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>HOME</Text>
          <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* 히어로 */}
          <View style={styles.hero}>
            <View style={styles.heroRow}>
              {/* 원형 아바타 */}
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

            {/* 히어로 상태 */}
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
                      {/* 퀵액션 + */}
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
            {/* Core 기능 */}
            <View style={styles.coreGrid}>
              <CoreTile icon="book-outline" label="Diary" onPress={() => navigation.navigate("Diary")} />
              <CoreTile icon="walk-outline" label="Walk" onPress={() => navigation.navigate("Walk")} />
              <CoreTile icon="heart-outline" label="Care" onPress={() => navigation.navigate("Care", { selectedDog: dog })} />
              <CoreTile icon="calendar-outline" label="Calendar" onPress={() => navigation.navigate("Calendar")} />
            </View>

            {/* 루틴: 프리셋 & 리스트 */}
            <SectionHeader title="Pet Routines" />

            {/* 프리셋 칩 (빠른 추가) */}
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
                      r.category === "walk" ? "footsteps-outline" : r.category === "meal" ? "restaurant-outline" : r.category === "meds" ? "medkit-outline" : "ellipse-outline";
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => bumpRoutine(r.id)}
                        onLongPress={() => resetRoutine(r.id)}
                        style={({ pressed }) => [styles.routineRow, pressed && styles.pressed]}
                      >
                        <Ionicons name={catIcon} size={16} color="#111" />
                        <Text style={[styles.routineTxt]}>{r.label}</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.routineCount}>
                          {p}/{goal}
                        </Text>
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

            {/* 갤러리 */}
            <SectionHeader title="Recent Memories" actionLabel={gallery3.length ? "더보기" : undefined} onAction={() => navigation.navigate("Diary")} />
            <View style={styles.galleryRow}>
              {gallery3.length === 0 ? (
                <View style={[styles.galleryBox, styles.galleryPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color="#9AA4AF" />
                  <Text style={styles.galleryDim}>사진이 없어요</Text>
                </View>
              ) : (
                gallery3.map((uri, idx) => (
                  <Pressable
                    key={`${uri}-${idx}`}
                    onPress={() => navigation.navigate("Diary")}
                    style={({ pressed }) => [styles.galleryBox, pressed && styles.pressed]}
                  >
                    <Image source={{ uri }} style={styles.galleryImg} />
                  </Pressable>
                ))
              )}
            </View>

            {/* 가족 활동 */}
            <SectionHeader title="Family Activities" />
            <View style={styles.card}>
              {activityLog.length === 0 ? (
                <Text style={styles.emptyDim}>아직 활동 로그가 없어요</Text>
              ) : (
                activityLog.map((a) => (
                  <View key={a.id} style={styles.logRow}>
                    <View style={styles.logDot} />
                    <Text style={styles.logText}>
                      <Text style={styles.logWho}>{a.who}</Text> · {a.text}
                    </Text>
                    <Text style={styles.logTime}>{a.time}</Text>
                  </View>
                ))
              )}
            </View>

            {/* 메모 */}
            <SectionHeader title="Memo" />
            <View style={styles.card}>
              <TextInput placeholder="자유롭게 메모를 남겨보세요" placeholderTextColor="#9AA4AF" style={styles.memoInput} multiline />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 하단 탭 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Id")}>
          <Ionicons name="person-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, styles.tabCenter, styles.tabActive]} onPress={() => navigation.navigate("Home", { selectedDog: dog })}>
          <Ionicons name="home-outline" size={22} color="#111" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("ChatBot")}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Design Tokens ---------- */
const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const HERO_BG = "#0F1115";

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

  /* Top bar */
  topBar: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  appTitle: { flex: 1, textAlign: "center", fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 2 },

  /* Hero */
  hero: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 28 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },

  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMask: {
    width: AVATAR - 4,
    height: AVATAR - 4,
    borderRadius: (AVATAR - 4) / 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: (AVATAR - 4) / 2,
    resizeMode: "cover",
    transform: [{ scale: 1.002 }],
  },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },

  heroInfo: { flex: 1 },
  hello: { fontSize: 15, color: "#E9EAEC", fontWeight: "800" },
  nameLine: { marginTop: 2, fontSize: 20, color: "#fff", fontWeight: "700" },
  nameBold: { fontWeight: "900", color: "#fff" },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  badgeDim: { opacity: 0.85 },

  
  statusWrapHero: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  statusIconLabel: { flexDirection: "row", alignItems: "center", gap: 8, width: 90 },
  statusLabelHero: { fontWeight: "800", color: "#fff" },
  statusValueHero: { textAlign: "right", color: "#fff", fontWeight: "800" },
  plusTiny: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  barWrapHero: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  barFillHero: { height: "100%", backgroundColor: "#fff" },

  /* Progress for cards */
  barWrap: { flex: 1, height: 8, borderRadius: 8, backgroundColor: "#F3F4F6", overflow: "hidden", borderWidth: 1, borderColor: "#EFEFEF" },
  barFill: { height: "100%", backgroundColor: "#111" },

  /* Sheet */
  sheet: { marginTop: 0, paddingTop: 18, paddingBottom: 24, paddingHorizontal: 18, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: BG },

  /* Section header */
  sectionHeader: { marginTop: 10, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 16, color: TEXT, fontWeight: "900" },
  sectionAction: { fontSize: 13, color: TEXT_DIM, fontWeight: "800" },

  /* Core grid */
  coreGrid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: -90 },
  tile: {
    width: (SCREEN_W - 18 * 2 - 12) / 2,
    aspectRatio: 1.05,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
    ...CARD_BASE,
  },
  tileLabel: { fontSize: 16, fontWeight: "800", color: TEXT },

  /* Chip row */
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  chipText: { fontSize: 12, fontWeight: "800", color: "#111" },

  /* Card */
  card: { padding: 12, ...CARD_BASE, marginBottom: 30 },
  emptyDim: { textAlign: "center", color: TEXT_DIM, fontWeight: "700", marginVertical: 6 },

  /* Routines */
  routineRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  routineTxt: { color: TEXT, fontWeight: "800", flexShrink: 1 },
  routineCount: { color: TEXT, fontWeight: "900", width: 50, textAlign: "right" },

  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, height: 42, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, color: TEXT, fontSize: 14 },
  addBtn: { marginLeft: 8, backgroundColor: "#111", borderRadius: 12, padding: 10 },
  plusBtn: { alignSelf: "center", marginTop: 6 },

  /* Gallery */
  galleryRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  galleryBox: { width: (SCREEN_W - 18 * 2 - 10 * 2) / 3, aspectRatio: 1, borderRadius: 12, overflow: "hidden", ...CARD_BASE, marginBottom: 20 },
  galleryImg: { width: "100%", height: "100%" },
  galleryPlaceholder: { alignItems: "center", justifyContent: "center" },
  galleryDim: { color: TEXT_DIM, fontWeight: "700", fontSize: 12, marginTop: 6 },

  /* Activity */
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: "#F1F5F9" },
  logDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#111" },
  logText: { flex: 1, color: TEXT, fontWeight: "700" },
  logWho: { fontWeight: "900", color: TEXT },
  logTime: { color: TEXT_DIM, fontWeight: "800", fontSize: 12 },

  /* Memo */
  memoInput: { minHeight: 80, textAlignVertical: "top", color: TEXT, fontWeight: "700" },

  /* Bottom Tab */
  tabBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tabBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tabCenter: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff" },
  tabActive: { backgroundColor: "#F9FAFB" },

  /* Interaction */
  pressed: { transform: [{ scale: 0.98 }] },
});