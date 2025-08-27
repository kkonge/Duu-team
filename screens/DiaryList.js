
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, SectionList, Image, TouchableOpacity, ActivityIndicator,
  RefreshControl, StyleSheet, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const LOCAL_KEY = "@diary_local_entries";
const { width: SCREEN_W } = Dimensions.get("window");


const BG = "#fff";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_DIM = "#6B7280";
const SOFT = "#F9FAFB";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};


const LIST_HPAD = 16;
const CARD_PAD   = 12;
const CONTENT_W  = SCREEN_W - (LIST_HPAD * 2) - (CARD_PAD * 2);
/* 안정적 비율(약 16:9 근사) */
const GRID_H     = Math.round(CONTENT_W * 0.52);

export default function DiaryList({ onPressItem, onPressWrite }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocal = useCallback(async () => {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    const local = raw ? JSON.parse(raw) : [];
    local.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return local;
  }, []);

  const fetchAll = useCallback(async () => {
    const local = await loadLocal();
    setItems(local);
  }, [loadLocal]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchAll();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  const sections = useMemo(() => {
    if (!items.length) return [];
    const map = new Map();
    for (const it of items) {
      const key = toYmd(it.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;

  if (!items.length) {
    return (
      <View style={[s.center, { flex: 1 }]}>
        <Ionicons name="book-outline" size={36} color={TEXT_DIM} />
        <Text style={{ marginTop: 8, color: TEXT_DIM, fontWeight: "700" }}>
          아직 작성된 일기가 없어요
        </Text>
        <TouchableOpacity style={s.ghostBtn} onPress={onPressWrite} activeOpacity={0.9}>
          <Ionicons name="add" size={18} color={TEXT} />
          <Text style={{ color: TEXT, fontWeight: "900", marginLeft: 6 }}>첫 일기 쓰기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => <DiaryCard item={item} onPress={() => onPressItem?.(item)} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={s.sectionHeader}>
            <View style={s.sectionLine} />
            <Text style={s.sectionTitle}>{title}</Text>
            <View style={s.sectionLine} />
          </View>
        )}
        stickySectionHeadersEnabled
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111" />}
        contentContainerStyle={{ paddingBottom: 180, paddingTop: 6 }}
      />


      <View pointerEvents="box-none" style={s.fabWrap}>
        <TouchableOpacity style={s.fab} onPress={onPressWrite} activeOpacity={0.9}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={s.fabTxt}>  새 일기 쓰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DiaryCard({ item, onPress }) {
  const photos = Array.isArray(item.photos) ? item.photos.filter(Boolean) : [];
  const authorName = item.authorName || "AUTHOR";
  const timeText = toYmdHm(item.date);
  const mood = item.mood;
  const tags = item.tags || [];

  return (
    <View style={s.cardWrap}>
      <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
        {/* 헤더 */}
        <View style={s.rowBetween}>
          <View style={s.avatarRow}>
            <View style={s.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={s.author}>{authorName}</Text>
              <Text style={s.timeText}>{timeText}</Text>
            </View>
          </View>
          {!!mood && <MoodChip mood={mood} />}
        </View>


        {!!item.text && <Text style={s.bodyText} numberOfLines={3}>{item.text}</Text>}

   
        {!!photos.length && <PhotoGrid photos={photos} />}

   
        {!!tags.length && (
          <View style={s.tagsRow}>
            {tags.slice(0, 3).map((t) => (
              <View key={t} style={s.tagChip}>
                <Text style={s.tagTxt}>#{t}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}


function PhotoGrid({ photos }) {
  const list = photos.slice(0, 4);
  const extra = photos.length - list.length;
  const GAP = 8;

  return (
    <View style={[s.gridWrap, { padding: GAP }]}>
      {list.length === 1 && (
        <Block w={CONTENT_W - GAP*2} h={GRID_H} uri={list[0]} />
      )}

      {list.length === 2 && (
        <Row gap={GAP} w={CONTENT_W - GAP*2} h={GRID_H}>
          <Cell uri={list[0]} />
          <Cell uri={list[1]} />
        </Row>
      )}

      {list.length === 3 && (
        <Row gap={GAP} w={CONTENT_W - GAP*2} h={GRID_H}>
          <Cell uri={list[0]} flex={62} />
          <Col gap={GAP}>
            <Cell uri={list[1]} />
            <Cell uri={list[2]} />
          </Col>
        </Row>
      )}

      {list.length === 4 && (
        <Wrap w={CONTENT_W - GAP*2} h={GRID_H} gap={GAP}>
          {[0,1,2,3].map((i) => (
            <Half key={i} gap={GAP}>
              <Image source={{ uri: list[i] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              {i === 3 && photos.length > 4 && (
                <View style={s.moreOverlay}>
                  <Text style={s.moreTxt}>+{extra}</Text>
                </View>
              )}
            </Half>
          ))}
        </Wrap>
      )}

 
      <View style={s.countBadge}>
        <Ionicons name="images-outline" size={12} color="#fff" />
        <Text style={s.countTxt}>{photos.length}</Text>
      </View>
    </View>
  );
}


function Block({ w, h, uri }) {
  return (
    <View style={{ width: w, height: h, borderRadius: 12, overflow: "hidden" }}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </View>
  );
}
function Row({ children, gap, w, h }) {
  return <View style={{ flexDirection: "row", gap, width: w, height: h }}>{children}</View>;
}
function Col({ children, gap }) {
  return <View style={{ flex: 38, justifyContent: "space-between", gap }}>{children}</View>;
}
function Cell({ uri, flex = 1 }) {
  return (
    <View style={{ flex, borderRadius: 12, overflow: "hidden" }}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </View>
  );
}
function Wrap({ children, w, h, gap }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap, width: w, height: h }}>{children}</View>;
}
function Half({ children, gap }) {
  return (
    <View
      style={{
        width: (CONTENT_W - gap*3) / 2,
        height: (GRID_H - gap) / 2,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

function MoodChip({ mood }) {
  const icon =
    mood === "happy" ? "happy-outline" :
    mood === "walk"  ? "walk-outline"  :
    mood === "health"? "medkit-outline": "sparkles-outline";
  const label =
    mood === "happy" ? "기분좋음" :
    mood === "walk"  ? "산책"     :
    mood === "health"? "건강"     : "메모";
  return (
    <View style={s.moodChip}>
      <Ionicons name={icon} size={12} color={TEXT} />
      <Text style={s.moodTxt}>{label}</Text>
    </View>
  );
}

/* utils */
function toYmd(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
function toYmdHm(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

/* styles */
const s = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },

  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: LIST_HPAD, marginTop: 12, marginBottom: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#EDF0F3" },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: "#9AA4AF" },

  cardWrap: { paddingHorizontal: LIST_HPAD, marginBottom: 8 },
  card: { backgroundColor: BG, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: CARD_PAD, ...CARD_SHADOW },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: SOFT, borderWidth: 1, borderColor: BORDER },
  author: { fontSize: 14, fontWeight: "900", color: TEXT },
  timeText: { marginTop: 2, fontSize: 11, color: TEXT_DIM, fontWeight: "800" },

  bodyText: { marginTop: 6, color: TEXT, opacity: 0.95, lineHeight: 20, fontWeight: "600" },

  gridWrap: {
    marginTop: 10, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: BORDER, backgroundColor: BG, ...CARD_SHADOW,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,17,17,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  moreTxt: { color: "#fff", fontWeight: "900", fontSize: 18 },
  countBadge: {
    position: "absolute", right: 10, top: 10,
    backgroundColor: "rgba(17,17,17,0.75)",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 6,
  },
  countTxt: { color: "#fff", fontWeight: "900", fontSize: 12 },

  tagsRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: SOFT },
  tagTxt: { fontSize: 11, fontWeight: "900", color: TEXT },

  moodChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: SOFT, flexDirection: "row", alignItems: "center", gap: 6 },
  moodTxt: { fontSize: 11, fontWeight: "900", color: TEXT },

  ghostBtn: { marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: SOFT, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: BORDER },

  fabWrap: { position: "absolute", right: 16, bottom: 28, zIndex: 20 },
  fab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 46, borderRadius: 23, backgroundColor: "#111", ...CARD_SHADOW },
  fabTxt: { color: "#fff", fontWeight: "900" },
});