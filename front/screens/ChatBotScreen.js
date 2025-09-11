// screens/ChatBotScreen.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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


const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";


function ChatTopCard({ dog }) {
  return (
    <View style={styles.topCard}>
      <View style={styles.topCardAvatarWrap}>
        <Image source={require("../assets/chat bot.png")} style={styles.topCardAvatar} />
        <View style={styles.onlineDot} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.topCardTitle}>DoggyBot</Text>
        <Text style={styles.topCardSub}>
          {dog?.name ? `${dog.name} 전담 비서에요 🐾` : "산책·식사·건강 무엇이든 물어보세요!"}
        </Text>
      </View>
      <View style={styles.topCardPill}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#111" />
        <Text style={styles.topCardPillTxt}>Tips</Text>
      </View>
    </View>
  );
}


function DayDivider({ label = "Today" }) {
  return (
    <View style={styles.dayDivider}>
      <View style={styles.dayDividerLine} />
      <Text style={styles.dayDividerTxt}>{label}</Text>
      <View style={styles.dayDividerLine} />
    </View>
  );
}

export default function ChatBotScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dog = route.params?.selectedDog || null;

  const [messages, setMessages] = useState([
    {
      id: String(Date.now()),
      role: "bot",
      text: dog?.name
        ? `안녕! 나는 DoggyBot이야 🐾\n${dog.name}에 대해 뭐든 물어봐! (산책, 건강, 일기 정리 등)`
        : "안녕! 나는 DoggyBot이야 🐾\n강아지 산책/건강/일기, 뭐든 물어봐!",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showChips, setShowChips] = useState(true); 
  const listRef = useRef(null);

 
  const hasUserMsg = useMemo(() => messages.some((m) => m.role === "user"), [messages]);

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
    setShowChips(false); 

    try {
      await new Promise((r) => setTimeout(r, 900));
      const botMsg = {
        id: String(Date.now() + 1),
        role: "bot",
        text: "좋은 질문이야! 이 내용은 샘플 응답이야.\n백엔드 연결하면 진짜 답변으로 바뀔 거야 ✨",
        createdAt: Date.now(),
      };
      setMessages((prev) => [botMsg, ...prev]);
    } catch (e) {
      setMessages((prev) => [
        {
          id: String(Date.now() + 2),
          role: "bot",
          text: "앗! 네트워크 오류가 났어요. 잠시 후 다시 시도해 주세요.",
          createdAt: Date.now(),
        },
        ...prev,
      ]);
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
      <View style={[styles.bubbleRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <Image source={require("../assets/chat bot.png")} style={{ width: 30, height: 30, borderRadius: 13 }} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleTxt, isUser && { color: TEXT }]}>{item.text}</Text>
          <Text style={[styles.metaTime, isUser && { alignSelf: "flex-end" }]}>
            {new Date(item.createdAt).toLocaleTimeString().slice(0, 5)}
          </Text>
          <View style={[styles.tail, isUser ? styles.tailRight : styles.tailLeft]} />
        </View>
      </View>
    );
  };

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [messages.length]);


  const shouldShowChips = showChips && !hasUserMsg && input.trim().length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding" })}>
  
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={TEXT} />
          </TouchableOpacity>
          <Text style={styles.title}>DOGGY BOT</Text>
          <TouchableOpacity onPress={() => {}} style={styles.iconBtn}>
            <Ionicons name="sparkles-outline" size={18} color={TEXT} />
          </TouchableOpacity>
        </View>

  
        <ChatTopCard dog={dog} />
        <DayDivider label="Today" />

        {shouldShowChips && (
          <View style={styles.chipsWrap}>
            <View style={styles.chipsRow}>
              {quickPrompts.map((p) => (
                <Pressable key={p} onPress={() => onPrompt(p)} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}>
                  <Ionicons name="help-circle-outline" size={14} color={TEXT} />
                  <Text style={styles.chipTxt}>{p}</Text>
                </Pressable>
              ))}
            </View>
           
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
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.3 }]} />
            <Text style={styles.typingTxt}>DoggyBot is typing…</Text>
          </View>
        )}

  
        <View style={[styles.inputBar, { marginBottom: 84 }]}>
          <TouchableOpacity style={styles.inputIconBtn}>
            <Ionicons name="add-outline" size={20} color={TEXT_DIM} />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={(t) => {
              setInput(t);
              if (t.length > 0 && showChips) setShowChips(false); //chip 숨기기
            }}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={TEXT_DIM}
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
          <TouchableOpacity style={styles.tabBtn} onPress={() => navigation.navigate("Id")}>
            <Ionicons name="person-outline" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => navigation.navigate("Home", { selectedDog: dog })}
          >
            <Ionicons name="home-outline" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, styles.tabCenter, styles.tabActive]} onPress={() => navigation.navigate("ChatBot")}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({

  header: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  title: { fontSize: 20, fontWeight: "900", color: TEXT, letterSpacing: 2 },


  topCard: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  topCardAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    position: "relative",
  },
  topCardAvatar: { width: 34, height: 34, borderRadius: 12, resizeMode: "contain" },
  onlineDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  topCardTitle: { fontSize: 16, fontWeight: "900", color: TEXT },
  topCardSub: { marginTop: 2, fontSize: 12, color: TEXT_DIM, fontWeight: "700" },
  topCardPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topCardPillTxt: { fontSize: 12, fontWeight: "900", color: TEXT },

  /* Day Divider */
  dayDivider: {
    marginHorizontal: 16,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayDividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dayDividerTxt: { fontSize: 12, fontWeight: "900", color: TEXT_DIM },

  /* Chips */
  chipsWrap: {
    paddingHorizontal: 16,
    marginBottom: 6,
    position: "relative",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  chipTxt: { color: TEXT, fontWeight: "800", fontSize: 12 },
  chipsClose: {
    position: "absolute",
    right: 10,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },

  /* Bubbles */
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", marginVertical: 6 },
  avatarWrap: {
    width: 35,
    height: 35,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: "relative",
  },
  bubbleUser: {
    backgroundColor: "#F3F4F6",
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bubbleBot: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bubbleTxt: { color: TEXT, fontSize: 15, lineHeight: 21, fontWeight: "600" },
  metaTime: {
    marginTop: 4,
    fontSize: 10,
    color: TEXT_DIM,
    fontWeight: "800",
    alignSelf: "flex-start",
  },
  tail: {
    position: "absolute",
    width: 10,
    height: 10,
    bottom: -1,
    transform: [{ rotate: "45deg" }],
  },
  tailLeft: {
    left: 10,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  tailRight: {
    right: 10,
    backgroundColor: "#F3F4F6",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },

  /* Typing */
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEXT },
  typingTxt: { color: TEXT_DIM, fontSize: 12, fontWeight: "700" },

  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
    fontWeight: "600",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  /*Tab  */
  tabBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tabBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tabCenter: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: BORDER, backgroundColor: "#fff" },
  tabActive: { backgroundColor: "#F9FAFB" },
});