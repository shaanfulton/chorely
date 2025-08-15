import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { getHomeUsersAPI } from "@/data/api";

interface HomeUser {
  email: string;
  name: string;
  points: number;
}

export function HomeMembersList() {
  const { currentHome, allUserPoints } = useGlobalChores();
  const [homeUsers, setHomeUsers] = useState<HomeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeUsers = async () => {
      if (!currentHome) return;
      
      try {
        setIsLoading(true);
        const users = await getHomeUsersAPI(currentHome.id);
        const usersWithPoints = users.map(user => ({
          ...user,
          points: allUserPoints[user.email] || 0
        }));
        setHomeUsers(usersWithPoints);
      } catch (error) {
        console.error("Failed to load home users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeUsers();
  }, [currentHome, allUserPoints]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle">Home Members</ThemedText>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading members...</ThemedText>
        </ThemedView>
      </View>
    );
  }

  if (homeUsers.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle">Home Members</ThemedText>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No members found</ThemedText>
        </ThemedView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Home Members</ThemedText>
      {homeUsers.map((user) => (
        <ThemedView key={user.email} style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <ThemedText style={styles.memberName}>{user.name}</ThemedText>
            <ThemedText style={styles.memberEmail}>{user.email}</ThemedText>
          </View>
          <View style={styles.pointsContainer}>
            <ThemedText style={styles.pointsText}>{user.points}</ThemedText>
            <ThemedText style={styles.pointsLabel}>pts</ThemedText>
          </View>
        </ThemedView>
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
  loadingContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  loadingText: {
    opacity: 0.6,
    fontSize: 12,
  },
  emptyContainer: {
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
  memberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#fafafa",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    opacity: 0.6,
  },
  pointsContainer: {
    alignItems: "center",
    minWidth: 50,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  pointsLabel: {
    fontSize: 10,
    opacity: 0.6,
    textTransform: "uppercase",
  },
});
