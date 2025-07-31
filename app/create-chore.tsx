import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getLucideIcon } from "@/utils/iconUtils";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateChoreScreen() {
  const params = useLocalSearchParams();

  // Parse the chore data from params if it exists
  const choreData = params.choreData
    ? JSON.parse(params.choreData as string)
    : null;

  const [choreName, setChoreName] = useState(choreData?.name || "");
  const [choreDescription, setChoreDescription] = useState(
    choreData?.description || ""
  );
  const [choreTime, setChoreTime] = useState(choreData?.defaultTime || "");
  const [choreIcon, setChoreIcon] = useState(choreData?.icon || "help-circle");

  const handleSave = () => {
    if (!choreName.trim()) {
      Alert.alert("Error", "Please enter a chore name");
      return;
    }

    // Here you would typically save the chore to your data store
    // For now, we'll just show an alert and navigate back
    Alert.alert(
      "Chore Created",
      `"${choreName}" has been created successfully!`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const IconComponent = getLucideIcon(choreIcon);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.iconPreview}>
          <View style={styles.iconContainer}>
            <IconComponent size={40} color="#666" />
          </View>
          <ThemedText type="default" style={styles.iconLabel}>
            Chore Icon
          </ThemedText>
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Chore Name *
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
            Estimated Time
          </ThemedText>
          <TextInput
            style={styles.input}
            value={choreTime}
            onChangeText={setChoreTime}
            placeholder="e.g., 30m, 1h, 2h 30m"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Icon Name
          </ThemedText>
          <TextInput
            style={styles.input}
            value={choreIcon}
            onChangeText={setChoreIcon}
            placeholder="e.g., brush, trash-2, droplets"
            placeholderTextColor="#999"
          />
          <ThemedText type="default" style={styles.helpText}>
            Use Lucide icon names (e.g., trash-2, brush, droplets, wind)
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleSave}>
          <ThemedText type="defaultSemiBold" style={styles.createButtonText}>
            Create Chore
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
