import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import { Home as HomeType } from "@/data/mock";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Copy, Home } from "lucide-react-native";
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

  const [home, setHome] = useState<HomeType | null>(null);
  const [weeklyQuota, setWeeklyQuota] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

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

  const handleCopyHomeId = async () => {
    if (!home) return;

    try {
      await Clipboard.setStringAsync(home.id);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy Home ID");
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
          <View style={styles.homeHeader}>
            <Home size={24} color={Colors.light.text} />
            <Text style={styles.homeTitle}>{home.name}</Text>
          </View>

          {/* Home ID Tag */}
          <View style={styles.homeIdSection}>
            <Text style={styles.homeIdLabel}>Home ID</Text>
            <TouchableOpacity
              style={[styles.homeIdTag, isCopied && styles.homeIdTagCopied]}
              onPress={handleCopyHomeId}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.homeIdText, isCopied && styles.homeIdTextCopied]}
              >
                {home.id}
              </Text>
              {isCopied && <Text style={styles.copiedText}>Copied</Text>}
              {isCopied ? (
                <Check size={16} color="#22c55e" />
              ) : (
                <Copy size={16} color="#666" />
              )}
            </TouchableOpacity>
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
            <Button
              title={isLoading ? "Updating..." : "Update"}
              onPress={handleUpdateQuota}
              disabled={isLoading}
              isLoading={isLoading}
              backgroundColor={Colors.metro.blue}
              size="medium"
            />
          </View>
        </View>

        {/* Leave Home Section */}
        <View style={styles.section}>
          <Button
            title="Leave Home"
            onPress={handleLeaveHome}
            disabled={isLoading}
            backgroundColor={Colors.metro.red}
            size="large"
            style={styles.leaveButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 16,
    lineHeight: 22,
  },
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },

  homeIdSection: {
    marginTop: 0,
  },
  homeIdLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    fontWeight: "600",
    marginBottom: 8,
  },
  homeIdTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignSelf: "flex-start",
  },
  homeIdText: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: "monospace",
    fontWeight: "500",
  },
  homeIdTagCopied: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
    borderWidth: 1,
  },
  homeIdTextCopied: {
    color: "#16a34a",
  },
  copiedText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  leaveButton: {
    width: "100%",
  },
});
