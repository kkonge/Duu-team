import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InviteCheckScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A"  />
        </TouchableOpacity>

       
        <View style={styles.header}>
          <Text style={styles.title}>Family & Invite</Text>
          <Text style={styles.subtitle}>앱을 사용 중인 가족이 있나요?</Text>
        </View>

 
        <View style={styles.card}>
          <Text style={styles.question}>
            초대코드로 계정을 연결해요
          </Text>

          <View style={styles.buttonGroup}>
           
            <Pressable
              onPress={() => navigation.navigate("AddDogStep1")}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSecondary,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="sparkles-outline" size={18} color="#3A6FA1" />
              <Text style={styles.btnSecondaryTxt}>아니요, 처음이에요!</Text>
            </Pressable>

            {/* 초대 코드 입력 */}
            <Pressable
              onPress={() => navigation.navigate("UserProfile")}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="key-outline" size={18} color="#2D5D9F" />
              <Text style={styles.btnPrimaryTxt}>
                네, 초대코드를 입력할게요
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}


const PRIMARY = "#2D5D9F";
const SECONDARY = "#5B8DEF";
const BACKGROUND = "#F3F6FA";
const CARD_BG = "#FFFFFF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 18,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 16,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: PRIMARY,
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
  },
  card: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  question: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 18,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 14,
  },
  btn: {
    height: 50,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },


  btnSecondary: {
    backgroundColor: "#EDF2FB",
    borderColor: "#D5E1F4",
  },
  btnSecondaryTxt: {
    color: "#3A6FA1",
    fontSize: 16,
    fontWeight: "700",
  },


  btnPrimary: {
    backgroundColor: "#E1ECF9",
    borderColor: "#C3D7F3",
  },
  btnPrimaryTxt: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "800",
  },

  pressed: {
    transform: [{ scale: 0.98 }],
  },
});