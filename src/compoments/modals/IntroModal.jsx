import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../redux/slices/userSlice";
import { logout } from "../../redux/slices/authSlice";

const IntroModal = ({ navigation }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);

  const [feet, setFeet] = useState(""); // default value empty string
  const [inches, setInches] = useState(""); // default value empty string
  const [weight, setWeight] = useState("");
  const [workoutDays, setWorkoutDays] = useState(0); // Initial value for workout days

  useEffect(() => {
    if (userProfile) {
      const { height, weight, workoutDays } = userProfile;

      setFeet(height?.feet?.toString() || "");
      setInches(height?.inches?.toString() || "");
      setWeight(weight?.toString() || "");
      setWorkoutDays(workoutDays || 0);
    }
  }, [userProfile]);

  const handleCompleteSetup = () => {
    const parsedFeet = parseInt(feet, 10);
    const parsedInches = parseInt(inches, 10);
    const parsedWeight = parseInt(weight, 10);

    // Validation checks
    if (isNaN(parsedFeet) || parsedFeet < 0 || parsedFeet > 8) {
      Alert.alert("Invalid Input", "Feet must be between 0 and 8.");
      return;
    }

    if (isNaN(parsedInches) || parsedInches < 0 || parsedInches >= 12) {
      Alert.alert("Invalid Input", "Inches must be between 0 and 11.");
      return;
    }

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert("Invalid Input", "Weight must be a positive number.");
      return;
    }

    if (workoutDays < 0 || workoutDays > 7) {
      Alert.alert("Invalid Input", "Workout days must be between 0 and 7.");
      return;
    }

    // If all validations pass, update the profile
    const profile = {
      height: {
        feet: parsedFeet,
        inches: parsedInches,
      },
      weight: parsedWeight,
      workoutDays: workoutDays,
      introComplete: true,
    };

    dispatch(updateProfile(profile));
  };

  const incrementWorkoutDays = () => {
    if (workoutDays < 7) setWorkoutDays(workoutDays + 1);
  };

  const decrementWorkoutDays = () => {
    if (workoutDays > 0) setWorkoutDays(workoutDays - 1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="p-6 bg-zinc-900"
      >
        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={() => dispatch(logout())}
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 28 }}>🚪</Text>
        </TouchableOpacity>

        <Text className="text-4xl mb-6 text-center font-bold text-orange-500">
          Welcome! 🏋️‍♂️
        </Text>
        <Text className="text-lg mb-8 text-center text-gray-300">
          Let's complete your profile setup and get you ready for awesome
          workouts!
        </Text>

        {/* Height Input */}
        <View className="flex-row mb-6 justify-between">
          {/* Feet Input */}
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text className="text-gray-300 mb-2 text-center">Feet</Text>
            <TextInput
              placeholder="Feet"
              value={feet}
              onChangeText={setFeet}
              className="h-14 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 text-center text-lg"
              keyboardType="numeric"
              placeholderTextColor="#B5B5B5"
            />
          </View>

          {/* Inches Input */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text className="text-gray-300 mb-2 text-center">Inches</Text>
            <TextInput
              placeholder="Inches"
              value={inches}
              onChangeText={setInches}
              className="h-14 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 text-center text-lg"
              keyboardType="numeric"
              placeholderTextColor="#B5B5B5"
            />
          </View>
        </View>

        {/* Weight Input */}
        <TextInput
          placeholder="Weight (lbs)"
          value={weight}
          onChangeText={setWeight}
          className="h-14 border border-gray-600 mb-6 px-4 rounded-lg bg-gray-800 text-gray-100 text-lg"
          keyboardType="numeric"
          placeholderTextColor="#B5B5B5"
        />

        {/* Workout Days Input */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity
            onPress={decrementWorkoutDays}
            style={{
              backgroundColor: "#FF5A00",
              padding: 16,
              borderRadius: 10,
              alignItems: "center",
              width: 60,
            }}
          >
            <Text className="text-2xl text-white font-semibold">-</Text>
          </TouchableOpacity>

          <Text className="text-xl text-white font-semibold">
            {workoutDays}
          </Text>

          <TouchableOpacity
            onPress={incrementWorkoutDays}
            style={{
              backgroundColor: "#FF5A00",
              padding: 16,
              borderRadius: 10,
              alignItems: "center",
              width: 60,
            }}
          >
            <Text className="text-2xl text-white font-semibold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Complete Setup Button */}
        <TouchableOpacity
          onPress={handleCompleteSetup}
          style={{
            backgroundColor: "#FF5A00",
            paddingVertical: 16,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text className="text-xl text-white font-semibold">
            Complete Setup
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default IntroModal;
