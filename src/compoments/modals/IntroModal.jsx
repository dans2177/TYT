import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../redux/slices/userSlice";
import { logout } from "../redux/slices/authSlice";

const IntroModal = ({ navigation }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [workoutDays, setWorkoutDays] = useState("");

  useEffect(() => {
    if (userProfile) {
      setHeight(userProfile.height || "");
      setWeight(userProfile.weight || "");
      setWorkoutDays(userProfile.workoutDays || "");
    }
  }, [userProfile]);

  const handleCompleteSetup = () => {
    const profile = {
      height,
      weight,
      workoutDays,
      introComplete: true,
    };
    // Dispatch the action to update the profile
    dispatch(updateProfile(profile));
  };

  return (
    <View className="flex-1 justify-center p-4 bg-white">
      <Text className="text-3xl mb-6 text-center font-bold text-gray-800">
        Welcome! Let's complete your setup
      </Text>
      <TextInput
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        className="h-12 border border-gray-300 mb-4 px-3 rounded bg-gray-100 text-lg"
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        className="h-12 border border-gray-300 mb-4 px-3 rounded bg-gray-100 text-lg"
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Days you workout per week"
        value={workoutDays}
        onChangeText={setWorkoutDays}
        className="h-12 border border-gray-300 mb-4 px-3 rounded bg-gray-100 text-lg"
        keyboardType="numeric"
      />
      <Button title="Complete Setup" onPress={handleCompleteSetup} />
      {/* Logout Button */}
      <TouchableOpacity
        onPress={() => dispatch(logout())}
        className="mt-4 items-center"
      >
        <Text className="text-red-600 text-lg">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IntroModal;
