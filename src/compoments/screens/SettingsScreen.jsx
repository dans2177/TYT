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
import { updateProfile } from "../../redux/slices/userSlice";
import AssignMuscleGroupsModal from "../modals/AssignMuscleGroupsModal";
import { logout } from "../../redux/slices/authSlice";
import FeedbackModal from "../modals/FeedbackModal";
import WorkoutSetupAndMuscleGroups from "../utils/WorkoutSetupAndMuscleGroups"; // Import the new component

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
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const navigator = useNavigation();
  const dispatch = useDispatch();

  // Redux selectors
  const { muscleTags = {}, status } = useSelector((state) => state.muscleTags);
  const workoutDay = useSelector((state) => state.user.profile.workoutDay);

  const [selectedDays, setSelectedDays] = useState({});
  const lastSavedDays = useRef(selectedDays);

  useEffect(() => {
    dispatch(loadMuscleTags());
  }, [dispatch]);

  useEffect(() => {
    if (status === "succeeded" && !isInitialized) {
      setSelectedDays(muscleTags || { 1: [] });
      setIsInitialized(true);
    }
  }, [muscleTags, status, isInitialized]);

  useEffect(() => {
    if (
      JSON.stringify(selectedDays) !== JSON.stringify(lastSavedDays.current)
    ) {
      dispatch(saveMuscleTags(selectedDays));
      lastSavedDays.current = selectedDays;
    }
  }, [selectedDays, dispatch]);

  const days = Object.keys(selectedDays).length;

  const incrementDays = () => {
    if (days < 7) {
      setSelectedDays((prev) => {
        const newSelectedDays = { ...prev };
        const dayIds = Object.keys(newSelectedDays).map(Number);
        const nextDay = Math.max(...dayIds) + 1;
        newSelectedDays[nextDay] = [];
        return newSelectedDays;
      });
    } else {
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

  const handleSelectWorkoutDay = (dayId) => {
    dispatch(updateProfile({ workoutDay: Number(dayId) }));
    setShowDaySelector(false);
  };

  const daysWithTags = Object.keys(selectedDays).filter(
    (dayId) => selectedDays[dayId].length > 0
  );

  const handleLogout = () => {
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
      <AssignMuscleGroupsModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
      />
      <Modal
        visible={showDaySelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDaySelector(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 ">
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

      <StyledView className="flex-1 justify-start ">
        <StyledView className="flex-row justify-between items-center  p-2">
          <TouchableOpacity onPress={() => navigator.navigate("Home")}>
            <StyledText className="text-white text-3xl">🏠</StyledText>
          </TouchableOpacity>
          <StyledText className="text-stone-300 text-4xl font-handjet">
            Settings
          </StyledText>
          <TouchableOpacity onPress={handleLogout}>
            <StyledText className="text-white text-3xl">🚪</StyledText>
          </TouchableOpacity>
        </StyledView>

        <ScrollView className="pt-4">
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
            <StyledView className="bg-purple-600 p-4 h-full rounded-xl">
              <TouchableOpacity
                onPress={() => setShowFeedbackModal(true)}
                className="flex-col items-center"
              >
                <StyledText className="text-white text-lg mr-2">
                  Feedback
                </StyledText>
                <Text className="text-white text-2xl">💬</Text>
              </TouchableOpacity>
            </StyledView>
          </StyledView>

          {/* Use the shared WorkoutSetupAndMuscleGroups component */}
          <WorkoutSetupAndMuscleGroups
            days={days}
            incrementDays={incrementDays}
            decrementDays={decrementDays}
            selectedGroups={selectedGroups}
            toggleSelection={toggleSelection}
            selectedDays={selectedDays}
            dropOnDay={dropOnDay}
            removeFromDay={removeFromDay}
            muscleGroups={muscleGroups}
            dayColors={dayColors}
            showFeedbackModal={showFeedbackModal}
            setShowFeedbackModal={setShowFeedbackModal}
          />
        </ScrollView>
      </StyledView>

      {/* Render the FeedbackModal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
