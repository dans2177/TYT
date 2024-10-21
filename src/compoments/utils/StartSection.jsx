// src/components/utils/StartSection.js

import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { addOrUpdateWorkoutInFirestore } from "../../redux/slices/workoutSlice";

const StartSection = ({ todayWorkout, date }) => {
  const dispatch = useDispatch();

  const [isChecked, setIsChecked] = useState(todayWorkout?.stretch || false);
  const [isCardioChecked, setIsCardioChecked] = useState(
    todayWorkout?.cardioCompleted || false
  );
  const [lastCompleted, setLastCompleted] = useState(null);
  const [selectedMinutes, setSelectedMinutes] = useState(
    todayWorkout?.cardio?.time || 10
  );
  const [selectedExercise, setSelectedExercise] = useState(
    todayWorkout?.cardio?.type || "treadmill"
  );
  const [minutesModalVisible, setMinutesModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);

  useEffect(() => {
    // Whenever relevant state changes, save to Firestore
    const updatedWorkout = {
      ...todayWorkout,
      stretch: isChecked,
      cardio: {
        type: selectedExercise,
        time: selectedMinutes,
      },
      cardioCompleted: isCardioChecked,
    };
    dispatch(addOrUpdateWorkoutInFirestore({ date, workout: updatedWorkout }));
  }, [
    isChecked,
    isCardioChecked,
    selectedExercise,
    selectedMinutes,
    todayWorkout,
    date,
    dispatch,
  ]);

  const motivationalQuotes = [
    "You’re doing great, keep going!",
    "Believe in yourself and all that you are.",
    "Strive for progress, not perfection.",
    "The only bad workout is the one you didn’t do.",
    "Your body can stand almost anything. It’s your mind you have to convince.",
  ];

  const handleCheckBoxPress = () => {
    setIsChecked(!isChecked); // Toggle stretch checkbox
    if (!isChecked) {
      setLastCompleted("stretch");
    }
  };

  const handleCardioCheckBoxPress = () => {
    setIsCardioChecked(!isCardioChecked); // Toggle cardio checkbox
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

  return (
    <View className="flex-1">
      {bothComplete ? (
        <View className="flex-1 bg-blue-500 m-4 h-40 rounded-3xl justify-center items-center relative">
          <TouchableOpacity
            className="absolute top-0 left-0 p-1 m-2 border-2 border-blue-900 rounded-full"
            onPress={undoLastComplete}
            style={{ zIndex: 10 }}
          >
            <MaterialIcons name="undo" size={18} color="black" />
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
        <View className="flex-row justify-between h-40">
          {/* Stretch Tile */}
          <TouchableOpacity
            className="bg-lime-500 my-4 mr-2 shadow-xl
                    shadow-zinc-800   ml-4 rounded-3xl w-[45vw] p-4 "
            onPress={handleCheckBoxPress}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-black text-2xl pl-2 font-bold">
                  Stretch
                </Text>
                <View className="pt-4 pl-2">
                  <MaterialIcons
                    name={isChecked ? "check-box" : "check-box-outline-blank"}
                    size={48}
                    color="black"
                  />
                </View>
              </View>
              <View className="justify-center items-center w-1/3">
                <MaterialIcons
                  name="self-improvement"
                  size={56}
                  color="black"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Cardio Tile */}
          <View className="bg-orange-500 my-4 mr-4 shadow-xl shadow-zinc-800 rounded-3xl w-[45vw] flex-row justify-between items-center">
            <View className="w-3/5 ">
              <Text className="text-black text-2xl pl-4 font-bold">Cardio</Text>
              <View className="pt-4 pl-4">
                <MaterialIcons
                  name={
                    isCardioChecked ? "check-box" : "check-box-outline-blank"
                  }
                  size={48}
                  color="black"
                  onPress={handleCardioCheckBoxPress}
                />
              </View>
            </View>

            <View className="right-4 w-2/5 ">
              {/* Custom Picker for exercise type */}
              <TouchableOpacity
                className="rounded-lg"
                onPress={openExerciseModal}
              >
                <View className="pl-4 pt-1 ">
                  <MaterialIcons
                    name={
                      exercises.find((ex) => ex.value === selectedExercise)
                        ?.icon
                    }
                    size={64}
                    color="black"
                  />
                </View>
              </TouchableOpacity>
              {/* Custom Dropdown for cardio minutes */}
              <TouchableOpacity
                className="pl-3 rounded-lg shadow"
                onPress={openMinutesModal}
              >
                <Text className="text-black text-lg justify-start font-semibold">
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
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            >
              <View className="bg-orange-500 rounded-lg w-3/4 p-4">
                <Text className="text-2xl mb-4">Select Duration</Text>
                <ScrollView style={{ maxHeight: 400 }}>
                  {[...Array(60).keys()].map((x) => (
                    <TouchableOpacity
                      key={x + 1}
                      className="p-4"
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
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
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
                      className="p-4 flex-row justify-between"
                      onPress={() => handleExerciseSelect(item)}
                    >
                      <Text className="text-xl">{item.label}</Text>
                      <MaterialIcons name={item.icon} size={32} color="black" />
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

export default StartSection;
