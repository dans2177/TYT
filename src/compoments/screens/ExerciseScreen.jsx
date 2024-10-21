// src/components/screens/ExerciseScreen.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import {
  loadExercises,
  addExerciseToFirestore,
  updateExerciseInFirestore,
  deleteExerciseFromFirestore,
} from "../../redux/slices/exerciseSlice";
import { Ionicons } from "@expo/vector-icons";
import { defaultExercises } from "../utils/WorkoutDefaults"; // Ensure this import is correct

const { width, height } = Dimensions.get("window");

// Muscle Groups as an array of strings
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
];

// Mapping muscle groups to broader categories
const muscleGroupCategories = {
  Quads: "Legs",
  Hamstrings: "Legs",
  Glutes: "Legs",
  Calves: "Legs",
  Chest: "Chest",
  Lats: "Back",
  Traps: "Back",
  "Lower Back": "Back",
  Shoulders: "Shoulders",
  Biceps: "Arms",
  Triceps: "Arms",
  Abs: "Core",
  Obliques: "Core",
};

const ExerciseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const exercisesFromState = useSelector(
    (state) => state.exercises?.data || []
  );
  const status = useSelector((state) => state.exercises.status);
  const errorMessage = useSelector((state) => state.exercises.error);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMuscleTags, setSelectedMuscleTags] = useState([]);
  const [localErrorMessage, setLocalErrorMessage] = useState("");
  const [weightDisplayOption, setWeightDisplayOption] = useState("max"); // 'max' or 'last'

  useEffect(() => {
    dispatch(loadExercises());
  }, [dispatch]);

  const openModal = (exercise = null) => {
    setSelectedExercise(exercise || {});
    setModalVisible(true);
    setIsEditing(!!exercise);
    setSelectedMuscleTags(exercise?.muscleTags || []);
    setLocalErrorMessage("");
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedExercise(null);
    setSelectedMuscleTags([]);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleSaveExercise = (exercise) => {
    if (!exercise.title || selectedMuscleTags.length === 0) {
      setLocalErrorMessage("Title and Muscle Tags are required.");
      return;
    }

    const updatedExercise = {
      ...exercise,
      lastUsed: getCurrentDate(),
      muscleTags: selectedMuscleTags,
    };

    if (isEditing) {
      dispatch(updateExerciseInFirestore(updatedExercise));
    } else {
      dispatch(addExerciseToFirestore(updatedExercise));
    }
    closeModal();
  };

  const handleDeleteExercise = (exerciseId) => {
    dispatch(deleteExerciseFromFirestore(exerciseId));
  };

  const confirmDelete = (exercise) => {
    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete the exercise "${exercise.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteExercise(exercise.id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Data migration for existing exercises
  const transformedExercises = exercisesFromState.map((exercise) => {
    if (!Array.isArray(exercise.muscleTags)) {
      if (exercise.muscleGroup) {
        // Convert muscleGroup to muscleTags
        exercise.muscleTags = [exercise.muscleGroup];
        delete exercise.muscleGroup; // Optionally remove muscleGroup property
      } else {
        // Initialize muscleTags as an empty array
        exercise.muscleTags = [];
      }
    }
    return exercise;
  });

  // Group exercises under broader categories
  const groupedExercises = {};

  transformedExercises.forEach((exercise) => {
    const muscleTags = exercise.muscleTags || [];

    const categories = new Set();

    muscleTags.forEach((tag) => {
      const category = muscleGroupCategories[tag] || tag; // Default to tag if no mapping
      categories.add(category);
    });

    let groupKey = "";

    if (categories.size === 1) {
      groupKey = Array.from(categories)[0];
    } else if (categories.size > 1) {
      groupKey = "Compound Exercises";
    } else {
      groupKey = "Other";
    }

    if (!groupedExercises[groupKey]) {
      groupedExercises[groupKey] = [];
    }
    groupedExercises[groupKey].push(exercise);
  });

  const handleAddDefaultExercises = () => {
    if (!Array.isArray(defaultExercises)) {
      console.error("defaultExercises is not an array:", defaultExercises);
      return;
    }

    defaultExercises.forEach((exercise) => {
      dispatch(addExerciseToFirestore(exercise));
    });
  };

  const toggleMuscleTagSelection = (group) => {
    setSelectedMuscleTags((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#18181b", "#0d0d0d", "#0d0d0d", "#1a1a1a", "#00FF00"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", width: width, height: height }}
      />

      <View className="pt-16 w-full flex-row justify-between items-center px-4">
        {/* Home Button with Emoji on the Left */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text className="text-white text-2xl">🏠</Text>
        </TouchableOpacity>

        {/* Centered Exercises Text */}
        <Text className="text-white text-2xl font-silkscreen">Exercises</Text>

        {/* Add Button with Emoji on the Right */}
        <TouchableOpacity onPress={() => openModal()}>
          <Text className="text-white text-2xl">➕</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {status === "loading" && exercisesFromState.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00FF00" />
          <Text className="text-white text-xl m-4 font-bold">
            Loading exercises...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {status === "failed" && (
        <Text className="text-red-500 text-center m-4">
          Error loading exercises: {errorMessage}
        </Text>
      )}

      {/* Toggle for Max Weight and Last Weight */}
      {status !== "loading" && (
        <>
          <View className="flex-row justify-center items-center mt-4">
            <TouchableOpacity
              onPress={() => setWeightDisplayOption("max")}
              className={`px-4 py-2 m-1 rounded-full ${
                weightDisplayOption === "max" ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-bold ${
                  weightDisplayOption === "max" ? "text-white" : "text-black"
                }`}
              >
                Max Weight
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWeightDisplayOption("last")}
              className={`px-4 py-2 m-1 rounded-full ${
                weightDisplayOption === "last" ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-bold ${
                  weightDisplayOption === "last" ? "text-white" : "text-black"
                }`}
              >
                Last Weight
              </Text>
            </TouchableOpacity>
          </View>

          {/* Exercises List */}
          <FlatList
            data={Object.entries(groupedExercises)}
            keyExtractor={([group]) => group}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
            renderItem={({ item: [group, exercises] }) => (
              <View key={group}>
                <Text className="text-white text-xl font-silkscreen mb-2">
                  {group}
                </Text>
                {exercises.map((exercise) => {
                  const displayWeight =
                    weightDisplayOption === "max"
                      ? exercise.max
                      : exercise.lastWeight !== undefined
                      ? exercise.lastWeight
                      : "N/A";

                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      onPress={() => openModal(exercise)}
                      onLongPress={() => confirmDelete(exercise)}
                    >
                      <View className="mb-4 p-4 bg-zinc-800 rounded-lg shadow-lg flex-row justify-between">
                        <View style={{ flex: 1 }}>
                          <Text
                            className="text-white text-xl font-silkscreen"
                            numberOfLines={2}
                            adjustsFontSizeToFit={false}
                          >
                            {exercise.title}
                          </Text>
                        </View>
                        <Text className="text-orange-500 text-2xl font-bold">
                          {displayWeight} lbs
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text className="text-white text-lg mb-4 font-silkscreen">
                  No exercises found. Would you like to add default exercises?
                </Text>
                <TouchableOpacity
                  onPress={handleAddDefaultExercises}
                  className="bg-green-500 p-3 rounded-lg flex-row items-center"
                >
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text className="text-white text-lg ml-2 font-bold">
                    Add Default Exercises
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {/* Add/Edit Exercise Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <View className="w-[90%] p-6 bg-zinc-800 rounded-lg shadow-lg mt-20">
                <Text className="text-white text-2xl mb-4 font-silkscreen">
                  {isEditing ? "Edit Exercise" : "Add Exercise"}
                </Text>

                {/* Exercise Title Input */}
                <TextInput
                  placeholder="Exercise Title"
                  value={selectedExercise?.title || ""}
                  onChangeText={(text) =>
                    setSelectedExercise((prev) => ({
                      ...prev,
                      title: text,
                    }))
                  }
                  className="bg-zinc-800 text-white p-3 rounded-lg border border-white h-12 mb-4 text-lg"
                  placeholderTextColor="#999"
                />

                {/* Muscle Tags Selector */}
                <View className="flex-wrap flex-row justify-center p-2">
                  {muscleGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      onPress={() => toggleMuscleTagSelection(group)}
                      className={`px-4 py-2 m-1 rounded-full ${
                        selectedMuscleTags.includes(group)
                          ? "bg-orange-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`font-bold ${
                          selectedMuscleTags.includes(group)
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Max Weight Input */}
                <TextInput
                  placeholder="Max Weight (lbs)"
                  keyboardType="numeric"
                  value={
                    selectedExercise?.max !== undefined
                      ? selectedExercise.max.toString()
                      : ""
                  }
                  onChangeText={(text) =>
                    setSelectedExercise((prev) => ({
                      ...prev,
                      max: parseInt(text) || 0,
                    }))
                  }
                  className="bg-zinc-800 text-white p-3 rounded-lg border border-white h-12 mb-4 text-lg"
                  placeholderTextColor="#999"
                />

                {/* Notes Input */}
                <TextInput
                  placeholder="Notes"
                  value={selectedExercise?.notes || ""}
                  onChangeText={(text) =>
                    setSelectedExercise((prev) => ({
                      ...prev,
                      notes: text,
                    }))
                  }
                  className="bg-zinc-800 text-white p-3 rounded-lg border border-white h-12 mb-4 text-lg"
                  placeholderTextColor="#999"
                />

                {/* Error Message */}
                {localErrorMessage ? (
                  <Text className="text-red-500 mb-4">{localErrorMessage}</Text>
                ) : null}

                {/* Save and Cancel Buttons */}
                <View className="flex-row justify-between space-x-2 mb-4">
                  <TouchableOpacity
                    onPress={() => handleSaveExercise(selectedExercise)}
                    className="bg-green-500 p-3 rounded-lg flex-1 flex-row justify-center items-center"
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color="white"
                    />
                    <Text className="text-white text-lg text-center ml-2 font-bold">
                      {isEditing ? "Save Changes" : "Add Exercise"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={closeModal}
                    className="bg-red-500 p-3 rounded-lg flex-1 flex-row justify-center items-center"
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="white"
                    />
                    <Text className="text-white text-lg text-center ml-2 font-bold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ExerciseScreen;
