import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupHomeSelectionScreen() {
  const [selectedOption, setSelectedOption] = useState<
    "join" | "create" | null
  >(null);
  const [homeId, setHomeId] = useState("");
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { joinHome, createHome } = useGlobalChores();

  const handleContinue = async () => {
    if (!selectedOption) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    if (selectedOption === "join" && !homeId.trim()) {
      Alert.alert("Error", "Please enter a home ID");
      return;
    }

    if (
      selectedOption === "create" &&
      (!homeName.trim() || !homeAddress.trim())
    ) {
      Alert.alert("Error", "Please enter both home name and address");
      return;
    }

    setIsLoading(true);
    try {
      if (selectedOption === "join") {
        const success = await joinHome(homeId.trim());
        if (success) {
          Alert.alert("Success!", "You have successfully joined the home.", [
            {
              text: "Continue",
              onPress: () => router.replace("/(tabs)"),
            },
          ]);
        } else {
          Alert.alert(
            "Failed to Join",
            "Unable to join the home. Please check the home ID and try again."
          );
        }
      } else if (selectedOption === "create") {
        await createHome(homeName.trim(), homeAddress.trim());
        Alert.alert("Success!", "Your home has been created successfully.", [
          {
            text: "Continue",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Set Up Your Home</ThemedText>
            <ThemedText style={styles.subtitle}>
              Join an existing home or create a new one
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Choose an Option</Text>

            <View style={styles.optionsList}>
              <TouchableOpacity
                style={[
                  styles.option,
                  selectedOption === "join" && styles.optionSelected,
                ]}
                onPress={() => setSelectedOption("join")}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === "join" && styles.optionTextSelected,
                  ]}
                >
                  Join Existing Home
                </Text>
                <Text style={styles.optionDescription}>
                  Enter a home ID to join an existing household
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  selectedOption === "create" && styles.optionSelected,
                ]}
                onPress={() => setSelectedOption("create")}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === "create" && styles.optionTextSelected,
                  ]}
                >
                  Create New Home
                </Text>
                <Text style={styles.optionDescription}>
                  Set up a new household for your family or roommates
                </Text>
              </TouchableOpacity>
            </View>

            {selectedOption === "join" && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Home ID</Text>
                <TextInput
                  style={styles.input}
                  value={homeId}
                  onChangeText={setHomeId}
                  placeholder="Enter home ID (e.g., home_1)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            )}

            {selectedOption === "create" && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Home Name</Text>
                <TextInput
                  style={styles.input}
                  value={homeName}
                  onChangeText={setHomeName}
                  placeholder="Enter home name (e.g., My House)"
                  editable={!isLoading}
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={homeAddress}
                  onChangeText={setHomeAddress}
                  placeholder="Enter address"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? "Processing..." : "Continue"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  optionsList: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e1e1e1",
  },
  optionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  optionTextSelected: {
    color: "#007AFF",
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
