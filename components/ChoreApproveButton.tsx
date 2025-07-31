import { approveChore } from "@/data/mock";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ChoreApproveButtonProps {
  choreId: string;
  onChoreApproved: () => void;
}

export const ChoreApproveButton: React.FC<ChoreApproveButtonProps> = ({
  choreId,
  onChoreApproved,
}) => {
  const handlePress = () => {
    approveChore(choreId);
    onChoreApproved();
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>Approve</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50",
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
