// screens/GalleryView.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageGap = 2;
const imageSize = Math.floor((screenWidth - imageGap * (numColumns - 1)) / numColumns);

// 🔑 강아지별 / 레거시 키
const LOCAL_KEY = (dogId) => `@diary_local_entries:${dogId || 'unknown'}`;
const LEGACY_KEY = '@diary_local_entries';

export default function GalleryView({ dogId, reloadKey = 0 }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!dogId) {
          if (mounted) setPhotos([]);
          return;
        }

        // 1) 강아지별 저장소
        const rawByDog = await AsyncStorage.getItem(LOCAL_KEY(dogId));
        const byDog = rawByDog ? JSON.parse(rawByDog) : [];

        // 2) 레거시 저장소(공용)에서 같은 dogId만 병합
        const rawLegacy = await AsyncStorage.getItem(LEGACY_KEY);
        const legacy = rawLegacy ? JSON.parse(rawLegacy) : [];
        const merged = [...byDog, ...legacy.filter((e) => e.dogId === dogId)];

        const all = [];
        merged.forEach((entry) => {
          (entry.photos || []).forEach((uri) => {
            all.push({ uri, diaryId: String(entry.id) });
          });
        });

        if (mounted) setPhotos(all);
      } catch (e) {
        console.error('사진 불러오기 실패:', e);
        if (mounted) setPhotos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dogId, reloadKey]);

  const renderPhoto = ({ item }) => (
    <Image source={{ uri: item.uri }} style={styles.photo} resizeMode="cover" />
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (!photos.length) return <View style={styles.center}><Text>등록된 사진이 없습니다.</Text></View>;

  return (
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={(item, index) => `${item.diaryId}_${index}`}
      numColumns={numColumns}
      style={styles.galleryContainer}
      columnWrapperStyle={{ gap: imageGap }}
      contentContainerStyle={{ gap: imageGap }}
    />
  );
}

const styles = StyleSheet.create({
  galleryContainer: { flex: 1 },
  photo: { width: imageSize, height: imageSize, backgroundColor: '#eee', borderRadius: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});