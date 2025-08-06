import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function JoinHomeScreen() {
  const { joinHome } = useGlobalChores();
  const [homeId, setHomeId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSave = async () => {
    if (!homeId.trim()) {
      Alert.alert("Error", "Please enter a home ID");
      return;
    }

    if (isJoining) return; // Prevent double submission

    try {
      setIsJoining(true);

      const success = await joinHome(homeId.trim());

      if (success) {
        Alert.alert("Joined Home", "You have successfully joined the home!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert(
          "Failed to Join",
          "Unable to join the home. Please check the home ID and try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to join home. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Failed to join home:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Home ID
          </ThemedText>
          <TextInput
            style={styles.input}
            value={homeId}
            onChangeText={setHomeId}
            placeholder="Enter home ID (e.g., home_1)"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <ThemedText style={styles.helpText}>
            Ask a home member for the home ID to join their home.
          </ThemedText>
        </View>

        <Button
          title="Join Home"
          backgroundColor={Colors.metro.blue}
          isLoading={isJoining}
          onPress={handleSave}
          size="large"
          style={styles.joinButton}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  helpText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
  joinButton: {
    marginTop: 30,
    marginBottom: 40,
  },
});
