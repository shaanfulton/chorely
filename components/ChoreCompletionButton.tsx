import { Colors } from "@/constants/Colors";
import { useChore } from "@/context/ChoreContext";
import { useRouter } from "expo-router";
import React from "react";
import { Button } from "./Button";

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
    <Button
      title="Verify"
      backgroundColor={Colors.metro.blue}
      isLoading={isLoading}
      onPress={handlePress}
      size="small"
    />
  );
}
