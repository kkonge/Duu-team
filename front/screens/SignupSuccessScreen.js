import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function SignupSuccessScreen() {
  const navigation = useNavigation();

  // 애니메이션 값
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(12)).current;

  const subOpacity = useRef(new Animated.Value(0)).current;
  const subTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // 1) 원 등장
    Animated.parallel([
      Animated.timing(ringOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(ringScale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2) 체크 팝
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }).start();

      // 3) 타이틀 페이드 인 (살짝 딜레이)
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 320,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 520,
          delay: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // 4) 서브텍스트 페이드 인 (조금 더 딜레이)
      Animated.parallel([
        Animated.timing(subOpacity, {
          toValue: 1,
          duration: 320,
          delay: 360,
          useNativeDriver: true,
        }),
        Animated.timing(subTranslate, {
          toValue: 0,
          duration: 320,
          delay: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // 2.2초 후 프로필 화면으로 이동 (글자 충분히 보이게)
    const timer = setTimeout(() => {
      navigation.replace("UserProfile");
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrap}>
        {/* 라운드 원 */}
        <Animated.View
          style={[
            styles.ring,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <Ionicons name="checkmark" size={60} color="#fff" />
          </Animated.View>
        </Animated.View>

        {/* 텍스트 영역 */}
        <View style={{ alignItems: "center", minHeight: 72 }}>
          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleTranslate }] },
            ]}
          >
            가입이 완료되었습니다!
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: subOpacity, transform: [{ translateY: subTranslate }] },
            ]}
          >
            이제 이어서 당신의 프로필을 작성해주세요
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = "#000";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  ring: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
});