import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function YourProfileScreen() {
  const [showForm, setShowForm] = useState(false);
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [puppyname, setPuppyname] = useState('');
  const [gender, setGender] = useState(null);
  const [neutered, setNeutered] = useState(null);
  const [size, setSize] = useState(null);

  const fadeHello = useRef(new Animated.Value(0)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(fadeHello, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {

      setTimeout(() => {
        Animated.timing(fadeHello, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
  
          setShowForm(true);
          Animated.timing(formFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        });
      }, 100);
    });
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('앨범 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const goToPuppyProfile = () => {
    navigation.navigate('PuppySelect', {
    dogProfiles: [
    {
      name: puppyname,
      imageUri,
      gender,
      neutered,
      size,
    },
  ],
});
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      {!showForm ? (
        <Animated.View style={[styles.centered, { opacity: fadeHello }]}>
          <Text style={styles.text}>당신의 강아지를 등록해주세요!</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.formWrapper, { opacity: formFade }]}>
          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
       

            <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
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
              value={puppyname}
              onChangeText={setPuppyname}
            />

            <Text style={styles.label}>BREED</Text>
            <TextInput style={styles.input} placeholder="예: Golden Retriever" />

            <Text style={styles.label}>BIRTH</Text>
            <TextInput style={styles.input} placeholder="예: 2020-01-01" />

            <Text style={styles.label}>GENDER</Text>
            <View style={styles.optionGroup}>
              {['MALE', 'FEMALE'].map((g) => (
                <Pressable
                  key={g}
                  style={[styles.optionBox, gender === g && styles.optionBoxSelected]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && styles.optionTextSelected]}>{g}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>NEUTERED</Text>
            <View style={styles.optionGroup}>
              {['YES', 'NO'].map((n) => (
                <Pressable
                  key={n}
                  style={[styles.optionBox, neutered === n && styles.optionBoxSelected]}
                  onPress={() => setNeutered(n)}
                >
                  <Text style={[styles.optionText, neutered === n && styles.optionTextSelected]}>{n}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>SIZE</Text>
            <View style={styles.optionGroup}>
              {['SMALL', 'MEDIUM', 'BIG'].map((s) => (
                <Pressable
                  key={s}
                  style={[styles.optionBox, size === s && styles.optionBoxSelected]}
                  onPress={() => setSize(s)}
                >
                  <Text style={[styles.optionText, size === s && styles.optionTextSelected]}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={[styles.nextButton, { marginTop: 40 }]} onPress={goToPuppyProfile}>
              <Text style={styles.nextButtonText}>다음</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 22,
    marginVertical: 10,
    textAlign: 'center',
  },
  formWrapper: {
    flex: 1,
    paddingTop: 100,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
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
    marginTop: 20,
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
    paddingVertical: 9,
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
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});