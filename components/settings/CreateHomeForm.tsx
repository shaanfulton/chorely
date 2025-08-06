import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateHomeFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function CreateHomeForm({
  isLoading,
  setIsLoading,
}: CreateHomeFormProps) {
  const { createHome } = useGlobalChores();
  const [isCreating, setIsCreating] = useState(false);
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  const handleCreateHome = async () => {
    if (!homeName.trim() || !homeAddress.trim()) {
      Alert.alert("Error", "Please enter both home name and address");
      return;
    }

    try {
      setIsLoading(true);
      await createHome(homeName.trim(), homeAddress.trim());
      Alert.alert("Success!", "Your home has been created successfully.");
      setHomeName("");
      setHomeAddress("");
      setIsCreating(false);
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.actionCard}>
      {!isCreating ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsCreating(true)}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>Create New Home</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Home Name</Text>
          <TextInput
            style={styles.input}
            value={homeName}
            onChangeText={setHomeName}
            placeholder="Enter home name (e.g., My House)"
            placeholderTextColor="#999"
            editable={!isLoading}
          />

          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={styles.input}
            value={homeAddress}
            onChangeText={setHomeAddress}
            placeholder="Enter address"
            placeholderTextColor="#999"
            editable={!isLoading}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleCreateHome}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsCreating(false);
                setHomeName("");
                setHomeAddress("");
              }}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  actionButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  inputSection: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    flex: 1,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
