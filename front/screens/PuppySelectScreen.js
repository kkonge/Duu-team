// screens/PuppySelectScreen.js
import { useFamily } from "../context/FamilyContext";
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

/* --------- Utils --------- */
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

/* --------- Screen --------- */
export default function PuppySelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { users, activeUserId, getUser, isLoaded } = useFamily();

// 활성 사용자(나)
  const me = getUser(); // activeUserId가 없으면 null

// 가족 배열 (나 제외)
  const familyList = Object.values(users || {}).filter(u => u.id !== activeUserId);

  const userProfileParam = route.params?.userProfile || null;
  const familyProfilesParam = Array.isArray(route.params?.familyProfiles) ? route.params.familyProfiles : [];

  const meSafe = me || userProfileParam || null;
  const familySafe = (isLoaded && familyList.length >= 0) ? familyList : familyProfilesParam;

  const dogs = Array.isArray(route.params?.dogProfiles) ? route.params.dogProfiles : [];
 
  const data = useMemo(() => dogs, [dogs]);

  const renderItem = ({ item }) => {
    const uri = item.imageUri || item.photo || null;
    const name = item.name || "No Name";
    const breed = item.breed || null;
    const ageLabel = getAgeLabel(item.birth);

    return (
      <Pressable
        onPress={() => navigation.navigate({
          name: "Home",
          key: `Home-${item.id}`,   
          params: { selectedDog: item, dogId: item.id },
        })}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.thumb}>
          {uri ? (
            <Image source={{ uri }} style={styles.thumbImg} />
          ) : (
            <View style={[styles.thumbImg, styles.thumbPlaceholder]}>
              <Ionicons name="paw-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text numberOfLines={1} style={styles.dogName}>{name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{ageLabel}</Text>
            {breed ? <Text style={styles.metaDim}> • {breed}</Text> : null}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9AA4AF" />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Controls: Back (left) & Add (right) — 다른 화면과 동일한 위치 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>
        <Pressable
          onPress={() => navigation.navigate("AddDogStep1", route.params || {})}
          style={({ pressed }) => [styles.addBtn, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addTxt}>Add</Text>
        </Pressable>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Family</Text>
          <Text style={styles.subtitle}>
            {dogs.length > 0
              ? `${dogs.length} dog${dogs.length > 1 ? "s" : ""} in your family`
              : "아직 등록된 강아지가 없어요"}
          </Text>
        </View>

        {/* 목록 / Empty */}
        {dogs.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item, idx) => String(item.id || idx)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}  // 하단 스트립과 여백 확보
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={[styles.emptyWrap, { paddingBottom: 140 }]}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="paw-outline" size={28} color="#9AA4AF" />
            </View>
            <Text style={styles.emptyTitle}>No dogs yet</Text>
            <Text style={styles.emptyText}>우측 상단 Add 버튼으로 강아지 프로필을 추가해 보세요.</Text>
            <Pressable
              onPress={() => navigation.navigate("AddDogStep1", route.params || {})}
              style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={styles.primaryTxt}>Add a dog</Text>
            </Pressable>
          </View>
        )}

        {/* 하단 가족 스트립 (Black & White 무드) */}
        <View style={styles.footerStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.footerContent}
          >


          {(meSafe) ? (
  <View style={styles.memberItem}>
    <View style={styles.avatarWrap}>
      {meSafe.photoUri ? (
        <Image source={{ uri: meSafe.photoUri }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person-circle-outline" size={22} color="#9AA4AF" />
        </View>
      )}
    </View>
    <Text numberOfLines={1} style={styles.avatarName}>
      {meSafe.nickname || meSafe.username || "Me"}
    </Text>
  </View>
) : (
  // 로딩 중이거나 아직 사용자 없음
  <View style={styles.memberItem}>
    <View style={[styles.avatarWrap, styles.avatarPlaceholder]}>
      <Ionicons name="person-circle-outline" size={22} color="#9AA4AF" />
    </View>
    <Text numberOfLines={1} style={styles.avatarName}>Me</Text>
  </View>
)}

{/* Family (나 제외) */}
{(familySafe || []).map((m) => (
  <View key={m.id || m.username || m.nickname} style={styles.memberItem}>
    <View style={styles.avatarWrap}>
      {m.photoUri ? (
        <Image source={{ uri: m.photoUri }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person-outline" size={16} color="#9AA4AF" />
        </View>
      )}
    </View>
    <Text numberOfLines={1} style={styles.avatarName}>
      {m.nickname || m.username || "Member"}
    </Text>
  </View>
))}

            {/* Invite */}
            <Pressable
              onPress={() => navigation.navigate("InviteFamily")}
              style={({ pressed }) => [styles.invitePill, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Ionicons name="person-add-outline" size={16} color="#111" />
              <Text style={styles.inviteTxt}>Invite</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* --------- Design Tokens (Black & White) --------- */
const PRIMARY = "#000";
const BACKGROUND = "#fff";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";
const TEXT_DIM = "#6B7280";

const CARD_SHADOW = {
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 5,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1, backgroundColor: BACKGROUND, paddingHorizontal: 28, paddingTop: 50 },

  /* Top controls (절대 위치: 다른 화면과 동일 높이/여백) */
  backBtn: { position: "absolute", top: 10, left: 16, zIndex: 10 },
  addBtn: {
    position: "absolute", top: 10, right: 16, zIndex: 10,
    height: 34, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: PRIMARY,
    flexDirection: "row", alignItems: "center", gap: 6,
    ...CARD_SHADOW,
  },
  addTxt: { color: "#fff", fontWeight: "800" },

  /* Header */
  header: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: PRIMARY, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: TEXT_DIM, marginTop: 6 },

  /* Dog card — 크고 시원하게 */
  card: {
    marginTop: 20, 
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    padding: 16,
    minHeight: 140,
    ...CARD_SHADOW,
  },
  thumb: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA" },

  cardBody: { flex: 1, justifyContent: "center" },
  dogName: { fontSize: 22, fontWeight: "900", color: TEXT_DARK },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6, flexWrap: "wrap" },
  metaText: { fontSize: 15, color: TEXT_DARK, fontWeight: "700" },
  metaDim: { fontSize: 14, color: TEXT_DIM, fontWeight: "600" },

  /* Empty */
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff",
    ...CARD_SHADOW,
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: TEXT_DARK, marginTop: 10 },
  emptyText: { fontSize: 14, color: TEXT_DIM, textAlign: "center" },
  primaryBtn: {
    marginTop: 10, height: 46, borderRadius: 10, paddingHorizontal: 16,
    alignItems: "center", justifyContent: "center",
    backgroundColor: PRIMARY,
    ...CARD_SHADOW,
  },
  primaryTxt: { color: "#fff", fontWeight: "800" },

  /* Footer strip (family) */
  footerStrip: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: "#FFFFFFEE",
    borderTopWidth: 1, borderColor: BORDER,
  },
  footerContent: { alignItems: "center", paddingRight: 12 },

  memberItem: { alignItems: "center", marginRight: 12 },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, overflow: "hidden",
    backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarName: {
    marginTop: 4, fontSize: 11, color: TEXT_DARK, fontWeight: "700",
    maxWidth: 60, textAlign: "center",
  },

  invitePill: {
    height: 44, paddingHorizontal: 12, borderRadius: 22,
    backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  inviteTxt: { color: TEXT_DARK, fontWeight: "800" },

  /* Interaction */
  pressed: { transform: [{ scale: 0.99 }] },
});