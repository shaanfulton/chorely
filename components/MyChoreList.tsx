import { Button } from "@/components/Button";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function MyChoreList() {
  const { myChores, isLoading } = useGlobalChores();
  const router = useRouter();
  const [navigatingChoreId, setNavigatingChoreId] = useState<string | null>(
    null
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (myChores.length === 0) {
    return null;
  }

  const handleVerifyChore = async (chore: any) => {
    if (chore && chore.status === "claimed") {
      try {
        setNavigatingChoreId(chore.uuid);
        // Navigate to validation screen
        router.push(`/chore-validate?uuid=${chore.uuid}`);
      } finally {
        setNavigatingChoreId(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">My Chores</ThemedText>
      {myChores.map((chore) => (
        <ChoreListItem key={chore.uuid} chore={chore}>
          <Button
            title="Verify"
            backgroundColor={Colors.metro.blue}
            isLoading={navigatingChoreId === chore.uuid}
            onPress={() => handleVerifyChore(chore)}
            size="small"
          />
        </ChoreListItem>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
