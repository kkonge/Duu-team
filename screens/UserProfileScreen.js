import React, { useMemo, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

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
   

   const familyProfiles = [];

   navigation.navigate("FamilyCheck", {
     userProfile,
     familyProfiles,
     dogProfiles: [],
   });

  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.flex}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>About You</Text>

          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.avatarShadow}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person-circle-outline" size={72} color="#A3B39F" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

  

        <View style={styles.form}>
          <Text style={styles.label}>UserName</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.label}>NickName</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            style={styles.input}
            returnKeyType="next"
          />

         

          <Text style={styles.label}>Date Of Birth</Text>
          <Pressable style={styles.input} onPress={() => setShowDate(true)}>
            <Text style={{ color: dob ? "#111827" : "#9AA4AF" }}>
              {dob ? dob.toISOString().slice(0, 10) : "YYYY-MM-DD"}
            </Text>
          </Pressable>

          

          <View style={styles.genderRow}>
            <Pressable
              style={[styles.genderBtn, gender === "male" && styles.genderBtnOn]}
              onPress={() => setGender("male")}
            >
              <View style={[styles.radio, gender === "male" && styles.radioOn]}>
                {gender === "male" && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.genderTxt, gender === "male" && styles.genderTxtOn]}>
                Male
              </Text>
            </Pressable>

            <Pressable
              style={[styles.genderBtn, gender === "female" && styles.genderBtnOn]}
              onPress={() => setGender("female")}
            >
              <View style={[styles.radio, gender === "female" && styles.radioOn]}>
                {gender === "female" && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[styles.genderTxt, gender === "female" && styles.genderTxtOn]}
              >
                Female
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.roundBack} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#6E7F6C" />
            </TouchableOpacity>

            <Pressable
              disabled={!canSubmit}
              onPress={onContinue}
              style={({ pressed }) => [
                styles.primaryBtn,
                !canSubmit && { opacity: 0.5 },
                pressed && { transform: [{ scale: 0.99 }] },
              ]}
            >
              <Text style={styles.primaryTxt}>Continue</Text>
            </Pressable>
          </View>
        </View>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#EEF6E9" },
  header: { alignItems: "center", paddingTop: 25},
  title: { fontSize: 28, fontWeight: "800", color: "#5B7F6A", marginVertical: 8 },
  avatarWrap: { marginTop: 6, marginBottom: 20 },
  avatarShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  cameraBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    backgroundColor: "#6E9F89",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  form: {
    marginTop: 4,
    marginHorizontal: 18,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  label: { marginTop: 8, marginBottom: 6, color: "#415247", fontWeight: "700" },
  input: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    borderWidth: 1,
    borderColor: "#CFE2CF",
    backgroundColor: "#fff",

  },
  inputError: { borderColor: "#F87171" },

  genderRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 12, marginBottom: 8 },
  genderBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  genderBtnOn: {},
  genderTxt: { color: "#5B6C5A", fontSize: 16 },
  genderTxtOn: { fontWeight: "800", color: "#3F8C74" },

  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#B7C8B7",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: "#3F8C74" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3F8C74" },

  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  roundBack: {
    width: 52, height: 44, borderRadius: 22, backgroundColor: "#F3F6F2",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E0E8DE",
  },
  primaryBtn: {
    flex: 1, marginLeft: 12, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#E4F1E7", borderWidth: 1, borderColor: "#D7E8DB",
  },
  primaryTxt: { color: "#3F8C74", fontWeight: "800", fontSize: 16 },

  backButton: { position: "absolute", top: 10, left: 16, zIndex: 10 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  modalSheet: { width: "86%", borderRadius: 16, backgroundColor: "#fff", paddingVertical: 12, alignItems: "center" },
  modalDone: { marginTop: 6, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#F2F6F3" },
});