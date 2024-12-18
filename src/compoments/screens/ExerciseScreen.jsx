// src/components/screens/ExerciseScreen.jsx

import React, { useState, useEffect, useMemo } from "react";
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
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import {
  loadExercises,
  addExerciseToFirestore,
  updateExerciseInFirestore,
  deleteExerciseFromFirestore,
  deleteAllExercisesFromFirestore,
} from "../../redux/slices/exerciseSlice";
import { Ionicons } from "@expo/vector-icons";
import { defaultExercises } from "../utils/ExerciseDefaults";
import { SafeAreaView } from "react-native-safe-area-context";

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
  "Forearms",
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
  Forearms: "Arms",
  Abs: "Core",
  Obliques: "Core",
};

const ExerciseScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const exercisesFromState = useSelector(
    (state) => state.exercises?.data || []
  );
  const status = useSelector((state) => state.exercises.fetchStatus);
  const errorMessage = useSelector((state) => state.exercises.fetchError);

  // Additional selectors for delete all status and error
  const deleteAllStatus = useSelector(
    (state) => state.exercises.deleteAllStatus
  );
  const deleteAllError = useSelector((state) => state.exercises.deleteAllError);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMuscleTags, setSelectedMuscleTags] = useState([]);
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  // Search State Variable
  const [searchQuery, setSearchQuery] = useState("");

  // Form State Variables
  const [formTitle, setFormTitle] = useState("");
  const [formMax, setFormMax] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [currentExerciseId, setCurrentExerciseId] = useState(null);

  useEffect(() => {
    dispatch(loadExercises());
  }, [dispatch]);

  const openModal = (exercise = null) => {
    if (exercise) {
      setIsEditing(true);
      setFormTitle(exercise.title || "");
      setFormMax(
        exercise.max !== undefined && exercise.max !== null
          ? exercise.max.toString()
          : ""
      );
      setSelectedMuscleTags(exercise.muscleTags || []);
      setFormNotes(exercise.notes || "");
      setCurrentExerciseId(exercise.id);
    } else {
      setIsEditing(false);
      setFormTitle("");
      setFormMax("");
      setSelectedMuscleTags([]);
      setFormNotes("");
      setCurrentExerciseId(null);
    }
    setLocalErrorMessage("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormTitle("");
    setFormMax("");
    setSelectedMuscleTags([]);
    setFormNotes("");
    setCurrentExerciseId(null);
    setLocalErrorMessage("");
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleSaveExercise = () => {
    if (!formTitle.trim() || selectedMuscleTags.length === 0) {
      setLocalErrorMessage("Title and Muscle Tags are required.");
      return;
    }

    const updatedExercise = {
      title: formTitle.trim(),
      max: formMax ? parseInt(formMax) : 0,
      lastUsed: getCurrentDate(),
      muscleTags: selectedMuscleTags,
      notes: formNotes.trim(),
    };

    if (isEditing && currentExerciseId) {
      dispatch(
        updateExerciseInFirestore({
          id: currentExerciseId,
          ...updatedExercise,
        })
      );
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

  const confirmDeleteAll = () => {
    Alert.alert(
      "Delete All Exercises",
      "Are you sure you want to delete all exercises? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          onPress: () => handleDeleteAllExercises(),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAllExercises = () => {
    dispatch(deleteAllExercisesFromFirestore());
  };

  // Data migration for existing exercises
  const transformedExercises = useMemo(() => {
    return exercisesFromState.map((exercise) => {
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
  }, [exercisesFromState]);

  // Filtered Exercises based on search query
  const filteredExercises = useMemo(() => {
    if (searchQuery.trim() === "") {
      return transformedExercises;
    }
    return transformedExercises.filter((exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transformedExercises]);

  // Group exercises under all relevant broader categories
  const groupedExercises = useMemo(() => {
    const groups = {};

    filteredExercises.forEach((exercise) => {
      const muscleTags = exercise.muscleTags || [];

      const categories = new Set();

      muscleTags.forEach((tag) => {
        const category = muscleGroupCategories[tag] || tag; // Default to tag if no mapping
        categories.add(category);
      });

      if (categories.size === 0) {
        // If no categories mapped, place under "Other"
        if (!groups["Other"]) {
          groups["Other"] = [];
        }
        groups["Other"].push(exercise);
        return;
      }

      categories.forEach((category) => {
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(exercise);
      });
    });

    return groups;
  }, [filteredExercises]);

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

  // Handle closing the modal with automatic save
  const handleModalClose = () => {
    // Attempt to save
    if (!formTitle.trim() || selectedMuscleTags.length === 0) {
      setLocalErrorMessage("Title and Muscle Tags are required.");
      return;
    }

    const updatedExercise = {
      title: formTitle.trim(),
      max: formMax ? parseInt(formMax) : 0,
      lastUsed: getCurrentDate(),
      muscleTags: selectedMuscleTags,
      notes: formNotes.trim(),
    };

    if (isEditing && currentExerciseId) {
      dispatch(
        updateExerciseInFirestore({
          id: currentExerciseId,
          ...updatedExercise,
        })
      );
    } else {
      dispatch(addExerciseToFirestore(updatedExercise));
    }

    closeModal();
  };

  // Optional: Define a preferred order for categories
  const categoryOrder = [
    "Legs",
    "Chest",
    "Back",
    "Shoulders",
    "Arms",
    "Core",
    "Other",
  ];

  // Sort groupedExercises based on categoryOrder
  const sortedGroupedExercises = useMemo(() => {
    const sortedGroups = {};
    categoryOrder.forEach((category) => {
      if (groupedExercises[category]) {
        sortedGroups[category] = groupedExercises[category];
      }
    });
    // Add any remaining categories not specified in categoryOrder
    Object.keys(groupedExercises).forEach((category) => {
      if (!sortedGroups[category]) {
        sortedGroups[category] = groupedExercises[category];
      }
    });
    return sortedGroups;
  }, [groupedExercises]);

  return (
    <SafeAreaView className="flex-1 bg-stone-800">
=

      {/* Header */}
      <View className="w-full flex-row justify-between items-center px-4">
        {/* Home Button with Emoji on the Left */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          accessibilityLabel="Home Button"
          accessibilityHint="Navigates to the Home screen"
        >
          <Text className="text-white text-3xl">🏠</Text>
        </TouchableOpacity>

        {/* Centered Exercises Text */}
        <Text className="text-white text-4xl font-handjet text-center">
          Exercises
        </Text>

        {/* Right Side Buttons: Add and Delete All */}
        <View className="flex-row">
          {/* Add Button with Emoji */}
          <TouchableOpacity
            onPress={() => openModal()}
            accessibilityLabel="Add Exercise Button"
            accessibilityHint="Opens the modal to add a new exercise"
            className="mr-4"
          >
            <Text className="text-white text-3xl">➕</Text>
          </TouchableOpacity>

          {/* Delete All Button with Emoji */}
          <TouchableOpacity
            onPress={confirmDeleteAll}
            accessibilityLabel="Delete All Exercises Button"
            accessibilityHint="Deletes all exercises after confirmation"
          >
            <Text className="text-white text-3xl">🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-gray-700 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#a1a1aa" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-white"
            placeholder="Search exercises..."
            placeholderTextColor="#a1a1aa"
            accessible={true}
            accessibilityLabel="Search Exercises"
            accessibilityHint="Type to search for exercises"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading Indicator */}
      {(status === "loading" && exercisesFromState.length === 0) ||
        (deleteAllStatus === "loading" && (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="20" color="#00FF00" />
            <Text className="text-white text-lg mt-2 font-bold">
              {deleteAllStatus === "loading"
                ? "Deleting all exercises..."
                : "Loading exercises..."}
            </Text>
          </View>
        ))}

      {/* Error Message */}
      {(status === "failed" || deleteAllStatus === "failed") && (
        <Text className="text-red-500 text-center m-4 text-md">
          {status === "failed"
            ? `Error loading exercises: ${errorMessage}`
            : `Error deleting exercises: ${deleteAllError}`}
        </Text>
      )}

      {/* Success Message for Delete All */}
      {deleteAllStatus === "succeeded" && (
        <Text className="text-green-500 text-center m-4 text-md">
          All exercises have been deleted successfully.
        </Text>
      )}

      {/* Exercises List */}
      {status !== "loading" && deleteAllStatus !== "loading" && (
        <FlatList
          data={Object.entries(sortedGroupedExercises)}
          keyExtractor={([group]) => group}
          className="p-4 py-2"
          renderItem={({ item: [group, exercises] }) => (
            <View key={group} className="mb-4">
              <Text className="text-white text-lg mb-2 font-bold ">
                {group}
              </Text>
              {exercises.map((exercise) => {
                const displayWeight = exercise.max;

                return (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => openModal(exercise)}
                    onLongPress={() => confirmDelete(exercise)}
                    className="mb-3"
                    accessibilityLabel={`Exercise ${exercise.title}`}
                    accessibilityHint="Tap to edit or long press to delete"
                  >
                    <View className="flex-row justify-between items-center bg-gray-700 rounded-lg p-4">
                      <Text className="text-white text-md font-semibold">
                        {exercise.title}
                      </Text>
                      <Text className="text-orange-500 text-lg font-bold">
                        {displayWeight} lbs
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center mt-5">
              <Text className="text-white text-md text-center mb-3">
                No exercises found. Would you like to add default exercises?
              </Text>
              <TouchableOpacity
                onPress={handleAddDefaultExercises}
                className="flex-row items-center bg-green-600 px-4 py-2 rounded-lg"
                accessibilityLabel="Add Default Exercises Button"
                accessibilityHint="Adds default exercises to your list"
              >
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text className="text-white text-md font-bold ml-2">
                  Add Default Exercises
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add/Edit Exercise Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="w-11/12"
              >
                <ScrollView contentContainerStyle="flex-grow justify-center items-center">
                  <TouchableOpacity
                    onPress={closeModal}
                    className="absolute z-50 top-4 right-4"
                    accessibilityLabel="Close Modal Button"
                    accessibilityHint="Closes the modal"
                  >
                    <Ionicons name="close-circle" size={32} color="white" />
                  </TouchableOpacity>
                  <View className="w-full bg-gray-800 rounded-lg p-6">
                    <Text className="text-white text-xl mb-4 font-bold text-center">
                      {isEditing ? "Edit Exercise" : "Add Exercise"}
                    </Text>

                    {/* Exercise Title Label and Input */}
                    <Text className="text-white text-sm mb-1">
                      Exercise Title
                    </Text>
                    <TextInput
                      value={formTitle}
                      onChangeText={setFormTitle}
                      className="bg-gray-600 text-white rounded-md px-3 py-2 mb-4"
                      placeholder="Enter exercise title"
                      placeholderTextColor="#a1a1aa"
                      accessible={true}
                      accessibilityLabel="Exercise Title Input"
                      accessibilityHint="Enter the title of the exercise"
                    />

                    {/* Muscle Tags Label and Selector */}
                    <Text className="text-white text-sm mb-1">Muscle Tags</Text>
                    <View className="flex-row flex-wrap mb-4 justify-center">
                      {muscleGroups.map((group) => (
                        <TouchableOpacity
                          key={group}
                          onPress={() => toggleMuscleTagSelection(group)}
                          className={`px-3 py-1 mr-2 mb-2 rounded-full border ${
                            selectedMuscleTags.includes(group)
                              ? "bg-orange-500 border-orange-500"
                              : "bg-gray-200 border-gray-200"
                          }`}
                          accessibilityLabel={`Muscle Tag ${group}`}
                          accessibilityHint={`${
                            selectedMuscleTags.includes(group)
                              ? "Deselect"
                              : "Select"
                          } ${group} muscle group`}
                        >
                          <Text
                            className={`font-semibold ${
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

                    {/* Max Weight Label and Input */}
                    <Text className="text-white text-sm mb-1">
                      Max Weight (lbs)
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={formMax}
                      onChangeText={setFormMax}
                      onFocus={() => {
                        if (formMax === "0") {
                          setFormMax("");
                        }
                      }}
                      className="bg-gray-600 text-white rounded-md px-3 py-2 mb-4"
                      placeholder="Enter max weight"
                      placeholderTextColor="#a1a1aa"
                      accessible={true}
                      accessibilityLabel="Max Weight Input"
                      accessibilityHint="Enter the maximum weight for the exercise"
                    />

                    {/* Notes Label and Input */}
                    <Text className="text-white text-sm mb-1">Notes</Text>
                    <TextInput
                      value={formNotes}
                      onChangeText={setFormNotes}
                      className="bg-gray-600 text-white rounded-md px-3 py-2 mb-4 h-24 text-top"
                      placeholder="Enter notes"
                      placeholderTextColor="#a1a1aa"
                      multiline
                      numberOfLines={4}
                      accessible={true}
                      accessibilityLabel="Notes Input"
                      accessibilityHint="Enter any additional notes for the exercise"
                    />

                    {/* Error Message */}
                    {localErrorMessage ? (
                      <Text className="text-red-500 text-center mb-4">
                        {localErrorMessage}
                      </Text>
                    ) : null}

                    {/* Save Button */}
                    <TouchableOpacity
                      onPress={handleSaveExercise}
                      className="bg-green-600 px-4 py-2 rounded-lg justify-center items-center"
                      accessibilityLabel="Save Exercise Button"
                      accessibilityHint="Saves the exercise to your list"
                    >
                      <Text className="text-white text-lg font-bold">
                        Save Exercise
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

// Since we're using NativeWind, we don't need StyleSheet.create
export default ExerciseScreen;
