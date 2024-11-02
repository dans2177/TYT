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
import { useSelector, useDispatch } from "react-redux";
import { updateWorkoutInFirestore } from "../../redux/slices/workoutSlice";

const StartSection = () => {
  const dispatch = useDispatch();

  // Access workout data from Redux store
  const workoutData = useSelector((state) => state.workout.data);

  // Local state initialized from Redux store data
  const [isChecked, setIsChecked] = useState(workoutData?.stretch || false);
  const [isCardioChecked, setIsCardioChecked] = useState(
    workoutData?.cardio || false
  );
  const [selectedMinutes, setSelectedMinutes] = useState(
    workoutData?.cardioLength || 10
  );
  const [selectedExercise, setSelectedExercise] = useState(
    workoutData?.cardioType || "treadmill"
  );
  const [minutesModalVisible, setMinutesModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Update local state when workoutData changes
    setIsChecked(workoutData?.stretch || false);
    setIsCardioChecked(workoutData?.cardio || false);
    setSelectedMinutes(workoutData?.cardioLength || 10);
    setSelectedExercise(workoutData?.cardioType || "treadmill");

    // Show banner if both Stretch and Cardio are checked
    if (workoutData?.stretch && workoutData?.cardio) {
      setShowBanner(true);
    }
  }, [workoutData]);

  const motivationalQuotes = [
    "You’re doing great, keep going!",
    "Believe in yourself and all that you are.",
    "Strive for progress, not perfection.",
    "The only bad workout is the one you didn’t do.",
    "Your body can stand almost anything. It’s your mind you have to convince.",
  ];

  const handleCheckBoxPress = () => {
    const newStretchValue = !isChecked;
    setIsChecked(newStretchValue);

    // Update in Firestore
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        stretch: newStretchValue,
      })
    );

    // Show banner if both are checked
    if (newStretchValue && isCardioChecked) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  };

  const handleCardioCheckBoxPress = () => {
    const newCardioValue = !isCardioChecked;
    setIsCardioChecked(newCardioValue);

    // Update in Firestore
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        cardio: newCardioValue,
      })
    );

    // Show banner if both are checked
    if (isChecked && newCardioValue) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
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
    // Update in Firestore
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        cardioType: exercise.value,
      })
    );
  };

  const handleMinutesSelect = (minute) => {
    setSelectedMinutes(minute);
    closeMinutesModal();
    // Update in Firestore
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        cardioLength: minute,
      })
    );
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  return (
    <View className="h-40 mb-4 relative">
      {showBanner ? (
        <View className="flex-1 h-40 bg-blue-500 mx-2 w-fit rounded-3xl justify-center items-center relative">
          {/* Close (X) Button inside the banner */}
          <TouchableOpacity
            className="absolute top-0 right-0 p-1 m-2 border-2 border-blue-900 rounded-full"
            onPress={closeBanner}
            style={{ zIndex: 10 }}
          >
            <MaterialIcons name="close" size={18} color="black" />
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
        <View className="flex-row h-40 justify-around">
          {/* Stretch Tile */}
          <TouchableOpacity
            className="bg-lime-500 shadow-xl shadow-zinc-800 ml-2 rounded-3xl w-[45vw] p-4"
            onPress={handleCheckBoxPress}
          >
            <View className="flex-row justify-around items-center">
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
          <View className="bg-orange-500 mx-2 shadow-xl shadow-zinc-800 rounded-3xl w-[45vw] flex-row justify-around items-center">
            <View className="w-3/5">
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

            <View className="right-4 w-2/5">
              {/* Custom Picker for exercise type */}
              <TouchableOpacity
                className="rounded-lg"
                onPress={openExerciseModal}
              >
                <View className="pl-4 pt-1">
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
