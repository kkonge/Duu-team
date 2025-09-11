// screens/SettingsScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFamily } from "../context/FamilyContext";

const BORDER = "#E5E7EB";
const INK = "#111827";
const INK_DIM = "#6B7280";
const CARD_BG = "#fff";
const BG = "#fff";

const DOGS_KEY = "DOG_PROFILES_V1";

/* -------------------- storage helpers for dogs -------------------- */
async function loadDogs() {
  try {
    const raw = await AsyncStorage.getItem(DOGS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
async function saveDogs(list) {
  await AsyncStorage.setItem(DOGS_KEY, JSON.stringify(list));
}

/* -------------------- small ui -------------------- */
function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value || "-"}
      </Text>
    </View>
  );
}
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
function IconBtn({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn} hitSlop={8}>
      <Ionicons name={icon} size={18} color={INK} />
    </TouchableOpacity>
  );
}

/* -------------------- main screen -------------------- */
export default function SettingsScreen() {
  const nav = useNavigation();
  const { isLoaded, activeUserId, getUser, upsertUser } = useFamily();

  const me = useMemo(() => getUser() || {}, [getUser, activeUserId, isLoaded]);

  // local edit buffers (user)
  const [name, setName] = useState(me?.username || "");
  const [nick, setNick] = useState(me?.nickname || "");
  const [photoUri, setPhotoUri] = useState(me?.photoUri || null);

  // dogs
  const [dogs, setDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(true);

  // dog editor modal
  const [openDog, setOpenDog] = useState(false);
  const [editDog, setEditDog] = useState(null);
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogBirth, setDogBirth] = useState(""); // YYYY-MM-DD
  const [dogPhoto, setDogPhoto] = useState(null);

  // load initial
  useEffect(() => {
    setName(me?.username || "");
    setNick(me?.nickname || "");
    setPhotoUri(me?.photoUri || null);
  }, [me?.username, me?.nickname, me?.photoUri]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingDogs(true);
        const arr = await loadDogs();
        if (mounted) setDogs(arr);
      } finally {
        if (mounted) setLoadingDogs(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  /* -------------------- actions: user -------------------- */
  const pickUserPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("권한 필요", "사진 접근 권한을 허용해주세요.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) setPhotoUri(res.assets?.[0]?.uri || null);
  };

  const saveUser = async () => {
    if (!activeUserId) return Alert.alert("오류", "활성 사용자가 없습니다.");
    const payload = {
      id: activeUserId,
      username: name?.trim() || "",
      nickname: nick?.trim() || "",
      photoUri: photoUri || null,
    };
    await upsertUser(payload);
    Alert.alert("저장됨", "사용자 정보가 업데이트되었어요.");
  };

  /* -------------------- actions: dogs -------------------- */
  const openDogEditor = (dog) => {
    setEditDog(dog || null);
    setDogName(dog?.name || "");
    setDogBreed(dog?.breed || "");
    setDogBirth(dog?.birth ? String(dog.birth).slice(0, 10) : "");
    setDogPhoto(dog?.imageUri || dog?.photo || null);
    setOpenDog(true);
  };
  const pickDogPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("권한 필요", "사진 접근 권한을 허용해주세요.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled) setDogPhoto(res.assets?.[0]?.uri || null);
  };
  const saveDog = async () => {
    const n = dogName.trim();
    if (!n) return Alert.alert("입력 필요", "강아지 이름을 입력해주세요.");
    const next = [...dogs];
    if (editDog) {
      const idx = next.findIndex((d) => d.id === editDog.id);
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          name: n,
          breed: dogBreed.trim(),
          birth: dogBirth || next[idx].birth || null,
          imageUri: dogPhoto || null,
          photo: dogPhoto || null,
        };
      }
    } else {
      const id = `dog_${Date.now()}`;
      next.unshift({
        id,
        name: n,
        breed: dogBreed.trim(),
        birth: dogBirth || null,
        imageUri: dogPhoto || null,
        photo: dogPhoto || null,
      });
    }
    setDogs(next);
    await saveDogs(next);
    setOpenDog(false);
  };
  const deleteDog = async (dog) => {
    Alert.alert("삭제", `${dog.name} 프로필을 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          const next = dogs.filter((d) => d.id !== dog.id);
          setDogs(next);
          await saveDogs(next);
        },
      },
    ]);
  };

  /* -------------------- render -------------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={20} color={INK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* User Profile */}
        <Section title="사용자 프로필">
          <View style={styles.userRow}>
            <TouchableOpacity onPress={pickUserPhoto} activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPh]}>
                    <Ionicons name="person-outline" size={24} color="#9AA4AF" />
                  </View>
                )}
                <View style={styles.camBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="예: 김콩집사"
                placeholderTextColor={INK_DIM}
                style={styles.input}
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>별명</Text>
              <TextInput
                value={nick}
                onChangeText={setNick}
                placeholder="예: 엄마, 아빠 등"
                placeholderTextColor={INK_DIM}
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity onPress={saveUser} style={styles.primaryBtn} activeOpacity={0.9}>
            <Text style={styles.primaryBtnTxt}>저장</Text>
          </TouchableOpacity>
        </Section>

        {/* Dogs */}
        <Section title="강아지 프로필">
          {loadingDogs ? (
            <Text style={{ color: INK_DIM }}>불러오는 중…</Text>
          ) : dogs.length === 0 ? (
            <Text style={{ color: INK_DIM }}>등록된 강아지가 없어요.</Text>
          ) : (
            dogs.map((d) => (
              <View key={d.id} style={styles.dogCard}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {d.imageUri ? (
                    <Image source={{ uri: d.imageUri }} style={styles.dogThumb} />
                  ) : (
                    <View style={[styles.dogThumb, styles.dogThumbPh]}>
                      <Ionicons name="paw-outline" size={18} color="#9AA4AF" />
                    </View>
                  )}
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.dogName}>{d.name || "-"}</Text>
                    <Text style={styles.dogMeta} numberOfLines={1}>
                      {d.breed || "-"} {d.birth ? `· ${String(d.birth).slice(0, 10)}` : ""}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <IconBtn icon="create-outline" onPress={() => openDogEditor(d)} />
                  <IconBtn icon="trash-outline" onPress={() => deleteDog(d)} />
                </View>
              </View>
            ))
          )}

          <TouchableOpacity onPress={() => openDogEditor(null)} style={[styles.ghostBtn, { marginTop: 10 }]} activeOpacity={0.9}>
            <Ionicons name="add" size={16} color={INK} />
            <Text style={styles.ghostBtnTxt}>강아지 추가</Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>

      {/* Dog editor modal */}
      <Modal visible={openDog} transparent animationType="slide" onRequestClose={() => setOpenDog(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editDog ? "강아지 수정" : "강아지 추가"}</Text>
              <TouchableOpacity onPress={() => setOpenDog(false)}>
                <Ionicons name="close" size={20} color={INK} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <TouchableOpacity onPress={pickDogPhoto} activeOpacity={0.9}>
                <View style={styles.dogAvatarWrap}>
                  {dogPhoto ? (
                    <Image source={{ uri: dogPhoto }} style={styles.dogAvatar} />
                  ) : (
                    <View style={[styles.dogAvatar, styles.avatarPh]}>
                      <Ionicons name="paw-outline" size={26} color="#9AA4AF" />
                    </View>
                  )}
                  <View style={styles.camBadge}>
                    <Ionicons name="camera" size={14} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              value={dogName}
              onChangeText={setDogName}
              placeholder="예: 콩이"
              placeholderTextColor={INK_DIM}
              style={styles.input}
            />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>견종</Text>
            <TextInput
              value={dogBreed}
              onChangeText={setDogBreed}
              placeholder="예: 푸들"
              placeholderTextColor={INK_DIM}
              style={styles.input}
            />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>생년월일 (YYYY-MM-DD)</Text>
            <TextInput
              value={dogBirth}
              onChangeText={setDogBirth}
              placeholder="예: 2021-07-14"
              placeholderTextColor={INK_DIM}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.sheetBtns}>
              <TouchableOpacity onPress={() => setOpenDog(false)} style={styles.btnGhost}>
                <Text style={styles.btnGhostTxt}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveDog} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryTxt}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* -------------------- styles -------------------- */
const AVA = 68;

const styles = StyleSheet.create({
  header: {
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    backgroundColor: BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: "900", color: INK, letterSpacing: 1 },

  section: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  sectionTitle: { fontSize: 13, color: INK_DIM, fontWeight: "800", marginBottom: 10 },

  userRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { position: "relative" },
  avatar: { width: AVA, height: AVA, borderRadius: AVA / 2, backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER },
  avatarPh: { alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA" },
  camBadge: {
    position: "absolute", right: -2, bottom: -2,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#111", borderWidth: 2, borderColor: "#fff",
  },

  inputLabel: { color: INK_DIM, fontSize: 12, fontWeight: "800", marginBottom: 6, marginLeft: 2 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    color: INK,
    backgroundColor: "#fff",
    fontWeight: "700",
  },

  primaryBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  primaryBtnTxt: { color: "#fff", fontWeight: "900" },

  dogCard: {
    borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 8,
  },
  dogThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: "#FAFAFA", borderWidth: 1, borderColor: BORDER },
  dogThumbPh: { alignItems: "center", justifyContent: "center" },
  dogName: { fontWeight: "900", color: INK },
  dogMeta: { color: INK_DIM, fontWeight: "700", marginTop: 2, fontSize: 12 },

  ghostBtn: {
    height: 42, borderRadius: 12, borderWidth: 1, borderColor: BORDER,
    backgroundColor: "#F9FAFB",
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", gap: 6,
  },
  ghostBtnTxt: { color: INK, fontWeight: "900" },

  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: BORDER,
  },

  // modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, borderTopWidth: 1, borderColor: BORDER },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: "900", color: INK },
  sheetBtns: { flexDirection: "row", gap: 10, marginTop: 14 },
  btnGhost: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 12, alignItems: "center", justifyContent: "center", height: 44, backgroundColor: "#fff" },
  btnGhostTxt: { color: INK, fontWeight: "800" },
  btnPrimary: { flex: 1, backgroundColor: "#111", borderRadius: 12, alignItems: "center", justifyContent: "center", height: 44 },
  btnPrimaryTxt: { color: "#fff", fontWeight: "900" },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  rowLabel: { color: INK_DIM, fontWeight: "700" },
  rowValue: { color: INK, fontWeight: "800", flexShrink: 1, marginLeft: 10 },
});