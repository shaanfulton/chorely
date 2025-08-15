import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useGlobalChores();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginUser(email.trim().toLowerCase());
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Login Failed",
          "User not found. Please check your email or sign up."
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setIsLoading(true);
    try {
      const success = await loginUser(demoEmail);
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "Demo user not found. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Welcome to Chorely</ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage household chores with your family
          </ThemedText>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Users Quick Login */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Login</Text>
            <Text style={styles.demoSubtitle}>
              Try the app with these demo users:
            </Text>

            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={[styles.demoButton, styles.aliceButton]}
                onPress={() => handleQuickLogin("alice@demo.com")}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Alice</Text>
                <Text style={styles.demoButtonSubtext}>alice@demo.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, styles.bobButton]}
                onPress={() => handleQuickLogin("bob@demo.com")}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Bob</Text>
                <Text style={styles.demoButtonSubtext}>bob@demo.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, styles.charlieButton]}
                onPress={() => handleQuickLogin("charlie@demo.com")}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Charlie</Text>
                <Text style={styles.demoButtonSubtext}>charlie@demo.com</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, styles.dianaButton]}
                onPress={() => handleQuickLogin("diana@demo.com")}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Diana</Text>
                <Text style={styles.demoButtonSubtext}>diana@demo.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
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
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    color: "#666",
  },
  signupLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  demoSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  demoSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  demoButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  demoButton: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aliceButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  bobButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  charlieButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  dianaButton: {
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  demoButtonSubtext: {
    fontSize: 11,
    color: "#666",
  },
});
