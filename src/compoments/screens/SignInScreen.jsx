import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { signIn, setError } from "../redux/slices/authSlice"; // Ensure correct path
import Toast from "react-native-toast-message";

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
    <View className="flex-1 justify-center p-4 bg-white">
      <Text className="text-3xl mb-6 text-center font-bold text-gray-800">
        Sign In
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="h-12 border border-gray-300 mb-4 px-3 rounded bg-gray-100 text-lg"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCompleteType="email"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="h-12 border border-gray-300 mb-4 px-3 rounded bg-gray-100 text-lg"
        autoCompleteType="password"
      />
      <Button
        title={loading ? "Signing In..." : "Sign In"}
        onPress={handleSignIn}
        disabled={loading}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        className="mt-4 items-center"
      >
        <Text className="text-blue-600 text-lg">
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
