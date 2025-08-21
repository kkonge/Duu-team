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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

function CoreTile({ iconSource, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tileUnified,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <Image source={iconSource} style={styles.tileUnifiedIcon} />
      <Text style={styles.tileUnifiedLabel}>{label}</Text>
    </Pressable>
  );
}
/* ---------- 날짜 계산 ----------- */
function formatToday(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
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

export default function HomeScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const dog = route.params?.selectedDog || {};
  const routinesProp = Array.isArray(route.params?.routines) ? route.params.routines : [];

  const [routines, setRoutines] = useState(routinesProp);
  const [newRoutine, setNewRoutine] = useState("");
  const [showInput, setShowInput] = useState(false);

  const today = useMemo(() => formatToday(), []);
  const ageText = useMemo(() => getAgeLabel(dog?.birth), [dog?.birth]);

  const toggleRoutine = (id) =>
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );

  const addRoutine = () => {
    if (newRoutine.trim() === "") return;
    const newId = Date.now().toString();
    setRoutines((prev) => [...prev, { id: newId, label: newRoutine, done: false }]);
    setNewRoutine("");
    setShowInput(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#white" }}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2D5D9F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today</Text>
          <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal-circle" size={22} color="#2D5D9F" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCard, { marginTop: 6 }]}>
            <View style={styles.heroLeft}>
              <View style={styles.avatarGlow}>
                {dog?.imageUri ? (
                  <Image source={{ uri: dog.imageUri }} style={styles.heroAvatar} />
                ) : (
                  <View style={[styles.heroAvatar, styles.heroPlaceholder]}>
                    <Ionicons name="paw-outline" size={48} color="#8FB4DA" />
                  </View>
                )}
                <View style={styles.starBadge}>
                  <Ionicons name="star" size={14} color="#fff" />
                </View>
              </View>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.hello}>Hello!</Text>
              <Text style={styles.nameLine}>
                My name is <Text style={styles.nameAccent}>{dog?.name || "KONG"}</Text>
              </Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{ageText}</Text>
                {dog?.breed ? (
                  <Text style={[styles.badge, styles.badgeDim]}>{dog.breed}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.coreGrid}>
  <CoreTile
    iconSource={require("../assets/diary.png")}
    label="Diary"
    onPress={() => navigation.navigate("Diary")}
  />
  <CoreTile
    iconSource={require("../assets/walk.png")}
    label="Walk"
    onPress={() => navigation.navigate("Walk")}
  />
  <CoreTile
    iconSource={require("../assets/Vector 34.png")}
    label="Care"
    onPress={() => navigation.navigate("Care", { selectedDog: dog })}
  />
  <CoreTile
    iconSource={require("../assets/calendar.png")}
    label="Calendar"
    onPress={() => navigation.navigate("Calendar")}
  />
</View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Routines</Text>
          </View>

          <View style={styles.glass}>
            {routines.length === 0 ? (
              <>
                <Text style={styles.emptyText}>아직 루틴이 없습니다. 루틴을 추가해주세요.</Text>
                {showInput ? (
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="새 루틴을 입력하세요"
                      value={newRoutine}
                      onChangeText={setNewRoutine}
                      style={styles.input}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={addRoutine} style={styles.addBtn}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.plusBtn} onPress={() => setShowInput(true)}>
                    <Ionicons name="add-circle-outline" size={28} color="#2D5D9F" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                {routines.map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => toggleRoutine(r.id)}
                    style={({ pressed }) => [
                      styles.routineRow,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={[styles.checkDot, r.done && styles.checkDotOn]}>
                      {r.done && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text
                      style={[
                        styles.routineTxt,
                        r.done && { textDecorationLine: "line-through", color: "#93A39A" },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
                {showInput ? (
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="새 루틴을 입력하세요"
                      value={newRoutine}
                      onChangeText={setNewRoutine}
                      style={styles.input}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity onPress={addRoutine} style={styles.addBtn}>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.plusBtn} onPress={() => setShowInput(true)}>
                    <Ionicons name="add-circle-outline" size={28} color="#2D5D9F" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          <Text style={styles.dateTxt}>{today}</Text>
        </ScrollView>
      </View>


      {/* 하단 탭 */}
      <View style={styles.tabBar}>
  <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Id")}>
    <Image source={require("../assets/ID.png")} style={styles.tabIcon} />
  </TouchableOpacity>
  
  <TouchableOpacity
    style={[styles.tabBtn, styles.tabCenter]}
    onPress={() => navigation.navigate("Home", { selectedDog: dog })}
  >
    <Image source={require("../assets/home.png")} style={styles.tabIcon} />
  </TouchableOpacity>
  
  <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("ChatBot")}>
    <Image source={require("../assets/chat bot.png")} style={styles.tabIcon} />
  </TouchableOpacity>
</View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },

  tabIcon: {
  width: 42,
  height: 42,
  resizeMode: "contain",
},

  tileUnified: {
  width: "47%",
  aspectRatio: 1.05,
  borderRadius: 20,
  backgroundColor: "#F0F6FF",
  paddingVertical: 16,
  paddingHorizontal: 10,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
  marginBottom: 12,
},

tileUnifiedIcon: {
  width: 40,
  height: 40,
  resizeMode: "contain",
  marginBottom: 10,
},

tileUnifiedLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#2D5D9F",
},

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F0FB",
    borderWidth: 1,
    borderColor: "#C3DAF1",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#000" },

  heroCard: {
  flexDirection: "row",
  borderRadius: 24,
  backgroundColor: "#F9FBFF",
  borderWidth: 1,
  borderColor: "#D8E4F1",
  padding: 18,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
  marginBottom: 16,
},
  heroLeft: { justifyContent: "center", marginRight: 14 },
  avatarGlow: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F0FB",
    shadowColor: "#2D5D9F",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  heroAvatar: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#F0F4FA",
  },
  heroPlaceholder: { alignItems: "center", justifyContent: "center" },
  starBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2D5D9F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  heroRight: { flex: 1, justifyContent: "center" },
  hello: { fontSize: 14, fontWeight: "800", color: "#000" },
  nameLine: { fontSize: 16, color: "#000", fontWeight: "700", marginTop: 2 },
  nameAccent: { color: "#2D5D9F", fontWeight: "900", fontSize: 20 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: "#D0E3FF",
  color: "#2D5D9F",
  fontWeight: "600",
  fontSize: 11,
},
  badgeDim: {
    backgroundColor: "#F0F4FA",
    borderColor: "#D8E4F1",
    color: "#607D9E",
  },

  coreGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: 12,

},
  tile: {
    width: "46%",
    aspectRatio: 1.05,
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  tileLabel: { fontSize: 18, fontWeight: "900", color: "#3A4E6B" },

    sectionHeader: {
    marginTop: -50,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#2D5D9F",
    fontWeight: "900",
    fontSize: 20,
  },
  link: {
    color: "#3F8CFF",
    fontWeight: "800",
    fontSize: 12,
  },
  glass: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#DCEAF5",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  routineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E7F0FA",
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#BDD9F2",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkDotOn: {
    backgroundColor: "#3F8CFF",
    borderColor: "#3F8CFF",
  },
  routineTxt: {
    color: "#2D3F55",
    fontWeight: "700",
  },
  dateTxt: {
    textAlign: "center",
    marginTop: 14,
    color: "#6B84A6",
    fontWeight: "700",
    fontSize: 12,
  },

  /* 탭바 */
  tabBar: {
    marginBottom: 10,
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    height: 64,
    backgroundColor: "#D7EAFE",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  tabCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  emptyText: {
    textAlign: "center",
    color: "#98AFCB",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 12,
  },
  plusBtn: {
    alignSelf: "center",
    marginTop: 6,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1E2F4",
    fontSize: 14,
    color: "#1C2B36",
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#3F8CFF",
    borderRadius: 12,
    padding: 10,
  },
});