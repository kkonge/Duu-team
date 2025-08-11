import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
export default function YourProfileScreen() {
  const [showForm, setShowForm] = useState(false);
  const navigation = useNavigation(); 
  const [imageUri, setImageUri] = useState(null);

  const fadeHello = useRef(new Animated.Value(0)).current;
  const fadeMsg = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const formFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeHello, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeMsg, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 1500);

    setTimeout(() => {
      Animated.timing(fadeButton, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 2500);
  }, []);

  const pickImage = async () => {
    const permission= await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted){
        alert('앨범 접근 권한이 필요합니다.');
        return;
    }

    const result= await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4,3],
        quality:1,
    });

    if (!result.canceled) { 
        setImageUri(result.assets[0].uri);
    }
};

  const handleNext = () => {
    setShowForm(true);
    Animated.timing(formFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const goToFamilyCheck = () => {
    navigation.navigate('FamilyCheck')
  };

  return (
    
    <View style={styles.container}>
         {showForm && (
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>
    )}
      {!showForm ? (
        <View style={styles.centered}>
          <Animated.Text style={[styles.text, { opacity: fadeHello }]}>
            안녕하세요☺️
          </Animated.Text>
          <Animated.Text style={[styles.text, { opacity: fadeMsg }]}>
            당신의 프로필을 작성해주세요!
          </Animated.Text>
          <Animated.View style={{ opacity: fadeButton, marginTop: 30 }}>
            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={[styles.formContainer, { opacity: formFade }]}>
            {/* 프로필 사진 선택 */}
            <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePlaceholder}>+ 프로필 사진 등록</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.label}>NAME</Text>
          <TextInput style={styles.input} placeholder="예: HANNA" />

          <Text style={styles.label}>RELATIONSHIP</Text>
          <TextInput style={styles.input} placeholder="예: Mommy" />

          <Text style={styles.label}>GENDER</Text>
          <TextInput style={styles.input} placeholder="예: MALE/FEMALE" />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput style={styles.input} placeholder="joy0301@gmail.com" />

          {/* NextButton */}
          <Pressable style={[styles.nextButton, { marginTop: 40 }]} onPress={goToFamilyCheck}>
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 22,
    marginVertical: 10,
    textAlign: 'center',
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
  formContainer: {
    paddingHorizontal: 30,
    justifyContent: 'center',
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
   backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
  },
  imageBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
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
});