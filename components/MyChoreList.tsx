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
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle">My Chores</ThemedText>
        <View style={styles.emptyBox}>
          <ThemedText style={styles.emptyText}>You have no chores right now</ThemedText>
        </View>
      </View>
    );
  }

  const handleVerifyChore = async (chore: any) => {
    if (navigatingChoreId) return; // guard against double taps
    if (!chore || chore.status !== "claimed") return; // only allow claimed
    try {

      setNavigatingChoreId(chore.uuid);
      router.push(`/chore-validate?uuid=${chore.uuid}`);
    } finally {
      setNavigatingChoreId(null);
    }
  };

  if (myChores.length === 0) {
    return null;
  }

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
  emptyBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.6,
    fontSize: 12,
  },
});
