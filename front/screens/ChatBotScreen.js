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

    // 사용자 메시지 
    const userMsg = {
      id: String(Date.now()),
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };
    setMessages((prev) => [userMsg, ...prev]);
    setInput("");

    // 타이핑 표시
    setTyping(true);

    // 백엔드 호출해쓸떄..?
    try {
      /** 실제 연결 시:
      const res = await fetch("https://<YOUR_BACKEND>/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: trimmed,
          dogContext: dog ? {
            id: dog.id, name: dog.name, breed: dog.breed, birth: dog.birth,
            sex: dog.sex, neutered: dog.neutered, weight: dog.weight, unit: dog.unit
          } : null
        }),
      });
      const data = await res.json();
      const botText = data?.answer ?? "서버에서 응답을 받지 못했어요.";
      */

      
      await new Promise((r) => setTimeout(r, 1200));
      const botText =
        "좋은 질문이야! 이 내용은 샘플 응답이야.\n백엔드 연결하면 진짜 답변으로 바뀔 거야 ✨";

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

  // 빠른 질문 칩
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
              source={require("../assets/icon.png")}
              style={{ width: 26, height: 26, borderRadius: 13 }}
            />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleTxt, isUser && { color: "#0A372B" }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {

    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages.length]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EEF6E9" }}>
      {/* 배경 데코 */}
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#5B7F6A" />
          </TouchableOpacity>
          <Text style={styles.title}>DOGGY BOT</Text>
          <View style={styles.iconBtn}>
            <Ionicons name="sparkles" size={18} color="#5B7F6A" />
          </View>
        </View>

        {/* 서브타이틀 */}
        <View style={styles.subHeader}>
          <Text style={styles.subtitle}>
            DoggyBot에게 궁금한 것을 물어보세요!
          </Text>
        </View>

        {/* 질문 칩 */}
        {messages.length <= 2 && (
          <View style={styles.chipsRow}>
            {quickPrompts.map((p) => (
              <Pressable key={p} onPress={() => onPrompt(p)} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                <Ionicons name="help-circle" size={14} color="#3F8C74" />
                <Text style={styles.chipTxt}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* 메시지 리스트 */}
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

        {/* 타이핑 표시 */}
        {typing && (
          <View style={[styles.typingRow, { marginBottom: 74 }]}>
            <View style={styles.dot} />
            <View style={[styles.dot, { animationDelay: "120ms" }]} />
            <View style={[styles.dot, { animationDelay: "240ms" }]} />
            <Text style={styles.typingTxt}>DoggyBot is typing…</Text>
          </View>
        )}

        {/* 입력 영역 */}
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

        {/* 하단 탭 */}
        <View style={styles.miniTab}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Diary")}>
            <Ionicons name="book-outline" size={20} color="#2f2f2f" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn]} onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home" size={22} color="#2f2f2f" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, styles.tabCenter]} onPress={() => {}}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2f2f2f" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  blobA: {
    position: "absolute", top: -50, left: -60, width: 180, height: 180,
    borderRadius: 90, backgroundColor: "#C9F0D1", opacity: 0.35,
  },
  blobB: {
    position: "absolute", top: 100, right: -50, width: 140, height: 140,
    borderRadius: 70, backgroundColor: "#B8E5FF", opacity: 0.25,
  },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 6,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#EAF4EE", borderWidth: 1, borderColor: "#D7E8DB",
  },
  title: { fontSize: 25, fontWeight: "900", color: "#111" },

  subHeader: { paddingHorizontal: 16, marginTop: 6, marginBottom: 20, alignItems: "center" },
  subtitle: { color: "#6B7A6A", fontWeight: "700" },

  chipsRow: {
    paddingHorizontal: 12, flexDirection: "row", flexWrap: "wrap",
    gap: 8, marginBottom: 6
  },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18,
    backgroundColor: "#EAF4EE", borderWidth: 1, borderColor: "#D7E8DB",
  },
  chipTxt: { color: "#3F8C74", fontWeight: "800", fontSize: 12 },

  bubbleRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6 },
  avatarWrap: {
    width: 28, height: 28, borderRadius: 14, overflow: "hidden",
    backgroundColor: "#EAF4EE", borderWidth: 1, borderColor: "#D7E8DB", marginRight: 6,
    alignItems: "center", justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  bubbleUser: {
    backgroundColor: "#C9F0D1",
    borderTopRightRadius: 6,
  },
  bubbleBot: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    borderWidth: 1, borderColor: "#E0E8DE",
  },
  bubbleTxt: { color: "#35443C", fontSize: 15, lineHeight: 21, fontWeight: "600" },

  typingRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, marginBottom: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#5B7F6A",
  },
  typingTxt: { color: "#6B7A6A", fontSize: 12, fontWeight: "700" },

  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    borderWidth: 1, borderColor: "#D7E8DB", color: "#0A372B", fontWeight: "600",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    backgroundColor: "#3F8C74",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },

  miniTab: {
    position: "absolute", left: 16, right: 16, bottom: 16,
    height: 58, backgroundColor: "#BFEFC7",
    borderRadius: 26, flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  tabBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tabCenter: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.65)" },
});