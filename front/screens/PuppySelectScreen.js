// screens/PuppySelectScreen.js
import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  SafeAreaView, FlatList, Pressable, ScrollView
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

function getAgeLabel(birth) {
  if (!birth) return "-";
  const d = new Date(birth);
  if (isNaN(d.getTime())) return "-";
  const now = new Date();

  let years = now.getFullYear() - d.getFullYear();
  let months = now.getMonth() - d.getMonth();
  let days = now.getDate() - d.getDate();

  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return "0m";
  if (years <= 0) return `${months}m`;
  return `${years}y ${months}m`;
}

export default function PuppySelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const dogs = Array.isArray(route.params?.dogProfiles) ? route.params.dogProfiles : [];
  const userProfile = route.params?.userProfile || null;
  const familyProfiles = Array.isArray(route.params?.familyProfiles) ? route.params.familyProfiles : [];

  const data = useMemo(() => dogs, [dogs]);

  const renderItem = ({ item }) => {
    const uri = item.imageUri || item.photo || null;
    const name = item.name || "No Name";
    const breed = item.breed || null;
    const ageLabel = getAgeLabel(item.birth);

    return (
      <Pressable
        onPress={() => navigation.navigate("Home", { selectedDog: item })}
        style={({ pressed }) => [styles.bannerCard, pressed && styles.pressed]}
      >

        <View style={styles.thumbSquare}>
          {uri ? (
            <Image source={{ uri }} style={styles.thumbImg} />
          ) : (
            <View style={[styles.thumbImg, styles.imagePlaceholder]}>
              <Ionicons name="paw-outline" size={28} color="#A3B39F" />
            </View>
          )}
        </View>


        <View style={styles.infoCol}>
          <Text numberOfLines={1} style={styles.dogName}>{name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>{ageLabel}</Text>
            {breed ? <Text style={[styles.metaItem, styles.metaDim]}>• {breed}</Text> : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
     
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle" size={32} color="#7B8A7A" />
        </TouchableOpacity>

     
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Your Family</Text>
            <Text style={styles.subtitle}>
              {dogs.length > 0 ? `${dogs.length} dog${dogs.length > 1 ? "s" : ""} in your family` : "아직 등록된 강아지가 없어요"}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("AddDogStep1", route.params || {})}
            style={({ pressed }) => [styles.headerAdd, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={18} color="#3F8C74" />
            <Text style={styles.headerAddTxt}>Add</Text>
          </Pressable>
        </View>

        {/* 강아지 리스트 */}
        {dogs.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item, idx) => String(item.id || idx)}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={[styles.emptyWrap, { paddingBottom: 120 }]}>
            <Ionicons name="paw-outline" size={28} color="#6B7A6A" />
            <Text style={styles.emptyText}>상단 우측 “Add”로 강아지 프로필을 추가하세요</Text>
          </View>
        )}

\
        <View style={styles.footerStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerContent}>
            {/* 내 프로필 */}
            <View style={styles.meWrap}>
              <View style={styles.avatarWrap}>
                {userProfile?.photoUri ? (
                  <Image source={{ uri: userProfile.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person-circle-outline" size={24} color="#9CB3A1" />
                  </View>
                )}
              </View>
              <Text numberOfLines={1} style={styles.avatarName}>{userProfile?.name || "Me"}</Text>
            </View>

            {/* 가족들 */}
            {familyProfiles.map((m) => (
              <View key={m.id || m.name} style={styles.memberWrap}>
                <View style={styles.avatarWrap}>
                  {m.photoUri ? (
                    <Image source={{ uri: m.photoUri }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person-outline" size={18} color="#9CB3A1" />
                    </View>
                  )}
                </View>
                <Text numberOfLines={1} style={styles.avatarName}>{m.name}</Text>
              </View>
            ))}

            {/* 가족 초대 */}
            <Pressable
              onPress={() => navigation.navigate("InviteFamily")}
              style={({ pressed }) => [styles.inviteCard, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Ionicons name="person-add-outline" size={16} color="#3F8C74" />
              <Text style={styles.inviteTxt}>Invite</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_BG = "#fff";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF6E9", paddingHorizontal: 16, paddingTop: 8 },
  backButton: { position: "absolute", top: 10, left: 12, zIndex: 10 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 38, paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#5B7F6A" },
  subtitle: { marginTop: 2, color: "#6B7A6A", fontSize: 13 },

  headerAdd: {
    height: 36, paddingHorizontal: 12, borderRadius: 18,
    borderWidth: 1, borderColor: "#D7E8DB",
    backgroundColor: "#EAF4EE",
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  headerAddTxt: { color: "#3F8C74", fontWeight: "800" },

  listContent: { paddingTop: 4, paddingBottom: 24 },


  bannerCard: {
    marginTop: 10,
    flexDirection: "row",
    gap: 14,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    padding: 12,           
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    minHeight: 120,            
  },
  thumbSquare: {
    width: 120,                  
    aspectRatio: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F6F2",
  },
  thumbImg: { width: "100%", height: "100%" },

  infoCol: { flex: 1, justifyContent: "center" }, 

  dogName: { fontSize: 26, fontWeight: "900", color: "#415247" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  metaItem: { color: "#3F8C74", fontWeight: "800" },
  metaDim: { color: "#5B6C5A", fontWeight: "700" },

  
  footerStrip: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: "#FFFFFFEE",
    borderTopWidth: 1, borderColor: "#E0E8DE",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -4 },
  },
  footerContent: { alignItems: "center", paddingRight: 12 },

  meWrap: { alignItems: "center", marginRight: 12 },
  memberWrap: { alignItems: "center", marginRight: 12 },

  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, overflow: "hidden",
    backgroundColor: "#F3F6F2", borderWidth: 1, borderColor: "#E0E8DE",
    alignItems: "center", justifyContent: "center",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarName: { marginTop: 4, fontSize: 11, color: "#415247", fontWeight: "700", maxWidth: 60, textAlign: "center" },

  inviteCard: {
    height: 44, paddingHorizontal: 12, borderRadius: 22,
    backgroundColor: "#EAF4EE", borderWidth: 1, borderColor: "#D7E8DB",
    flexDirection: "row", alignItems: "center", gap: 6,
    marginLeft: 6,
  },
  inviteTxt: { color: "#3F8C74", fontWeight: "800" },


  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 8, color: "#6B7A6A", fontSize: 13, textAlign: "center" },

  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.99 }] },
});