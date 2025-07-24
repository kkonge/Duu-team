import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function MultipleDogProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { numberOfDogs } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [dogProfiles, setDogProfiles] = useState(Array(numberOfDogs).fill({}));
  const [imageUri, setImageUri] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birth: '',
    gender: null,
    neutered: null,
    size: null,
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('앨범 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    const updatedProfiles = [...dogProfiles];
    updatedProfiles[currentStep] = {
      ...formData,
      imageUri,
    };
    setDogProfiles(updatedProfiles);

    // 페이드 아웃 → 데이터 저장 → 다음 폼으로 페이드 인
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (currentStep + 1 < numberOfDogs) {
        setCurrentStep((prev) => prev + 1);
        setFormData({ name: '', gender: null, neutered: null, size: null });
        setImageUri(null);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        navigation.navigate('PuppySelect', { dogProfiles: updatedProfiles });
      }
    });
  };

  const handleSelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      {/* 제목 */}
      <Text style={styles.title}>
        {currentStep + 1}번째 강아지를 등록해주세요!
      </Text>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* 이미지 등록 */}
          <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePlaceholder}>+ 강아지 사진 등록</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="예: JOY"
            value={formData.name}
            onChangeText={(text) => handleSelect('name', text)}
          />

            
            <Text style={styles.label}>BREED</Text>
            <TextInput
                style={styles.input}
                placeholder="예: Maltese"
                value={formData.breed}
                onChangeText={(text) => handleSelect('breed', text)}
            />


<Text style={styles.label}>BIRTH</Text>
<TextInput
  style={styles.input}
  placeholder="예: 2022-05-01"
  value={formData.birth}
  onChangeText={(text) => handleSelect('birth', text)}
/>




          <Text style={styles.label}>GENDER</Text>
          <View style={styles.optionGroup}>
            {['MALE', 'FEMALE'].map((g) => (
              <Pressable
                key={g}
                style={[styles.optionBox, formData.gender === g && styles.optionBoxSelected]}
                onPress={() => handleSelect('gender', g)}
              >
                <Text
                  style={[styles.optionText, formData.gender === g && styles.optionTextSelected]}
                >
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>NEUTERED</Text>
          <View style={styles.optionGroup}>
            {['YES', 'NO'].map((n) => (
              <Pressable
                key={n}
                style={[styles.optionBox, formData.neutered === n && styles.optionBoxSelected]}
                onPress={() => handleSelect('neutered', n)}
              >
                <Text
                  style={[styles.optionText, formData.neutered === n && styles.optionTextSelected]}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>SIZE</Text>
          <View style={styles.optionGroup}>
            {['SMALL', 'MEDIUM', 'BIG'].map((s) => (
              <Pressable
                key={s}
                style={[styles.optionBox, formData.size === s && styles.optionBoxSelected]}
                onPress={() => handleSelect('size', s)}
              >
                <Text
                  style={[styles.optionText, formData.size === s && styles.optionTextSelected]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 다음 버튼 */}
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep + 1 === numberOfDogs ? '완료' : '다음'}
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop:50
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  imageBox: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  optionGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  optionBox: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  optionBoxSelected: {
    backgroundColor: '#000',
  },
  optionText: {
    fontSize: 14,
    color: '#444',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});