import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 추가

export default function YourProfileScreen() {
  const [showForm, setShowForm] = useState(false);
  const navigation = useNavigation(); // 추가

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

  const handleNext = () => {
    setShowForm(true);
    Animated.timing(formFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const goToPuppyProfile = () => {
    navigation.navigate('PuppyProfile'); // 👈 StackNavigator에 등록되어 있어야 함
  };

  return (
    <View style={styles.container}>
      {!showForm ? (
        <View style={styles.centered}>
          <Animated.Text style={[styles.text, { opacity: fadeHello }]}>
            안녕하세요!
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
          <Text style={styles.label}>NAME</Text>
          <TextInput style={styles.input} placeholder="예: JOY" />

          <Text style={styles.label}>Relationship</Text>
          <TextInput style={styles.input} placeholder="예: Mommy" />

          <Text style={styles.label}>GENDER</Text>
          <TextInput style={styles.input} placeholder="예: FEMALE" />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput style={styles.input} placeholder="joy0301@gmail.com" />

          {/* 다음(PuppyProfile)으로 이동하는 버튼 */}
          <Pressable style={[styles.nextButton, { marginTop: 40 }]} onPress={goToPuppyProfile}>
            <Text style={styles.nextButtonText}>다음</Text>
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
    backgroundColor: '#4B9EFF',
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
});