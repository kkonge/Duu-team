
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InviteCheckScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Family & Invite</Text>
          <Text style={styles.subtitle}>앱을 사용 중인 가족이 있나요?</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.question}>
            가족과 함께 쓰면 초대코드로 계정을 연결해요.
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
              <Ionicons name="sparkles-outline" size={18} color="#5B6C5A" />
              <Text style={styles.btnSecondaryTxt}>아니요, 처음이에요!</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("UserProfile")}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="key-outline" size={18} color="#3F8C74" />
              <Text style={styles.btnPrimaryTxt}>네, 초대코드를 입력할게요</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_BG = "#ffffff";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF6E9", 
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
    color: "#5B7F6A",
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#6B7A6A",
  },

  card: {
    marginTop: 2,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  question: {
    fontSize: 16,
    color: "#415247",
    marginBottom: 16,
    lineHeight: 22,
  },

  buttonGroup: { gap: 12 },
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
    backgroundColor: "#F3F6F2",
    borderColor: "#E0E8DE",
  },
  btnSecondaryTxt: {
    color: "#5B6C5A",
    fontSize: 16,
    fontWeight: "700",
  },


  btnPrimary: {
    backgroundColor: "#E4F1E7",
    borderColor: "#D7E8DB",
  },
  btnPrimaryTxt: {
    color: "#3F8C74",
    fontSize: 16,
    fontWeight: "800",
  },

  pressed: { transform: [{ scale: 0.99 }] },
});