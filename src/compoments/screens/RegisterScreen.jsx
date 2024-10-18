import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { register, setError } from "../../redux/slices/authSlice"; // Ensure correct path
import Toast from "react-native-toast-message";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error,
      });
      dispatch(setError(null)); // Clear error after displaying
    }

    if (user) {
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: `Welcome, ${user.displayName || user.userEmail}!`,
      });
      navigation.navigate("Intro"); // Navigate to Intro after successful registration
    }
  }, [error, user, dispatch, navigation]);

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

  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <Text className="text-3xl mb-6 text-center font-bold text-gray-800">
        Register
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
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("SignIn")}
        className="mt-4 items-center"
      >
        <Text className="text-blue-600 text-lg">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
