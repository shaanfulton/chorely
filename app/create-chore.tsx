import IconSelector from "@/components/IconSelector";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import UrgencySelector from "@/components/UrgencySelector";
import { useGlobalChores } from "@/context/ChoreContext";
import { getLucideIcon } from "@/utils/iconUtils";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateChoreScreen() {
  const params = useLocalSearchParams();
  const { createChore } = useGlobalChores();

  // Parse the chore data from params if it exists
  const choreData = params.choreData
    ? JSON.parse(params.choreData as string)
    : null;

  const [choreName, setChoreName] = useState(choreData?.name || "");
  const [choreDescription, setChoreDescription] = useState(
    choreData?.description || ""
  );
  const [choreUrgency, setChoreUrgency] = useState(choreData?.urgency ?? 0); // 0 = low, 1 = medium, 2 = high
  const [choreIcon, setChoreIcon] = useState(choreData?.icon || "help-circle");
  const [isIconSelectorVisible, setIsIconSelectorVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const urgencyOptions = ["1 day", "2 days", "3 days"];

  const handleSave = async () => {
    if (!choreName.trim()) {
      Alert.alert("Error", "Please enter a chore name");
      return;
    }

    if (isCreating) return; // Prevent double submission

    try {
      setIsCreating(true);

      await createChore({
        name: choreName,
        description: choreDescription,
        time: urgencyOptions[choreUrgency],
        icon: choreIcon,
      });

      Alert.alert(
        "Chore Created",
        `"${choreName}" has been created successfully! It is now waiting for approval.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create chore. Please try again.", [
        { text: "OK" },
      ]);
      console.error("Failed to create chore:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const IconComponent = getLucideIcon(choreIcon);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.iconPreview}
          onPress={() => setIsIconSelectorVisible(true)}
        >
          <View style={styles.iconContainer}>
            <IconComponent size={40} color="#666" />
          </View>
          <ThemedText type="default" style={styles.iconLabel}>
            Tap to change icon
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Chore Name
          </ThemedText>
          <TextInput
            style={styles.input}
            value={choreName}
            onChangeText={setChoreName}
            placeholder="Enter chore name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Description
          </ThemedText>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={choreDescription}
            onChangeText={setChoreDescription}
            placeholder="Enter chore description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Urgency
          </ThemedText>
          <UrgencySelector
            options={urgencyOptions}
            selectedIndex={choreUrgency}
            onSelect={setChoreUrgency}
          />
        </View>

        <TouchableOpacity
          style={[styles.createButton, { opacity: isCreating ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText type="defaultSemiBold" style={styles.createButtonText}>
              Create Chore
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>

      <IconSelector
        visible={isIconSelectorVisible}
        onClose={() => setIsIconSelectorVisible(false)}
        onSelectIcon={setChoreIcon}
        selectedIcon={choreIcon}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconPreview: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconLabel: {
    color: "#666",
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
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  helpText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
