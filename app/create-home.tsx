import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function CreateHomeScreen() {
  const { createHome } = useGlobalChores();
  const [homeName, setHomeName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async () => {
    if (!homeName.trim()) {
      Alert.alert("Error", "Please enter a home name");
      return;
    }

    if (isCreating) return; // Prevent double submission

    try {
      setIsCreating(true);

      await createHome(homeName.trim());

      Alert.alert(
        "Home Created",
        `"${homeName}" has been created successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create home. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Failed to create home:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Home Name
          </ThemedText>
          <TextInput
            style={styles.input}
            value={homeName}
            onChangeText={setHomeName}
            placeholder="Enter home name (e.g., My House)"
            placeholderTextColor="#999"
          />
        </View>

        <Button
          title="Create Home"
          backgroundColor={Colors.metro.blue}
          isLoading={isCreating}
          onPress={handleSave}
          size="large"
          style={styles.createButton}
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
  createButton: {
    marginTop: 30,
    marginBottom: 40,
  },
});
