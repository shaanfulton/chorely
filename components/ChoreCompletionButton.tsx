import { useChore, useGlobalChores } from "@/context/ChoreContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export function ChoreCompletionButton() {
  const { choreUuid } = useChore();
  const { myChores, completeChore } = useGlobalChores();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Find the current chore
  const chore = myChores.find((c) => c.uuid === choreUuid);
  const isComplete = chore?.status === "complete";

  const handlePress = async () => {
    if (isComplete) {
      // If already complete, do nothing or show completion status
      return;
    }

    if (chore && chore.status === "claimed") {
      // Navigate to validation screen
      router.push(`/chore-validate?uuid=${choreUuid}`);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isComplete ? "#4CAF50" : "#9E9E9E" },
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.buttonText}>
          {isComplete ? "Complete" : "Verify"}
        </Text>
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
