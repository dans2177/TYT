// SettingsScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  saveMuscleTags,
  loadMuscleTags,
} from "../../redux/slices/muscleTagsSlice";
import { updateProfile } from "../../redux/slices/userSlice"; // Import updateProfile from userSlice
import AssignMuscleGroupsModal from "../modals/AssignMuscleGroupsModal";
import { logout } from "../../redux/slices/authSlice";

// Muscle Groups
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

// Define a fixed list of colors
const dayColors = [
  "bg-violet-800",
  "bg-lime-800",
  "bg-red-800",
  "bg-emerald-800",
  "bg-pink-800",
  "bg-indigo-800",
  "bg-yellow-800",
];

// Styled components using NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);

const SettingsScreen = () => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showDaySelector, setShowDaySelector] = useState(false); // State for day selector modal
  const [isInitialized, setIsInitialized] = useState(false); // Initialization flag

  const navigator = useNavigation();
  const dispatch = useDispatch();

  // Redux selectors
  const { muscleTags = {}, status } = useSelector((state) => state.muscleTags); // Default to empty object if undefined
  const workoutDay = useSelector((state) => state.user.profile.workoutDay); // Get workoutDay from user slice

  const [selectedDays, setSelectedDays] = useState({}); // Initialize with an empty object
  const lastSavedDays = useRef(selectedDays); // Keep track of the last saved version

  // Load muscle tags when the component mounts
  useEffect(() => {
    dispatch(loadMuscleTags());
  }, [dispatch]);

  // Update selectedDays once muscleTags are loaded (only once)
  useEffect(() => {
    if (status === "succeeded" && !isInitialized) {
      setSelectedDays(muscleTags || { 1: [] }); // Use the muscle tags if they exist, or an empty object with one day
      setIsInitialized(true); // Prevent future updates
    }
  }, [muscleTags, status, isInitialized]);

  // Save only when selectedDays changes, ensuring minimal updates
  useEffect(() => {
    if (
      JSON.stringify(selectedDays) !== JSON.stringify(lastSavedDays.current)
    ) {
      dispatch(saveMuscleTags(selectedDays));
      lastSavedDays.current = selectedDays; // Update the last saved state
    }
  }, [selectedDays, dispatch]);

  // Dynamically determine the number of days based on selectedDays keys
  const days = Object.keys(selectedDays).length;

  const incrementDays = () => {
    if (days < 7) {
      // Check if days are less than 7
      setSelectedDays((prev) => {
        const newSelectedDays = { ...prev };
        // Determine the next day ID as the maximum existing day ID + 1
        const dayIds = Object.keys(newSelectedDays).map(Number);
        const nextDay = Math.max(...dayIds) + 1;
        newSelectedDays[nextDay] = []; // Add a new empty day
        return newSelectedDays;
      });
    } else {
      // Optionally, provide feedback to the user
      Alert.alert("Maximum Days Reached", "You can set up to 7 workout days.");
    }
  };

  const decrementDays = () => {
    if (days > 1) {
      setSelectedDays((prev) => {
        const newSelectedDays = { ...prev };
        const dayIds = Object.keys(newSelectedDays).map(Number);
        const maxDay = Math.max(...dayIds);
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

  // Function to handle selecting a new workout day
  const handleSelectWorkoutDay = (dayId) => {
    dispatch(updateProfile({ workoutDay: Number(dayId) }));
    setShowDaySelector(false);
  };

  // Get list of days that have muscle tags
  const daysWithTags = Object.keys(selectedDays).filter(
    (dayId) => selectedDays[dayId].length > 0
  );

  const handleLogout = () => {
    //alert and dispatch logout
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-900 ">
      {/* Assign Muscle Group Support Modal */}
      <AssignMuscleGroupsModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
      />

      {/* Day Selector Modal */}
      <Modal
        visible={showDaySelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDaySelector(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg w-4/5 p-6">
            <Text className="text-xl font-bold mb-4">Select Current Day</Text>
            {daysWithTags.length > 0 ? (
              <FlatList
                data={daysWithTags}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectWorkoutDay(item)}
                    className="py-2 px-4 rounded-md bg-gray-200 mb-2"
                  >
                    <Text className="text-lg">Day {item}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text className="text-gray-500">
                No days with muscle tags available.
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setShowDaySelector(false)}
              className="mt-4 py-2 px-4 rounded-md bg-red-500"
            >
              <Text className="text-white text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StyledView className="flex-1 justify-start">
        <StyledView className="flex-row justify-between items-center mb-4 p-4">
          {/* Home Button */}
          <TouchableOpacity onPress={() => navigator.navigate("Home")}>
            <StyledText className="text-white text-3xl">🏠</StyledText>
          </TouchableOpacity>

          {/* Settings Title */}
          <StyledText className="text-stone-300 text-4xl font-silkscreen">
            Settings
          </StyledText>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout}>
            <StyledText className="text-white text-3xl">🚪</StyledText>
          </TouchableOpacity>
        </StyledView>

        <ScrollView className="pt-4">
          {/* Stats */}
          <StyledView className="flex-row justify-around items-center py-2 bg-orange-700 mx-4 rounded-xl">
            <Text className="text-white text-3xl">🏋️</Text>
            <StyledView className="bg-orange-500 p-4 rounded-xl">
              <TouchableOpacity onPress={() => setShowDaySelector(true)}>
                <StyledText className="text-neutral-900 text-sm">
                  Current Day
                </StyledText>
                <StyledText className="text-black text-3xl">
                  {workoutDay || "N/A"}
                </StyledText>
              </TouchableOpacity>
            </StyledView>
            <StyledView className="bg-orange-500 p-4 rounded-xl">
              <StyledText className="text-neutral-900 text-sm">
                Total Workouts
              </StyledText>
              <StyledText className="text-black text-3xl">36</StyledText>
            </StyledView>
          </StyledView>

          {/* Workout Setup */}
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Text className="text-neutral-100 text-3xl">Workout Setup</Text>
            <TouchableOpacity onPress={() => setShowInfo(true)}>
              <StyledText className="text-white text-3xl">ℹ️</StyledText>
            </TouchableOpacity>
          </View>

          <View className="bg-stone-800 mx-4 my-2 rounded-xl p-4">
            <Text className="text-neutral-100">
              How many days a week do you workout?
            </Text>
            <StyledView className="flex-row justify-center items-center py-4">
              <TouchableOpacity
                onPress={decrementDays}
                className={`bg-red-600 rounded-full h-14 w-14 flex items-center justify-center mr-4 ${
                  days <= 1 ? "opacity-50" : ""
                }`}
                disabled={days <= 1} // Disable if days <=1
              >
                <StyledText className="text-white text-2xl">-</StyledText>
              </TouchableOpacity>
              <StyledText className="text-white text-3xl">{days}</StyledText>
              <TouchableOpacity
                onPress={incrementDays}
                className={`bg-amber-600 rounded-full h-14 w-14 flex items-center justify-center ml-4 ${
                  days >= 7 ? "opacity-50" : ""
                }`}
                disabled={days >= 7} // Disable if days >=7
              >
                <StyledText className="text-white text-2xl">+</StyledText>
              </TouchableOpacity>
            </StyledView>
          </View>

          {/* Muscle Groups */}
          <View className="bg-stone-800 mx-4 rounded-xl p-4">
            <View className="flex-row justify-between items-start">
              <Text className="text-neutral-100">
                What do you hit each day?
              </Text>
            </View>

            {/* Group Selection */}
            <StyledView className="flex-wrap flex-row justify-center p-2">
              {muscleGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  onPress={() => toggleSelection(group)}
                  className={`px-4 py-2 m-1 rounded-full ${
                    selectedGroups.includes(group)
                      ? "bg-orange-500"
                      : "bg-gray-200"
                  }`}
                >
                  <StyledText className="font-bold">{group}</StyledText>
                </TouchableOpacity>
              ))}
            </StyledView>

            {/* Day-wise Muscle Groups */}
            <ScrollView className="rounded-xl">
              {Object.keys(selectedDays).map((dayId, index) => (
                <TouchableOpacity
                  key={dayId}
                  onPress={() => dropOnDay(dayId)}
                  className={`${
                    dayColors[index % dayColors.length]
                  } p-2 mb-2 rounded-lg`}
                >
                  <StyledText className="text-white text-xl mr-2">
                    {`Day ${dayId}`}
                  </StyledText>
                  <StyledView className="flex-wrap flex-row">
                    {(selectedDays[dayId] || []).map((group, idx) => (
                      <TouchableOpacity
                        key={`${group}-${idx}`}
                        onLongPress={() => removeFromDay(dayId, group)}
                        className="bg-gray-900 px-3 py-2 m-1 rounded-full"
                      >
                        <StyledText className="text-white">{group}</StyledText>
                      </TouchableOpacity>
                    ))}
                  </StyledView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </StyledView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
