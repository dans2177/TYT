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

      <View style={{ paddingTop: 60, width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 }}>
        {/* Home Button with Emoji on the Left */}
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={{ color: "#ffffff", fontSize: 32 }}>🏠</Text>
        </TouchableOpacity>

        {/* Centered Exercises Text */}
        <Text style={{ color: "#ffffff", fontSize: 24, fontFamily: "Silkscreen", textAlign: "center" }}>Exercises</Text>

        {/* Add Button with Emoji on the Right */}
        <TouchableOpacity onPress={() => openModal()}>
          <Text style={{ color: "#ffffff", fontSize: 32 }}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {status === "loading" && exercisesFromState.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00FF00" />
          <Text style={{ color: "#ffffff", fontSize: 18, marginTop: 10, fontWeight: "bold" }}>
            Loading exercises...
          </Text>
        </View>
      )}

      {/* Error Message */}
      {status === "failed" && (
        <Text style={{ color: "red", textAlign: "center", margin: 16 }}>
          Error loading exercises: {errorMessage}
        </Text>
      )}

      {/* Toggle for Max Weight and Last Weight */}
      {status !== "loading" && (
        <>
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => setWeightDisplayOption("max")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 9999,
                backgroundColor: weightDisplayOption === "max" ? "#F97316" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: weightDisplayOption === "max" ? "#FFFFFF" : "#000000",
                }}
              >
                Max Weight
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWeightDisplayOption("last")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderRadius: 9999,
                backgroundColor: weightDisplayOption === "last" ? "#F97316" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: weightDisplayOption === "last" ? "#FFFFFF" : "#000000",
                }}
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
              <View key={group} style={{ marginBottom: 16 }}>
                <Text style={{ color: "#ffffff", fontSize: 20, marginBottom: 8, fontFamily: "Silkscreen" }}>
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
                      <View style={{ marginBottom: 12, padding: 16, backgroundColor: "#2D3748", borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: "#ffffff", fontSize: 18, fontFamily: "Silkscreen" }}>
                            {exercise.title}
                          </Text>
                        </View>
                        <Text style={{ color: "#F97316", fontSize: 20, fontWeight: "bold" }}>
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
                <Text style={{ color: "#ffffff", fontSize: 18, marginBottom: 12, fontFamily: "Silkscreen" }}>
                  No exercises found. Would you like to add default exercises?
                </Text>
                <TouchableOpacity
                  onPress={handleAddDefaultExercises}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#38A169",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text style={{ color: "#ffffff", fontSize: 16, marginLeft: 8, fontWeight: "bold" }}>
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
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.8)", justifyContent: "center", alignItems: "center" }}>
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
              <View style={{ width: "90%", padding: 24, backgroundColor: "#2D3748", borderRadius: 12 }}>
                <Text style={{ color: "#ffffff", fontSize: 22, marginBottom: 16, fontFamily: "Silkscreen" }}>
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
                  style={{
                    backgroundColor: "#4A5568",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                  placeholderTextColor="#cbd5e0"
                />

                {/* Muscle Tags Selector */}
                <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center", padding: 8 }}>
                  {muscleGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      onPress={() => toggleMuscleTagSelection(group)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        margin: 4,
                        borderRadius: 9999,
                        backgroundColor: selectedMuscleTags.includes(group) ? "#F97316" : "#E5E7EB",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: selectedMuscleTags.includes(group) ? "#FFFFFF" : "#000000",
                        }}
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
                  style={{
                    backgroundColor: "#4A5568",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                  placeholderTextColor="#cbd5e0"
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
                  style={{
                    backgroundColor: "#4A5568",
                    color: "#ffffff",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    fontSize: 16,
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  placeholderTextColor="#cbd5e0"
                  multiline
                />

                {/* Error Message */}
                {localErrorMessage ? (
                  <Text style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
                    {localErrorMessage}
                  </Text>
                ) : null}

                {/* Save and Cancel Buttons */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleSaveExercise(selectedExercise)}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#38A169",
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color="white"
                    />
                    <Text style={{ color: "#ffffff", fontSize: 16, marginLeft: 8, fontWeight: "bold" }}>
                      {isEditing ? "Save Changes" : "Add Exercise"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#E53E3E",
                      padding: 12,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={24}
                      color="white"
                    />
                    <Text style={{ color: "#ffffff", fontSize: 16, marginLeft: 8, fontWeight: "bold" }}>
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
