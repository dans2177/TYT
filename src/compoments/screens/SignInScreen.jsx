import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signIn, setError } from "../../redux/slices/authSlice";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useFonts } from "expo-font";
import GlitchText from "../utils/GlitchText"; // Import the GlitchText component

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [fontsLoaded] = useFonts({
    "PressStart2P-Regular": require("../../assets/fonts/PressStart2P-Regular.ttf"),
  });

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: error,
      });
      dispatch(setError(null));
    }

    if (user) {
      Toast.show({
        type: "success",
        text1: "Sign In Successful",
        text2: `Welcome back, ${user.displayName || user.userEmail}!`,
      });
    }
  }, [error, user, dispatch]);

  const handleSignIn = () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Please enter both email and password.",
      });
      return;
    }

    dispatch(signIn({ email, password }));
  };

  const handleForgotPassword = () => {
    setForgotPasswordVisible(true);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: "Please enter your email address.",
      });
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setForgotPasswordVisible(false);
      Toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "Please check your email to reset your password.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
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
          {/* Sign In Title */}
          <Text style={styles.title}>Sign In</Text>

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

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerLink}
          >
            <View style={styles.registerIcon}>
              <Icon name="person-add-outline" size={16} color="#fff" />
            </View>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isForgotPasswordVisible}
          onRequestClose={() => {
            setForgotPasswordVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TextInput
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
                style={styles.modalInput}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handlePasswordReset}
              >
                <Text style={styles.modalButtonText}>Send Reset Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setForgotPasswordVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    marginTop: Platform.OS === "android" ? 80 : 100,
  },
  title: {
    fontSize: 24,
    fontFamily: "PressStart2P-Regular",
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
  forgotPassword: {
    marginTop: 16,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#ff6600",
  },
  registerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  registerIcon: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "#ff6600",
    borderRadius: 50,
  },
  registerText: {
    color: "#ff6600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "PressStart2P-Regular",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    color: "#fff",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#ff6600",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  modalCancelButton: {
    backgroundColor: "#666",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SignInScreen;
