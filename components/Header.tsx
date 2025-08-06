import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import { Home, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function Header() {
  const { currentHome } = useGlobalChores();

  const handleUserSettings = () => {
    router.push("/user-settings");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Home size={24} color="#007AFF" />
          {currentHome && (
            <ThemedText style={styles.homeName}>{currentHome.name}</ThemedText>
          )}
        </View>

        <TouchableOpacity
          style={styles.userButton}
          onPress={handleUserSettings}
        >
          <User size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  homeName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
});
