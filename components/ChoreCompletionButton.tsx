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
  const { myChores } = useGlobalChores();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Find the current chore
  const chore = myChores.find((c) => c.uuid === choreUuid);

  const handlePress = async () => {
    if (chore && chore.status === "claimed") {
      // Navigate to validation screen
      router.push(`/chore-validate?uuid=${choreUuid}`);
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
