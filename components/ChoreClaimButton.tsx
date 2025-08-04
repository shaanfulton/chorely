import { Colors } from "@/constants/Colors";
import { useChore } from "@/context/ChoreContext";
import React from "react";
import { Button } from "./Button";

export function ChoreClaimButton() {
  const { claimChore, isLoading } = useChore();

  const handlePress = async () => {
    try {
      await claimChore();
    } catch (error) {
      console.error("Failed to claim chore:", error);
    }
  };

  return (
    <Button
      title="Claim"
      backgroundColor={Colors.metro.gray}
      loadingBackgroundColor={Colors.metro.green}
      isLoading={isLoading}
      onPress={handlePress}
      size="small"
    />
  );
}
