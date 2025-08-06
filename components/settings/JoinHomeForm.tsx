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

interface JoinHomeFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function JoinHomeForm({ isLoading, setIsLoading }: JoinHomeFormProps) {
  const { joinHome } = useGlobalChores();
  const [isJoining, setIsJoining] = useState(false);
  const [homeId, setHomeId] = useState("");

  const handleJoinHome = async () => {
    if (!homeId.trim()) {
      Alert.alert("Error", "Please enter a home ID");
      return;
    }

    try {
      setIsLoading(true);
      const success = await joinHome(homeId.trim());
      if (success) {
        Alert.alert("Success!", "You have successfully joined the home.");
        setHomeId("");
        setIsJoining(false);
      } else {
        Alert.alert(
          "Failed to Join",
          "Unable to join the home. Please check the home ID and try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.actionCard}>
      {!isJoining ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsJoining(true)}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>Join Existing Home</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Home ID</Text>
          <TextInput
            style={styles.input}
            value={homeId}
            onChangeText={setHomeId}
            placeholder="Enter home ID (e.g., home_1)"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleJoinHome}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Joining..." : "Join"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsJoining(false);
                setHomeId("");
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
