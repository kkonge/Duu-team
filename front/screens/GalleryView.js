import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageGap = 2;
const imageSize = Math.floor((screenWidth - imageGap * (numColumns - 1)) / numColumns);
const LOCAL_KEY = '@diary_local_entries';

export default function GalleryView() {
  const [photos, setPhotos] = useState([]); // [{ uri, diaryId }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const local = raw ? JSON.parse(raw) : [];
        const all = [];
        local.forEach((entry) => {
          (entry.photos || []).forEach((uri) => {
            all.push({ uri, diaryId: entry.id });
          });
        });
        if (mounted) setPhotos(all);
      } catch (e) {
        console.error('사진 불러오기 실패:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
  photo: { width: imageSize, height: imageSize, backgroundColor: '#eee', borderRadius:8},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});