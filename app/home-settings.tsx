import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { Home } from "@/data/mock";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeSettingsScreen() {
  const router = useRouter();
  const { homeId } = useLocalSearchParams<{ homeId: string }>();
  const { userHomes, updateHomeWeeklyQuota, leaveHome, currentUser } =
    useGlobalChores();

  const [home, setHome] = useState<Home | null>(null);
  const [weeklyQuota, setWeeklyQuota] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const foundHome = userHomes.find((h) => h.id === homeId);
    if (foundHome) {
      setHome(foundHome);
      setWeeklyQuota(foundHome.weeklyPointQuota.toString());
    }
  }, [homeId, userHomes]);

  const handleUpdateQuota = async () => {
    if (!home) return;

    const quotaNumber = parseInt(weeklyQuota);
    if (isNaN(quotaNumber) || quotaNumber <= 0) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid positive number for the weekly quota."
      );
      return;
    }

    try {
      setIsLoading(true);
      const success = await updateHomeWeeklyQuota(home.id, quotaNumber);

      if (success) {
        Alert.alert("Success", "Weekly point quota updated successfully!");
        // Update local state to reflect the change
        setHome({ ...home, weeklyPointQuota: quotaNumber });
      } else {
        Alert.alert(
          "Error",
          "Failed to update weekly quota. Please try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update weekly quota. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveHome = () => {
    if (!home || !currentUser) return;

    Alert.alert(
      "Leave Home",
      `Are you sure you want to leave "${home.name}"? This action cannot be undone and you will lose all your points in this home.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await leaveHome(home.id);

              if (success) {
                Alert.alert("Success", "You have left the home successfully.", [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert("Error", "Failed to leave home. Please try again.");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to leave home. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!home) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Home not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Home Info Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Home Information</ThemedText>
          <View style={styles.infoCard}>
            <Text style={styles.homeTitle}>{home.name}</Text>
            <Text style={styles.homeAddress}>{home.address}</Text>
          </View>
        </View>

        {/* Weekly Quota Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Weekly Point Quota
          </ThemedText>
          <Text style={styles.sectionDescription}>
            Set the target number of points each member should earn per week.
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weeklyQuota}
              onChangeText={setWeeklyQuota}
              placeholder="Enter weekly quota"
              keyboardType="numeric"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.updateButton, isLoading && styles.buttonDisabled]}
              onPress={handleUpdateQuota}
              disabled={isLoading}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone Section */}
        <View style={[styles.section, styles.dangerSection]}>
          <ThemedText style={styles.sectionTitle}>Danger Zone</ThemedText>
          <Text style={styles.sectionDescription}>
            These actions cannot be undone. Please proceed with caution.
          </Text>
          <TouchableOpacity
            style={[styles.dangerButton, isLoading && styles.buttonDisabled]}
            onPress={handleLeaveHome}
            disabled={isLoading}
          >
            <Text style={styles.dangerButtonText}>Leave Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
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
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  homeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  homeAddress: {
    fontSize: 14,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerSection: {
    borderTopWidth: 1,
    borderTopColor: "#ffebee",
    paddingTop: 24,
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
