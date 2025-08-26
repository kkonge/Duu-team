// screens/DiaryList.js — Diary-style feed (author shown)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator,
  RefreshControl, StyleSheet, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const LOCAL_KEY = '@diary_local_entries';
const { width } = Dimensions.get('window');
const H_PADDING = 14;

export default function DiaryList({ onPressItem, onPressWrite }) {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocal = useCallback(async () => {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    const local = raw ? JSON.parse(raw) : [];
    local.sort((a, b) => (b.date || '').localeCompare(a.date || '')); // 최신 먼저
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

  const renderItem = ({ item }) => (
    <DiaryCard item={item} onPress={() => onPressItem?.(item)} />
  );

  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;

  if (!items.length) {
    return (
      <View style={[s.center, { flex: 1 }]}>
        <Ionicons name="book-outline" size={36} color="#5A7698" />
        <Text style={{ marginTop: 8, color: '#5A7698' }}>아직 작성된 일기가 없어요</Text>
        <TouchableOpacity style={s.fabGhost} onPress={onPressWrite}>
          <Ionicons name="add" size={24} color="#2D5D9F" />
          <Text style={{ color: '#2D5D9F', fontWeight: '800', marginLeft: 4 }}>첫 일기 쓰기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D5D9F" />}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 6 }}
      />
      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={onPressWrite} activeOpacity={0.9}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function DiaryCard({ item, onPress }) {
  const photos = item.photos || [];
  const firstPhoto = photos[0];
  const authorName = item.authorName || 'AUTHOR';
  const timeText = formatDateTime(item.date);

  return (
    <View style={s.cardWrap}>
      {/* 날짜 라벨 */}
      <Text style={s.dateLabel}>{formatDate(item.date)}</Text>

      {/* 본문 카드 */}
      <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={onPress}>
        <View style={s.row}>
          {/* 왼쪽: 작성자/텍스트 */}
          <View style={s.leftCol}>
            <View style={s.avatarRow}>
              <View style={s.avatar} />
              <View style={{ marginLeft: 10 }}>
                <Text style={s.author}>{authorName}</Text>
            
              </View>
            </View>

            {!!item.text && (
              <Text style={s.bodyText} numberOfLines={4}>
                {item.text}
              </Text>
            )}

            <Text style={s.timeText}>{timeText}</Text>
          </View>

          {/* 오른쪽: 사진 박스 */}
          <View style={s.rightCol}>
            <View style={s.photoBox}>
              {firstPhoto ? (
                <Image source={{ uri: firstPhoto }} style={s.photo} resizeMode="cover" />
              ) : (
                <View style={[s.photo, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={26} color="#c7a942" />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={s.divider} />
    </View>
  );
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}
function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

const IMG_WIDTH = width * 0.45; // 오른쪽 이미지 폭
const IMG_HEIGHT = IMG_WIDTH * 0.6;

const s = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },

  cardWrap: { paddingHorizontal: H_PADDING, paddingTop: 8, marginBottom: 6 },
  dateLabel: {
    fontSize: 15, fontWeight: '800', color: '#1D3557',
    marginBottom: 6, marginLeft: 2,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C9CDD2',
    padding: 12,
  },

  row: { flexDirection: 'row', gap: 12 },
  leftCol: { flex: 1 },
  rightCol: { justifyContent: 'center' },

  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#222',
  },
  author: { fontSize: 15, fontWeight: '900', color: '#1e2937' },
  email: { fontSize: 12, color: '#1e2937', textDecorationLine: 'underline', maxWidth: width * 0.4 },

  bodyText: { marginTop: 4, color: '#4a5968', lineHeight: 20 },
  timeText: { marginTop: 10, fontSize: 11, color: '#2c3e50', fontWeight: '800' },

  photoBox: {
    width: IMG_WIDTH, height: IMG_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#F6DD77',
    borderWidth: 2, borderColor: '#6b5a2b',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },

  divider: { height: 1, backgroundColor: '#c9c9c9', marginTop: 14, marginBottom: 6 },

  fab: {
    position: 'absolute', right: 16, bottom: 24,
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2D5D9F',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  fabGhost: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E6F0FB', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: '#C3DAF1',
  },
});