import React, { useState, memo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";


const InputRow = memo(function InputRow({ icon, children, styles }) {
  return (
    <View style={styles.inputWrap}>
      <View style={styles.leftIcon} pointerEvents="none">
        <Ionicons name={icon} size={18} color="#94A3B8" />
      </View>
      {children}
    </View>
  );
});

const Divider = memo(function Divider({ styles }) {
  return <View style={styles.divider} />;
});


export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [photo, setPhoto] = useState(null);
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState(null);
  const [showDate, setShowDate] = useState(false);

  const canSubmit =
    nickname.trim().length > 0 &&
    username.trim().length > 0 &&
    !!dob &&
    !!gender;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const onChangeDate = (_, date) => {
    if (Platform.OS === "android") setShowDate(false);
    if (date) setDob(date);
  };

  const onContinue = () => {
    const userProfile = {
      id: "me",
      name: nickname || username,
      username,
      nickname,
      gender,
      dob: dob ? dob.toISOString() : null,
      photoUri: photo || null, 
    };
    navigation.navigate("FamilyCheck", { userProfile, familyProfiles: [], dogProfiles: [] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#888" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        
          <View style={styles.header}>
            <Text style={styles.title}>About You</Text>
            <Text style={styles.subtitle}>당신의 프로필을 작성해주세요!</Text>

           
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                <View style={styles.avatarShadow}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person-circle-outline" size={72} color="#C3C3C3" />
                    </View>
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

     
          <View style={styles.card}>
       
            <Text style={styles.label}>이름</Text>
            <InputRow icon="person-outline" styles={styles}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="이름 입력"
                placeholderTextColor="#9AA4AF"
                autoCapitalize="none"
                style={styles.input}
                returnKeyType="next"
              />
            </InputRow>


            <Text style={styles.label}>별명</Text>
            <InputRow icon="happy-outline" styles={styles}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                placeholder="별명 입력"
                placeholderTextColor="#9AA4AF"
                style={styles.input}
                returnKeyType="next"
              />
            </InputRow>

            <Divider styles={styles} />

          
            <Text style={styles.sectionTitle}>생년월일</Text>
            <Pressable onPress={() => setShowDate(true)}>
              <InputRow icon="calendar-outline" styles={styles}>
                <View style={[styles.input, styles.inputReadonly]}>
                  <Text style={{ color: dob ? "#111827" : "#9AA4AF", fontSize: 15 }}>
                    {dob ? dob.toISOString().slice(0, 10) : "YYYY-MM-DD"}
                  </Text>
                </View>
              </InputRow>
            </Pressable>

            <Divider styles={styles} />

            {/* 성별 */}
            <Text style={styles.sectionTitle}>성별</Text>
            <View style={styles.genderRow}>
              <Pressable
                onPress={() => setGender("male")}
                style={[styles.genderPill, gender === "male" && styles.genderPillOn]}
              >
                <Ionicons
                  name="male-outline"
                  size={16}
                  color={gender === "male" ? "#fff" : "#374151"}
                />
                <Text style={[styles.genderTxt, gender === "male" && styles.genderTxtOn]}>남자</Text>
              </Pressable>

              <Pressable
                onPress={() => setGender("female")}
                style={[styles.genderPill, gender === "female" && styles.genderPillOn]}
              >
                <Ionicons
                  name="female-outline"
                  size={16}
                  color={gender === "female" ? "#fff" : "#374151"}
                />
                <Text style={[styles.genderTxt, gender === "female" && styles.genderTxtOn]}>여자</Text>
              </Pressable>
            </View>

            {/* CTA */}
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={onContinue}
              style={[styles.submitBtn, !canSubmit && { opacity: 0.5 }]}
            >
              <Text style={styles.submitTxt}>계속하기</Text>
            </TouchableOpacity>
          </View>

          {/* iOS Date Picker 모달 */}
          {Platform.OS === "ios" ? (
            <Modal
              visible={showDate}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDate(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={styles.modalSheet}>
                  <DateTimePicker
                    value={dob || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    onChange={(_, d) => d && setDob(d)}
                    maximumDate={new Date()}
                  />
                  <TouchableOpacity style={styles.modalDone} onPress={() => setShowDate(false)}>
                    <Text style={{ fontWeight: "600" }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            showDate && (
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display="calendar"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------- 디자인 토큰 --------- */
const PRIMARY = "#000";
const BACKGROUND = "#fff";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },


  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingTop: 50,
  },


  scrollContent: {
    paddingBottom: 40,
  },

 
  backBtn: { position: "absolute", top: 10, left: 16, zIndex: 10 },

 
  header: { alignItems: "center", gap: 6, marginBottom: 12, paddingHorizontal: 28 },
  title: { fontSize: 28, fontWeight: "800", color: "#000", letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: "#444", textAlign: "center", opacity: 0.85, lineHeight: 20 },

  avatarWrap: { marginTop: 6, marginBottom: 6 },
  avatarShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  cameraBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "#111",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  // ⬇️ 카드 자체에 좌우 마진을 줘서 그림자 공간 확보
  card: {
    marginTop: 16,
    marginHorizontal: 28,   // ⭐️ 핵심: 카드 좌우 여백
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  label: { marginTop: 8, marginBottom: 12, color: "#1E293B", fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 8, opacity: 0.9 },

  inputWrap: {
    position: "relative",
    justifyContent: "center",
    height: 52,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingLeft: 44,
    paddingRight: 12,
  },

  input: {
    height: "100%",
    fontSize: 15,
    color: "#111827",
  },
  inputReadonly: { justifyContent: "center" },

  leftIcon: { position: "absolute", left: 14, zIndex: 1 },

  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },

  genderRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 22,
    marginTop: 2,
    marginBottom: 6,
  },
  genderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  genderPillOn: { backgroundColor: "#111", borderColor: "#111" },
  genderTxt: { color: "#374151", fontSize: 14.5, fontWeight: "600" },
  genderTxtOn: { color: "#fff" },

  submitBtn: {
    marginTop: 14,
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  submitTxt: { fontSize: 17, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  modalSheet: { width: "86%", borderRadius: 16, backgroundColor: "#fff", paddingVertical: 12, alignItems: "center" },
  modalDone: { marginTop: 6, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#E2E8F0" },
});