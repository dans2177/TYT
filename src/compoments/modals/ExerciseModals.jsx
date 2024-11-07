// src/components/utils/ExerciseModals.jsx

import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addNewExercise } from "../../redux/slices/exerciseSlice";
import { addExerciseTrackingData } from "../../redux/slices/exerciseTrackingSlice";

// Mapping muscle groups to broader categories
const muscleGroupCategories = {
  Quads: "Legs",
  Hamstrings: "Legs",
  Glutes: "Legs",
  Calves: "Legs",
  Chest: "Chest",
  Lats: "Back",
  Traps: "Back",
  "Lower Back": "Back", // Grouped as "Back"
  Shoulders: "Shoulders",
  Biceps: "Arms",
  Triceps: "Arms",
  Abs: "Core",
  Obliques: "Core",
  Forearms: "Forearms",
};

export const ExerciseModals = ({
  visible,
  onClose,
  addExercise,
  openAddExerciseModal,
}) => {
  const dispatch = useDispatch();
  const exercises = useSelector((state) => state.exercises.data);
  const muscleTags = useSelector((state) => state.muscleTags.muscleTags);
  const workoutDay = useSelector((state) => state.user.profile.workoutDay);

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newExerciseTitle, setNewExerciseTitle] = useState("");
  const [newExerciseLastUsedWeight, setNewExerciseLastUsedWeight] =
    useState("");
  const [newExerciseLastUsedReps, setNewExerciseLastUsedReps] = useState("");
  const [newExerciseMax, setNewExerciseMax] = useState("");
  const [newExerciseMuscleTags, setNewExerciseMuscleTags] = useState("");
  const [newExerciseNotes, setNewExerciseNotes] = useState("");

  // Group exercises by muscle categories and ensure unique entries
  const groupedExercises = useMemo(() => {
    const groups = { Today: {}, Compound: [], Rest: {} };
    const seenExercises = new Set();

    exercises.forEach((exercise) => {
      const muscleTagsList = exercise.muscleTags || [];
      const categories = new Set();
      let isTodayExercise = false;

      muscleTagsList.forEach((tag) => {
        const category = muscleGroupCategories[tag] || tag;
        categories.add(category);
      });

      if (Array.isArray(muscleTags[workoutDay])) {
        isTodayExercise = muscleTags[workoutDay].some((todayTag) =>
          muscleTagsList.includes(todayTag)
        );
      }

      if (!seenExercises.has(exercise.id)) {
        if (isTodayExercise) {
          if (categories.size > 1) {
            groups.Compound.push(exercise);
          } else {
            categories.forEach((category) => {
              if (!groups.Today[category]) {
                groups.Today[category] = [];
              }
              groups.Today[category].push(exercise);
            });
          }
        } else {
          if (categories.size > 1) {
            groups.Compound.push(exercise);
          } else {
            categories.forEach((category) => {
              if (!groups.Rest[category]) {
                groups.Rest[category] = [];
              }
              groups.Rest[category].push(exercise);
            });
          }
        }
        seenExercises.add(exercise.id);
      }
    });

    return groups;
  }, [exercises, workoutDay, muscleTags]);

  const handleAddNewExercise = () => {
    if (newExerciseTitle.trim() === "") {
      Alert.alert("Validation Error", "Exercise title is required.");
      return;
    }

    const newExercise = {
      id: Date.now().toString(),
      title: newExerciseTitle,
      lastUsedWeight: parseInt(newExerciseLastUsedWeight) || 0,
      lastUsedReps: parseInt(newExerciseLastUsedReps) || 0,
      max: parseInt(newExerciseMax) || 0,
      muscleTags: newExerciseMuscleTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      notes: newExerciseNotes,
    };

    dispatch(addNewExercise(newExercise));

    const newExerciseData = {
      exerciseId: newExercise.id,
      exerciseTitle: newExercise.title,
      sets: [
        {
          setNumber: 1,
          reps: 0,
          weight: 0,
        },
      ],
      personalBest: newExercise.max || 0,
      muscleTags: newExercise.muscleTags || [],
      notes: newExercise.notes || "",
    };
    dispatch(
      addExerciseTrackingData({ workoutId, exerciseData: newExerciseData })
    );

    setShowAddExerciseModal(false);
    resetFormFields();
    onClose();
  };

  const resetFormFields = () => {
    setNewExerciseTitle("");
    setNewExerciseLastUsedWeight("");
    setNewExerciseLastUsedReps("");
    setNewExerciseMax("");
    setNewExerciseMuscleTags("");
    setNewExerciseNotes("");
  };

  // Filter exercises based on the search query
  const filteredGroupedExercises = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedExercises;
    }

    const filteredGroups = { Today: {}, Compound: [], Rest: {} };

    Object.entries(groupedExercises).forEach(
      ([section, categoriesOrExercises]) => {
        if (section === "Compound") {
          filteredGroups[section] = categoriesOrExercises.filter((exercise) =>
            exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          filteredGroups[section] = {};
          Object.entries(categoriesOrExercises).forEach(
            ([category, exercises]) => {
              const filteredExercises = exercises.filter((exercise) =>
                exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (filteredExercises.length > 0) {
                filteredGroups[section][category] = filteredExercises;
              }
            }
          );
        }
      }
    );

    return filteredGroups;
  }, [searchQuery, groupedExercises]);

  return (
    <>
      {/* Exercise List Modal */}
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View
            className="flex-1 justify-center items-center"
            style={{ backgroundColor: "rgba(15, 15, 15, 0.95)" }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                className="bg-[#1e1e1e] rounded-lg p-4 w-5/6 max-h-[90vh] overflow-y-auto"
                style={{ maxHeight: "75%" }}
              >
                {/* Display Today's Muscle Groups */}
                <View className="mb-4">
                  <View className="flex-row flex-wrap justify-center items-center">
                    {muscleTags &&
                    Array.isArray(muscleTags[workoutDay]) &&
                    muscleTags[workoutDay].length > 0 ? (
                      muscleTags[workoutDay].map((tag, index) => (
                        <View
                          key={index}
                          className="bg-gray-800 border border-orange-400 py-1 px-2 rounded-full m-1"
                        >
                          <Text className="text-cyan-400 text-sm font-bold">
                            {tag}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-white">
                        No muscle tags available
                      </Text>
                    )}
                  </View>
                </View>

                {/* Search Bar */}
                <View className="mb-4">
                  <TextInput
                    className="border border-gray-600 rounded p-2 text-white placeholder-gray-400"
                    placeholder="Search exercises..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                      backgroundColor: "#2a2a2a",
                    }}
                  />
                </View>

                {/* Grouped Exercises */}
                <ScrollView>
                  {/* Compound Exercises */}
                  {filteredGroupedExercises.Compound.length > 0 && (
                    <View className="mb-4">
                      <Text className="text-white text-lg font-semibold mb-2">
                        Compound Exercises
                      </Text>
                      {filteredGroupedExercises.Compound.map((exercise) => (
                        <TouchableOpacity
                          key={exercise.id}
                          onPress={() => addExercise(exercise)}
                          className="p-2 border-b border-gray-700"
                        >
                          <Text className="text-white ">{exercise.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Today's Exercises */}
                  {Object.entries(filteredGroupedExercises.Today).map(
                    ([group, exercises]) => (
                      <View key={group} className="mb-4">
                        <Text className="text-white text-lg font-semibold mb-2">
                          {group}
                        </Text>
                        {exercises.map((exercise) => (
                          <TouchableOpacity
                            key={exercise.id}
                            onPress={() => addExercise(exercise)}
                            className="p-2 border-b border-gray-700"
                          >
                            <Text className="text-white ">
                              {exercise.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )
                  )}

                  {/* Rest of the Exercises */}
                  {Object.entries(filteredGroupedExercises.Rest).map(
                    ([group, exercises]) => (
                      <View key={group} className="mb-4">
                        <Text className="text-white text-lg font-semibold mb-2">
                          {group}
                        </Text>
                        {exercises.map((exercise) => (
                          <TouchableOpacity
                            key={exercise.id}
                            onPress={() => addExercise(exercise)}
                            className="p-2 border-b border-gray-700"
                          >
                            <Text className="text-white ">
                              {exercise.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )
                  )}
                </ScrollView>

                {/* Cancel Button */}
                <TouchableOpacity onPress={onClose} className="mt-2">
                  <Text className="text-blue-400 text-center ">Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
