import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function ChoreCompletionButton() {
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePress = () => {
    setIsCompleted(!isCompleted);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isCompleted ? "#4CAF50" : "#9E9E9E" },
      ]}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>Verify</Text>
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
