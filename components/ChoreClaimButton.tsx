import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function ChoreClaimButton() {
  const [isClaimed, setIsClaimed] = useState(false);

  const handlePress = () => {
    setIsClaimed(!isClaimed);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isClaimed ? "#4CAF50" : "#9E9E9E" },
      ]}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>Claim</Text>
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
