// IntroModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../redux/slices/userSlice";
import { logout } from "../../redux/slices/authSlice";
import WorkoutSetupAndMuscleGroups from "../utils/WorkoutSetupAndMuscleGroups";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadMuscleTags,
  saveMuscleTags,
} from "../../redux/slices/muscleTagsSlice";

const IntroModal = ({ navigation }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.user.profile);

  // Destructure muscleTags and status from the Redux state
  const { muscleTags = {}, status } = useSelector((state) => state.muscleTags);

  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState(""); // New state for last name
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [workoutDays, setWorkoutDays] = useState(1); // Default to 1 day
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedDays, setSelectedDays] = useState({ 1: [] });
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // New state for page navigation

  const muscleGroups = [
    "Quads",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Chest",
    "Lats",
    "Traps",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Abs",
    "Obliques",
    "Lower Back",
    "Forearms",
  ];

  const dayColors = [
    "bg-violet-800",
    "bg-lime-800",
    "bg-red-800",
    "bg-emerald-800",
    "bg-pink-800",
    "bg-indigo-800",
    "bg-yellow-800",
  ];

  useEffect(() => {
    // Dispatch loadMuscleTags when the component mounts
    dispatch(loadMuscleTags());
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      const { height, weight, workoutDays, firstName, lastName } = userProfile;
      setFeet(height?.feet?.toString() || "");
      setInches(height?.inches?.toString() || "");
      setWeight(weight?.toString() || "");
      setWorkoutDays(workoutDays || 1);
      setFirstName(firstName || "");
      setLastName(lastName || "");
    }
  }, [userProfile]);

  // Update selectedDays when muscleTags are successfully loaded
  useEffect(() => {
    if (status === "succeeded" && !isInitialized) {
      setSelectedDays(muscleTags || { 1: [] });
      setIsInitialized(true);
    }
  }, [muscleTags, status, isInitialized]);

  // Save muscleTags whenever selectedDays change
  useEffect(() => {
    if (isInitialized) {
      dispatch(saveMuscleTags(selectedDays));
    }
  }, [selectedDays, dispatch, isInitialized]);

  const handleNext = () => {
    const parsedFeet = parseInt(feet, 10);
    const parsedInches = parseInt(inches, 10);
    const parsedWeight = parseInt(weight, 10);

    if (!firstName.trim()) {
      Alert.alert("Invalid Input", "First name is required.");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("Invalid Input", "Last name is required.");
      return;
    }

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

    // If all inputs are valid, move to the next page
    setCurrentPage(2);
  };

  const handleCompleteSetup = () => {
    if (workoutDays < 1 || workoutDays > 7) {
      Alert.alert("Invalid Input", "Workout days must be between 1 and 7.");
      return;
    }

    const parsedFeet = parseInt(feet, 10);
    const parsedInches = parseInt(inches, 10);
    const parsedWeight = parseInt(weight, 10);

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      height: {
        feet: parsedFeet,
        inches: parsedInches,
      },
      weight: parsedWeight,
      workoutDays: workoutDays,
      workoutDay: 1, // Set current workout day to 1
      introComplete: true,
    };

    dispatch(updateProfile(profile));
  };

  const incrementWorkoutDays = () => {
    if (workoutDays < 7) {
      setWorkoutDays(workoutDays + 1);
      setSelectedDays((prev) => {
        const newDay = (Object.keys(prev).length + 1).toString();
        return { ...prev, [newDay]: [] };
      });
    }
  };

  const decrementWorkoutDays = () => {
    if (workoutDays > 1) {
      setWorkoutDays(workoutDays - 1);
      setSelectedDays((prev) => {
        const newSelectedDays = { ...prev };
        const dayIds = Object.keys(newSelectedDays).map(Number);
        const maxDay = Math.max(...dayIds).toString();
        delete newSelectedDays[maxDay];
        return newSelectedDays;
      });
    }
  };

  const toggleSelection = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const dropOnDay = (dayId) => {
    if (selectedGroups.length) {
      setSelectedDays((prev) => ({
        ...prev,
        [dayId]: [
          ...(prev[dayId] || []),
          ...selectedGroups.filter((group) => !prev[dayId]?.includes(group)),
        ],
      }));
      setSelectedGroups([]);
    }
  };

  const removeFromDay = (dayId, groupToRemove) => {
    setSelectedDays((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((group) => group !== groupToRemove),
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View className="flex-1 bg-zinc-900">
      <SafeAreaView onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="bg-zinc-900"
        >
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              position: "absolute",
              top: 10,
              right: 5,
              padding: 10,
              borderRadius: 10,
              zIndex: 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 28 }}>🚪</Text>
          </TouchableOpacity>

          <Text className="text-4xl my-6 text-center font-bold text-orange-500">
            Welcome! 🏋️‍♂️
          </Text>
          {currentPage === 1 ? (
            <Text className="text-lg mb-8 text-center text-gray-300">
              Let's complete your profile setup and get you ready for awesome
              workouts!
            </Text>
          ) : null}

          {currentPage === 1 ? (
            // First Page Content
            <>
              {/* First Name Input */}
              <View className="px-4 mb-2">
                <Text className="text-gray-300 mb-2">First Name</Text>
                <TextInput
                  placeholder="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  className="h-14 border border-gray-600 mb-6 px-4 rounded-lg bg-gray-800 text-gray-100 text-lg"
                  placeholderTextColor="#B5B5B5"
                />
              </View>

              {/* Last Name Input */}
              <View className="px-4 mb-2">
                <Text className="text-gray-300 mb-2">Last Name</Text>
                <TextInput
                  placeholder="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  className="h-14 border border-gray-600 mb-6 px-4 rounded-lg bg-gray-800 text-gray-100 text-lg"
                  placeholderTextColor="#B5B5B5"
                />
              </View>

              {/* Height Inputs */}
              <View className="flex-row mb-6 justify-between px-4">
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

              {/* Weight Input with Label */}
              <View className="px-4 mb-6">
                <Text className="text-gray-300 mb-2">Weight (lbs)</Text>
                <TextInput
                  placeholder="Weight (lbs)"
                  value={weight}
                  onChangeText={setWeight}
                  className="h-14 border border-gray-600 mb-6 px-4 rounded-lg bg-gray-800 text-gray-100 text-lg"
                  keyboardType="numeric"
                  placeholderTextColor="#B5B5B5"
                />
              </View>

              <View className="px-4 my-6">
                <TouchableOpacity
                  onPress={handleNext}
                  style={{
                    backgroundColor: "#FF5A00",
                    paddingVertical: 16,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                  className="mb-20"
                >
                  <Text className="text-xl text-white font-semibold">Next</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Second Page Content
            <>
              {/* Use the shared WorkoutSetupAndMuscleGroups component */}
              <WorkoutSetupAndMuscleGroups
                days={Object.keys(selectedDays).length}
                incrementDays={incrementWorkoutDays}
                decrementDays={decrementWorkoutDays}
                selectedGroups={selectedGroups}
                toggleSelection={toggleSelection}
                selectedDays={selectedDays}
                dropOnDay={dropOnDay}
                removeFromDay={removeFromDay}
                muscleGroups={muscleGroups}
                dayColors={dayColors}
              />

              <View className="px-4 my-6">
                <TouchableOpacity
                  onPress={handleCompleteSetup}
                  style={{
                    backgroundColor: "#FF5A00",
                    paddingVertical: 16,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                  className="mb-20"
                >
                  <Text className="text-xl text-white font-semibold">
                    Complete Setup
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default IntroModal;
