// src/components/utils/StartSection.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  BackHandler,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { addOrUpdateWorkoutInFirestore } from "../../redux/slices/workoutsSlice"; // Ensure correct path

const StartSection = ({ todayWorkout, date, isLoading }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Local state
  const [isChecked, setIsChecked] = useState(undefined);
  const [isCardioChecked, setIsCardioChecked] = useState(undefined);
  const [lastCompleted, setLastCompleted] = useState(null);
  const [selectedMinutes, setSelectedMinutes] = useState(undefined);
  const [selectedExercise, setSelectedExercise] = useState(undefined);
  const [minutesModalVisible, setMinutesModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  const isInitialMount = useRef(true);

  // Initialize local state when todayWorkout is loaded
  useEffect(() => {
    if (!isLoading && todayWorkout) {
      setIsChecked(todayWorkout.stretch);
      setIsCardioChecked(todayWorkout.cardioCompleted);
      setSelectedMinutes(todayWorkout.cardio?.time || 10);
      setSelectedExercise(todayWorkout.cardio?.type || "treadmill");
    }
  }, [todayWorkout, isLoading]);

  // Update Firestore when state changes, but skip initial mount
  useEffect(() => {
    if (isInitialMount.current || isLoading || isChecked === undefined) {
      isInitialMount.current = false;
      return;
    }

    // Prepare the updated workout object
    const updatedWorkout = {
      ...todayWorkout,
      stretch: isChecked,
      cardio: {
        type: selectedExercise,
        time: selectedMinutes,
      },
      cardioCompleted: isCardioChecked,
    };

    // Function to check if two objects are equal (shallow comparison)
    const isEqual = (obj1, obj2) => {
      return (
        obj1.stretch === obj2.stretch &&
        obj1.cardioCompleted === obj2.cardioCompleted &&
        obj1.cardio?.type === obj2.cardio?.type &&
        obj1.cardio?.time === obj2.cardio?.time
      );
    };

    // Only dispatch if there's a change
    if (!isEqual(updatedWorkout, todayWorkout)) {
      dispatch(
        addOrUpdateWorkoutInFirestore({ date, workout: updatedWorkout })
      );
    }
  }, [
    isChecked,
    isCardioChecked,
    selectedExercise,
    selectedMinutes,
    todayWorkout,
    date,
    dispatch,
    isLoading,
  ]);

  const motivationalQuotes = [
    "You’re doing great, keep going!",
    "Believe in yourself and all that you are.",
    "Strive for progress, not perfection.",
    "The only bad workout is the one you didn’t do.",
    "Your body can stand almost anything. It’s your mind you have to convince.",
  ];

  const handleCheckBoxPress = () => {
    setIsChecked((prev) => !prev); // Toggle stretch checkbox
    if (!isChecked) {
      setLastCompleted("stretch");
    }
  };

  const handleCardioCheckBoxPress = () => {
    setIsCardioChecked((prev) => !prev); // Toggle cardio checkbox
    if (!isCardioChecked) {
      setLastCompleted("cardio");
    }
  };

  const exercises = [
    { label: "Treadmill", value: "treadmill", icon: "directions-run" },
    { label: "Bike", value: "bike", icon: "pedal-bike" },
    { label: "Running", value: "running", icon: "run-circle" },
  ];

  const openMinutesModal = () => setMinutesModalVisible(true);
  const closeMinutesModal = () => setMinutesModalVisible(false);

  const openExerciseModal = () => setExerciseModalVisible(true);
  const closeExerciseModal = () => setExerciseModalVisible(false);

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise.value);
    closeExerciseModal();
  };

  const handleMinutesSelect = (minute) => {
    setSelectedMinutes(minute);
    closeMinutesModal();
  };

  const undoLastComplete = () => {
    if (lastCompleted === "stretch") {
      setIsChecked(false);
    } else if (lastCompleted === "cardio") {
      setIsCardioChecked(false);
    }
    setLastCompleted(null);
  };

  const bothComplete = isChecked && isCardioChecked;

  // Handle Hardware Back Button (Android)
  useEffect(() => {
    const backAction = () => {
      if (bothComplete) {
        Alert.alert(
          "Undo Last Action",
          "Do you want to undo the last completed action?",
          [
            {
              text: "Cancel",
              onPress: () => null,
              style: "cancel",
            },
            { text: "YES", onPress: undoLastComplete },
          ]
        );
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [bothComplete, undoLastComplete]);

  // Handle Navigation Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (bothComplete) {
          Alert.alert(
            "Undo Last Action",
            "Do you want to undo the last completed action?",
            [
              {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
              },
              { text: "YES", onPress: undoLastComplete },
            ]
          );
          return true; // Prevent default behavior
        }
        return false; // Allow default behavior
      };

      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault();
        onBackPress();
      });

      return unsubscribe;
    }, [bothComplete, undoLastComplete, navigation])
  );

  // If data is still loading, show a loading indicator
  if (isLoading || isChecked === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00d1b2" />
        <Text style={styles.loadingText}>Loading your workout...</Text>
      </View>
    );
  }

  return (
    <View className="flex px-4">
      {bothComplete ? (
        <View className=" bg-blue-500 rounded-3xl justify-center items-center relative p-4 h-40">
          <TouchableOpacity
            className="absolute top-2 left-2 p-1 border-2 border-blue-900 rounded-full"
            onPress={undoLastComplete}
            style={{ zIndex: 10 }} // Ensures the button stays above the quote
          >
            <MaterialIcons name="undo" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-white text-lg text-center px-6">
            {
              motivationalQuotes[
                Math.floor(Math.random() * motivationalQuotes.length)
              ]
            }
          </Text>
        </View>
      ) : (
        <View className="flex-row justify-between">
          {/* Stretch Tile */}
          <TouchableOpacity
            className="bg-lime-500 shadow-xl shadow-zinc-800 rounded-3xl flex-1 p-4"
            onPress={handleCheckBoxPress}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-black text-2xl font-bold">Stretch</Text>
                <View className="pt-4">
                  <MaterialIcons
                    name={isChecked ? "check-box" : "check-box-outline-blank"}
                    size={32}
                    color="black"
                  />
                </View>
              </View>
              <View className="justify-center items-center">
                <MaterialIcons
                  name="self-improvement"
                  size={32}
                  color="black"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Cardio Tile */}
          <View className="bg-orange-500  shadow-xl shadow-zinc-800 rounded-3xl flex-1 p-4 ml-4 flex-row justify-between items-center">
            <View className="w-2/3">
              <Text className="text-black text-2xl font-bold">Cardio</Text>
              <View className="pt-4">
                <MaterialIcons
                  name={
                    isCardioChecked ? "check-box" : "check-box-outline-blank"
                  }
                  size={32}
                  color="black"
                  onPress={handleCardioCheckBoxPress}
                />
              </View>
            </View>

            <View className="w-1/3 flex-row justify-end items-center">
              {/* Custom Picker for exercise type */}
              <TouchableOpacity
                className="rounded-lg mr-2"
                onPress={openExerciseModal}
              >
                <MaterialIcons
                  name={
                    exercises.find((ex) => ex.value === selectedExercise)?.icon
                  }
                  size={32}
                  color="black"
                />
              </TouchableOpacity>
              {/* Custom Dropdown for cardio minutes */}
              <TouchableOpacity
                className="rounded-lg shadow px-2 py-1"
                onPress={openMinutesModal}
              >
                <Text className="text-black text-lg font-semibold">
                  {selectedMinutes} min
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal for Minutes Picker */}
          <Modal
            visible={minutesModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeMinutesModal}
          >
            <View
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <View className="bg-orange-500 rounded-lg w-3/4 p-4">
                <Text className="text-2xl mb-4">Select Duration</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {[...Array(60).keys()].map((x) => (
                    <TouchableOpacity
                      key={x + 1}
                      className="p-2"
                      onPress={() => handleMinutesSelect(x + 1)}
                    >
                      <Text className="text-xl">{x + 1} minutes</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={closeMinutesModal}>
                  <Text className="text-blue-900 mt-4 text-center">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal for Exercise Picker */}
          <Modal
            visible={exerciseModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeExerciseModal}
          >
            <View
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            >
              <View className="bg-orange-500 rounded-lg w-3/4 p-4">
                <Text className="text-2xl mb-4 text-black">
                  Select Exercise
                </Text>
                <FlatList
                  data={exercises}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="p-2 flex-row justify-between"
                      onPress={() => handleExerciseSelect(item)}
                    >
                      <Text className="text-xl">{item.label}</Text>
                      <MaterialIcons name={item.icon} size={24} color="black" />
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={closeExerciseModal}>
                  <Text className="text-blue-900 mt-4 text-center">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a202c",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#ffffff",
  },
};

export default StartSection;
