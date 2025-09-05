// screens/DiaryDetailScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const LOCAL_KEY = "@diary_local_entries";


const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export default function DiaryDetailScreen({ route, navigation }) {
  const { diaryId } = route.params || {};
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const local = raw ? JSON.parse(raw) : [];
        const found = local.find((it) => String(it.id) === String(diaryId));
        setEntry(found || null);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [diaryId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;
  if (!entry) return <View style={s.center}><Text>일기를 불러오지 못했습니다.</Text></View>;

  const photos = entry.photos || [];
  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    if (i !== index) setIndex(i);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>

      <View style={s.headerRow}>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>DIARY</Text>
        <View style={s.iconBtn}>
          <Ionicons name="calendar-outline" size={18} color={TEXT} />
        </View>
      </View>

 
      <View style={s.metaCard}>
        <View style={{ flex: 1 }}>
          <Text style={s.metaTop}>기록 날짜</Text>
          <Text style={s.metaMain}>{formatDate(entry.date)}</Text>
        </View>
        <View style={s.chipsRow}>
          <View style={s.chip}>
            <Ionicons name="images-outline" size={14} color={TEXT} />
            <Text style={s.chipTxt}>사진 · {photos.length}</Text>
          </View>
          <View style={s.chip}>
            <Ionicons name="time-outline" size={14} color={TEXT} />
            <Text style={s.chipTxt}>{formatDateTime(entry.date)}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
    
        {photos.length > 0 ? (
          <View style={s.carouselWrap}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
              style={s.carousel}
            >
              {photos.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={s.slideWrap}>
                  <Image source={{ uri }} style={s.slide} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>

         
            <View style={s.indexBadge}>
              <Text style={s.indexTxt}>
                {index + 1}/{photos.length}
              </Text>
            </View>

      
            <View style={s.dots}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[s.dot, i === index && s.dotActive]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={[s.carouselPlaceholder, CARD_SHADOW]}>
            <Ionicons name="image-outline" size={26} color={TEXT_DIM} />
            <Text style={s.placeholderTxt}>사진이 없어요</Text>
          </View>
        )}

  
        {!!entry.text && (
          <View style={s.bodyCard}>
            <Text style={s.bodyText}>{entry.text}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- utils ---------- */
function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* ---------- styles ---------- */
const slideW = width - 32;
const slideH = slideW * 0.66;

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BG },


  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 6,
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
    ...CARD_SHADOW,
  },
  headerTitle: { fontSize: 16, fontWeight: "900", color: TEXT, letterSpacing: 2 },


  metaCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    ...CARD_SHADOW,
  },
  metaTop: { fontSize: 12, color: TEXT_DIM, fontWeight: "800" },
  metaMain: { fontSize: 20, color: TEXT, fontWeight: "900", marginTop: 4 },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F9FAFB",
  },
  chipTxt: { fontSize: 12, fontWeight: "900", color: TEXT },


  carouselWrap: { marginBottom: 12 },
  carousel: { borderRadius: 14 },
  slideWrap: { width: slideW, height: slideH, marginRight: 10, borderRadius: 14, overflow: "hidden", backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: BORDER, ...CARD_SHADOW },
  slide: { width: "100%", height: "100%" },

  indexBadge: {
    position: "absolute",
    right: 22,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(17,17,17,0.72)",
  },
  indexTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },

  dots: { marginTop: 10, alignSelf: "center", flexDirection: "row", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: TEXT },

  
  carouselPlaceholder: {
    height: slideH,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 14,
    ...CARD_SHADOW,
  },
  placeholderTxt: { color: TEXT_DIM, fontWeight: "800" },

 
  bodyCard: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    ...CARD_SHADOW,
  },
  bodyText: { fontSize: 15, lineHeight: 22, color: TEXT, fontWeight: "600" },
});