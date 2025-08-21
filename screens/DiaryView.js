import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function DiaryView() {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets || [result];
      setImages([...images, ...selected.map((item) => ({ uri: item.uri }))]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.diaryContainer}
    >
      <Text style={styles.sectionLabel}>오늘의 일기</Text>

      <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
        <Ionicons name="image-outline" size={20} color="#2D5D9F" />
        <Text style={styles.addImageText}>사진 추가</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {images.map((img, idx) => (
          <View key={idx} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => removeImage(idx)}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TextInput
        style={styles.diaryText}
        placeholder="오늘의 감정이나 특별한 순간을 적어보세요..."
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#99A9BA"
      />

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>저장하기</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  diaryContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
    backgroundColor: '#F4F8FC',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D5D9F',
  },
  addImageBtn: {
    marginTop: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6F0FB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C3DAF1',
  },
  addImageText: {
    marginLeft: 8,
    color: '#2D5D9F',
    fontWeight: '700',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  diaryText: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCEAF5',
    minHeight: 300,
    color: '#1C2B36',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#2D5D9F',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
