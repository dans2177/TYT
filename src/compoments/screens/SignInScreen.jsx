import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signIn, setError } from "../../redux/slices/authSlice"; // Ensure correct path
import Toast from "react-native-toast-message";
import img1 from "../../assets/ez.webp";
import Icon from "react-native-vector-icons/Ionicons"; // Using Ionicons as an example

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: error,
      });
      dispatch(setError(null)); // Clear error after displaying
    }

    if (user) {
      Toast.show({
        type: "success",
        text1: "Sign In Successful",
        text2: `Welcome back, ${user.displayName || user.userEmail}!`,
      });
      // Optionally navigate to another screen after successful sign-in
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

  return (
    <ImageBackground source={img1} style={styles.imageBackground}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          {/* Sign In Title */}
          <Text style={styles.title}>Sign In</Text>

          {/* Input Fields and Button */}
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCompleteType="email"
              placeholderTextColor="#666"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              autoCompleteType="password"
              placeholderTextColor="#666"
            />
            <View style={styles.buttonContainer}>
              <Button
                title={loading ? "Signing In..." : "Sign In"}
                onPress={handleSignIn}
                disabled={loading}
                color="#ff7f50" // Coral color for visibility
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.registerLink}
            >
              <View style={styles.iconBubble}>
                <Icon name="person-add-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Toast Messages */}
      <Toast />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 60,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    marginBottom: 16,
  },
  registerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubble: {
    backgroundColor: "#1e90ff",
    borderRadius: 12,
    padding: 6,
    marginRight: 8,
  },
  registerText: {
    color: "#1e90ff",
    fontSize: 16,
  },
});

export default SignInScreen;
