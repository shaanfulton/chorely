import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
import { Button } from "./Button";

interface ChoreApproveButtonProps {
  choreId: string;
}

export const ChoreApproveButton: React.FC<ChoreApproveButtonProps> = ({
  choreId,
}) => {
  const { approveChore } = useGlobalChores();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      await approveChore(choreId);
    } catch (error) {
      console.error("Failed to approve chore:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      title="Approve"
      backgroundColor={Colors.metro.green}
      loadingBackgroundColor={Colors.metro.teal}
      isLoading={isLoading}
      onPress={handlePress}
      size="small"
    />
  );
};
