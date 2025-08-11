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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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
  const routinesProp = Array.isArray(route.params?.routines)
    ? route.params.routines
    : ["Brushing", "Playtime", "Sun time", "Training"].map((label, i) => ({
        id: String(i + 1),
        label,
        done: Math.random() > 0.5,
      }));

  const [routines, setRoutines] = useState(routinesProp);

  const today = useMemo(() => formatToday(), []);
  const ageText = useMemo(() => getAgeLabel(dog?.birth), [dog?.birth]);

  const toggleRoutine = (id) =>
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EEF6E9" }}>
      <View style={styles.blobA} />
      <View style={styles.blobB} />
      <View style={styles.blobC} />

      <View style={styles.container}>
       
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#5B7F6A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today</Text>
          <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
            <Ionicons name="ellipsis-horizontal-circle" size={22} color="#5B7F6A" />
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
                    <Ionicons name="paw-outline" size={48} color="#9CB3A1" />
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
                My name is{" "}
                <Text style={styles.nameAccent}>{dog?.name || "KONG"}</Text>
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
              bg="#EAF4EE"
              border="#D7E8DB"
              icon="journal-outline"
              label="Diary"
              onPress={() => navigation.navigate("Diary")}
            />
            <CoreTile
              bg="#FFF1F1"
              border="#FFD9D9"
              icon="walk-outline"
              label="Walk"
              onPress={() => navigation.navigate("Walk")}
            />
            <CoreTile
              bg="#F5F1FF"
              border="#E0D8FF"
              icon="medkit-outline"
              label="Health"
              onPress={() => navigation.navigate("Health")}
            />
            <CoreTile
              bg="#EAF3FF"
              border="#D4E6FF"
              icon="calendar-outline"
              label="Calendar"
              onPress={() => navigation.navigate("Calendar")}
            />
          </View>

          {/* Pet Routines */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pet Routines</Text>
            <Pressable hitSlop={6} onPress={() => navigation.navigate("Settings")}>
              <Text style={styles.link}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.glass}>
            {routines.map((r, idx) => (
              <Pressable
                key={r.id || idx}
                onPress={() => toggleRoutine(r.id)}
                style={({ pressed }) => [
                  styles.routineRow,
                  pressed && { transform: [{ scale: 0.99 }] },
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
            {routines.length === 0 && (
              <Text style={{ color: "#93A39A", fontWeight: "700" }}>
                아직 설정된 루틴이 없어요. Edit에서 추가하세요.
              </Text>
            )}
          </View>

          {/* Today 날짜 표시 */}
          <Text style={styles.dateTxt}>{today}</Text>
        </ScrollView>
      </View>

      {/* 하단 탭바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Diary")}>
          <Ionicons name="book-outline" size={22} color="#2f2f2f" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, styles.tabCenter]}
          onPress={() => navigation.navigate("Home", { selectedDog: dog })}
        >
          <Ionicons name="home" size={24} color="#2f2f2f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2f2f2f" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


function CoreTile({ icon, label, onPress, bg, border }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: bg, borderColor: border },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.tileIconWrap}>
        <Ionicons name={icon} size={22} color="#3F8C74" />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },

  
  blobA: {
    position: "absolute", top: -40, left: -60, width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#C9F0D1", opacity: 0.35,
  },
  blobB: {
    position: "absolute", top: 80, right: -40, width: 140, height: 140, borderRadius: 70,
    backgroundColor: "#B8E5FF", opacity: 0.28,
  },
  blobC: {
    position: "absolute", bottom: 140, left: -50, width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#F3E6FF", opacity: 0.26,
  },

  
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 6, marginBottom: 6, 
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#EAF4EE", borderWidth: 1, borderColor: "#D7E8DB",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#5B7F6A" },

  
  heroCard: {
    flexDirection: "row",
    borderRadius: 28,
    backgroundColor: "#ffffff",
    borderWidth: 1, borderColor: "#E0E8DE",
    padding: 18,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6,
    marginBottom: 14,
  },
  heroLeft: { justifyContent: "center", marginRight: 14 },
  avatarGlow: {
    width: 128, height: 128, borderRadius: 64,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#EAF4EE",
    shadowColor: "#3F8C74", shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
  },
  heroAvatar: { width: 118, height: 118, borderRadius: 59, backgroundColor: "#F3F6F2" },
  heroPlaceholder: { alignItems: "center", justifyContent: "center" },
  starBadge: {
    position: "absolute", right: 6, bottom: 6,
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#3F8C74",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },

  heroRight: { flex: 1, justifyContent: "center" },
  hello: { fontSize: 14, fontWeight: "800", color: "#6B7A6A" },
  nameLine: { fontSize: 16, color: "#415247", fontWeight: "700", marginTop: 2 },
  nameAccent: { color: "#3F8C74", fontWeight: "900", fontSize: 20 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999,
    backgroundColor: "#E4F1E7", borderWidth: 1, borderColor: "#D7E8DB",
    color: "#3F8C74", fontWeight: "800", fontSize: 12,
  },
  badgeDim: { backgroundColor: "#F3F6F2", borderColor: "#E0E8DE", color: "#5B6C5A" },


  coreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  tile: {
    width: "48%",
    aspectRatio: 1.05,
    borderRadius: 20,
    
    padding: 14,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  tileIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFFFFF", 
    borderWidth: 1, borderColor: "#E0E8DE",
    alignItems: "center", justifyContent: "center",
  },
  tileLabel: { fontSize: 18, fontWeight: "900", color: "#415247" },

  /* Routines */
  sectionHeader: {
    marginTop: 12, marginBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { color: "#415247", fontWeight: "900", fontSize: 16 },
  link: { color: "#2F7FFF", fontWeight: "800", fontSize: 12 },
  glass: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1, borderColor: "#E0E8DE",
    padding: 14,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  routineRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderColor: "#EFF4EF",
  },
  checkDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: "#CFE2CF", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkDotOn: { backgroundColor: "#3F8C74", borderColor: "#3F8C74" },
  routineTxt: { color: "#415247", fontWeight: "700" },

  dateTxt: { textAlign: "center", marginTop: 14, color: "#6B7A6A", fontWeight: "700", fontSize: 12 },

  /* 탭바 */
  tabBar: {
    position: "absolute", left: 16, right: 16, bottom: 20,
    height: 64, backgroundColor: "#BFEFC7",
    borderRadius: 28,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  tabBtn: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  tabCenter: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.65)" },
});