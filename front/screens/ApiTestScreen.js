// screens/ApiTestScreen.js
import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { api } from "../api/client"

export default function ApiTestScreen() {
  const [result, setResult] = useState("");

  async function checkHealth() {
    try {
      const data = await api("/health");
      const text = JSON.stringify(data);
      setResult(text);
      Alert.alert("연결 성공", text);
    } catch (e) {
      Alert.alert("연결 실패", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="헬스체크" onPress={checkHealth} />
      {!!result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  result: { marginTop: 16 }
});