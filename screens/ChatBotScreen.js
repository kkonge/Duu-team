import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatBotScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dog = route.params?.selectedDog || null;

  const [messages, setMessages] = useState([
    {
      id: String(Date.now()),
      role: "bot",
      text:
        dog?.name
          ? `안녕! 나는 DoggyBot이야 🐾\n${dog.name}에 대해 뭐든 물어봐! (산책, 건강, 일기 정리 등)`
          : "안녕! 나는 DoggyBot이야 🐾\n강아지 산책/건강/일기, 뭐든 물어봐!",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = {
      id: String(Date.now()),
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setTyping(true);

    try {
      await new Promise((r) => setTimeout(r, 1200));
      const botText = "좋은 질문이야! 이 내용은 샘플 응답이야.\n백엔드 연결하면 진짜 답변으로 바뀔 거야 ✨";

      const botMsg = {
        id: String(Date.now() + 1),
        role: "bot",
        text: botText,
        createdAt: Date.now(),
      };
      setMessages((prev) => [botMsg, ...prev]);
    } catch (e) {
      const errMsg = {
        id: String(Date.now() + 2),
        role: "bot",
        text: "앗! 네트워크 오류가 났어요. 잠시 후 다시 시도해 주세요.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [errMsg, ...prev]);
    } finally {
      setTyping(false);
    }
  }, [input, dog]);

  const quickPrompts = [
    "오늘 산책은 몇 분이 좋을까?",
    "사료 급여량 추천해줘",
    "건강 체크리스트 알려줘",
    "오늘 일기 요약해줘",
  ];
  const onPrompt = (p) => setInput((v) => (v ? v : p));

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleRow, isUser ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <Image
              source={require("../assets/chat bot.png")}
              style={{ width: 35, height: 35, borderRadius: 13 }}
            />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleTxt, isUser && { color: "#2D5D9F" }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages.length]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EAF2FB" }}>
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2D5D9F" />
          </TouchableOpacity>
          <Text style={styles.title}>DOGGY BOT</Text>
          <View style={styles.iconBtn}>
            <Ionicons name="sparkles" size={18} color="#2D5D9F" />
          </View>
        </View>

        <View style={styles.subHeader}>
          <Text style={styles.subtitle}>DoggyBot에게 궁금한 것을 물어보세요!</Text>
        </View>

        {messages.length <= 2 && (
          <View style={styles.chipsRow}>
            {quickPrompts.map((p) => (
              <Pressable key={p} onPress={() => onPrompt(p)} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                <Ionicons name="help-circle" size={14} color="#2D5D9F" />
                <Text style={styles.chipTxt}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <FlatList
          ref={listRef}
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          data={messages}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          inverted
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {typing && (
          <View style={[styles.typingRow, { marginBottom: 74 }]}>
            <View style={styles.dot} />
            <View style={[styles.dot, { animationDelay: "120ms" }]} />
            <View style={[styles.dot, { animationDelay: "240ms" }]} />
            <Text style={styles.typingTxt}>DoggyBot is typing…</Text>
          </View>
        )}

        <View style={[styles.inputBar, { marginBottom: 74 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#8FA59A"
            style={styles.input}
            multiline
            maxLength={800}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              !input.trim() && { opacity: 0.45 },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="arrow-up" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.tabBar}>
  <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Diary")}>
    <Image source={require("../assets/ID.png")} style={styles.tabIcon} />
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.tabBtn, styles.tabBtn]}
    onPress={() => navigation.navigate("Home", { selectedDog: dog })}
  >
    <Image source={require("../assets/home.png")} style={styles.tabIcon} />
  </TouchableOpacity>

  <TouchableOpacity style={styles.tabCenter} onPress={() => navigation.navigate("ChatBot")}>
    <Image source={require("../assets/chat bot.png")} style={styles.tabIcon} />
  </TouchableOpacity>
</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// styles 

const styles = StyleSheet.create({
  blobA: {
    position: "absolute", top: -50, left: -60, width: 180, height: 180,
    borderRadius: 90, backgroundColor: "#D6E8FA", opacity: 0.35,
  },
  blobB: {
    position: "absolute", top: 100, right: -50, width: 140, height: 140,
    borderRadius: 70, backgroundColor: "#B6D6F2", opacity: 0.25,
  },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 6,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#E6F0FB", borderWidth: 1, borderColor: "#C3DAF1",
  },
  title: { fontSize: 25, fontWeight: "900", color: "#000" },

  subHeader: { paddingHorizontal: 16, marginTop: 6, marginBottom: 20, alignItems: "center" },
  subtitle: { color: "#5A7698", fontWeight: "700" },

  chipsRow: {
    paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap",
    gap: 8, marginBottom: 6
  },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
    backgroundColor: "#E6F0FB", borderWidth: 1, borderColor: "#C3DAF1",
  },
  chipTxt: { color: "#2D5D9F", fontWeight: "800", fontSize: 12 },

  bubbleRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6 },
  avatarWrap: {
    width: 35, height: 35, borderRadius: 14, overflow: "hidden",
    backgroundColor: "#E6F0FB", borderWidth: 1, borderColor: "#C3DAF1", marginRight: 6,
    alignItems: "center", justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  bubbleUser: {
    backgroundColor: "#BFD9F3",
    borderTopRightRadius: 6,
  },
  bubbleBot: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    borderWidth: 1, borderColor: "#C3DAF1",
  },
  bubbleTxt: { color: "#2E3F57", fontSize: 15, lineHeight: 21, fontWeight: "600" },

  typingRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, marginBottom: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#2D5D9F",
  },
  typingTxt: { color: "#5A7698", fontSize: 12, fontWeight: "700" },

  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    borderWidth: 1, borderColor: "#C3DAF1", color: "#1E3B61", fontWeight: "600",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    backgroundColor: "#2D5D9F",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },

  tabBar: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 20,
  height: 54,
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
tabIcon: {
  width: 42,
  height: 42,
  resizeMode: "contain",
},

   
});