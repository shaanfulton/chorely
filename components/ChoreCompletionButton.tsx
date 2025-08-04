import { useChore } from "@/context/ChoreContext";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export function ChoreCompletionButton() {
  const { chore, isLoading } = useChore();
  const router = useRouter();

  const handlePress = async () => {
    if (chore && chore.status === "claimed") {
      // Navigate to validation screen
      router.push(`/chore-validate?uuid=${chore.uuid}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: "#9E9E9E" }]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.buttonText}>Verify</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
