import { ThemedText } from "@/components/ThemedText";
import { useGlobalChores } from "@/context/ChoreContext";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HomeSwitcherProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function HomeSwitcher({ isLoading, setIsLoading }: HomeSwitcherProps) {
  const { currentHome, userHomes, switchHome } = useGlobalChores();

  const handleSwitchHome = async (homeId: string) => {
    if (homeId === currentHome?.id) return;

    try {
      setIsLoading(true);
      await switchHome(homeId);
      // Alert.alert("Success", "Home switched successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to switch home. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Switch Home</ThemedText>
      <Text style={styles.sectionDescription}>
        Select which home to use for chores and points
      </Text>
      <View style={styles.homesList}>
        {userHomes.map((home) => (
          <TouchableOpacity
            key={home.id}
            style={[
              styles.homeOption,
              currentHome?.id === home.id && styles.homeOptionSelected,
            ]}
            onPress={() => handleSwitchHome(home.id)}
            disabled={isLoading || currentHome?.id === home.id}
          >
            <View style={styles.homeOptionContent}>
              <Text
                style={[
                  styles.homeOptionName,
                  currentHome?.id === home.id && styles.homeOptionNameSelected,
                ]}
              >
                {home.name}
              </Text>
              <Text style={styles.homeOptionAddress}>{home.address}</Text>
              {currentHome?.id === home.id && (
                <Text style={styles.currentLabel}>Current</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  homesList: {
    gap: 8,
  },
  homeOption: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e1e1e1",
  },
  homeOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  homeOptionContent: {
    flexDirection: "column",
  },
  homeOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  homeOptionNameSelected: {
    color: "#007AFF",
  },
  homeOptionAddress: {
    fontSize: 14,
    color: "#666",
  },
  currentLabel: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
});
