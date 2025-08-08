import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmailPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (email.trim() && password.trim() && confirmPassword.trim() && password === confirmPassword) {
      navigation.navigate('FamilyCheck');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-circle" size={32} color="#888" />
      </TouchableOpacity>

      <Text style={styles.topTitle}>개인 정보 입력</Text>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressInactive} />
        <View style={styles.progressInactive} />
        <View style={styles.progressActive} />
      </View>

      <View style={styles.questionBox}>
        <Text style={styles.greeting}>
          이메일 주소와 패스워드를{'\n'}입력해주세요 
        </Text>
      </View>

   
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>이메일</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="yourname@mail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {email.trim().length > 3 && (
          <Ionicons name="checkbox" size={24} color="#7B61FF" style={styles.checkIcon} />
        )}
      </View>

    
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>패스워드</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="password"
          value={password}
          onChangeText={setPassword}
        />
        {password.trim().length >= 6 && (
          <Ionicons name="checkbox" size={24} color="#7B61FF" style={styles.checkIcon} />
        )}
      </View>

   
      <View style={styles.inputContainer}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>패스워드 확인</Text>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {confirmPassword.trim().length >= 6 && confirmPassword === password && (
          <Ionicons name="checkbox" size={24} color="#7B61FF" style={styles.checkIcon} />
        )}
      </View>

    
      <TouchableOpacity
        style={[
          styles.nextButton,
          email && password && confirmPassword && password === confirmPassword
            ? styles.nextButtonActive
            : {},
        ]}
        onPress={handleNext}
        disabled={!(email && password && confirmPassword && password === confirmPassword)}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  topTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressActive: {
    width: 60,
    height: 4,
    backgroundColor: '#69DA00',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  progressInactive: {
    width: 60,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginHorizontal: 4,
  },
  questionBox: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 40,
  },
  greeting: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 17,
  },
  checkIcon: {
    marginLeft: 10,
  },
  labelRow: {
    position: 'absolute',
    top: -10,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonActive: {
    backgroundColor: '#000',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 10,
  },
});