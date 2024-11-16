import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/slices/authSlice";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import GlitchText from "../utils/GlitchText"; // Import the GlitchText component

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);

  const [fontsLoaded] = useFonts({
    "PressStart2P-Regular": require("../../assets/fonts/PressStart2P-Regular.ttf"),
  });

  const handleRegister = () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Please enter both email and password.",
      });
      return;
    }

    dispatch(register({ email, password }));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? -100 : 0}
        style={styles.container}
      >
        {/* Glitch Header positioned absolutely at the top */}
        <View style={styles.glitchContainer}>
          <GlitchText text="Workout Planner" />
        </View>

        {/* Main Content centered vertically */}
        <View style={styles.contentContainer}>
          {/* Register Title */}
          <Text style={styles.title}>Register</Text>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
              style={styles.input}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
            style={styles.signInLink}
          >
            <Text style={styles.signInText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toast Messages */}
        <Toast />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  glitchContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 60,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: Platform.OS === "android" ? 40 : 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold", // Use normal font for the title
    textAlign: "center",
    color: "#fff",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#333",
    color: "#fff",
  },
  button: {
    backgroundColor: "#ff6600",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  signInLink: {
    marginTop: 24,
    alignItems: "center",
  },
  signInText: {
    color: "#ff6600",
    fontSize: 14,
  },
});

export default RegisterScreen;
