// src/components/utils/ExerciseTracking.jsx

import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  loadExerciseTrackingData,
  addExerciseTrackingData,
  updateExerciseTrackingData,
  deleteExerciseTrackingData,
  updateExerciseTrackingDataInStore,
} from "../../redux/slices/exerciseTrackingSlice";
import {
  loadExercises,
  addNewExercise, // Import the action to add a new exercise
} from "../../redux/slices/exerciseSlice";
import { Ionicons } from "@expo/vector-icons";
import StartSection from "../utils/StartSection";

const ExerciseTracking = () => {
  const dispatch = useDispatch();
  const workoutId = useSelector((state) => state.workout.data?.id);

  const exerciseTrackingData = useSelector(
    (state) => state.exerciseTracking.data
  );
  const exercises = useSelector((state) => state.exercises.data);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [showExerciseListModal, setShowExerciseListModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false); // New state for Add Exercise modal

  // State variables for new exercise inputs
  const [newExerciseTitle, setNewExerciseTitle] = useState("");
  const [newExerciseLastUsedWeight, setNewExerciseLastUsedWeight] =
    useState("");
  const [newExerciseLastUsedReps, setNewExerciseLastUsedReps] = useState("");
  const [newExerciseMax, setNewExerciseMax] = useState("");
  const [newExerciseMuscleTags, setNewExerciseMuscleTags] = useState("");
  const [newExerciseNotes, setNewExerciseNotes] = useState("");

  useEffect(() => {
    if (workoutId) {
      dispatch(loadExerciseTrackingData(workoutId));
    }
    dispatch(loadExercises());
  }, [workoutId, dispatch]);

  const toggleActiveExercise = (index) => {
    setActiveExerciseIndex(index === activeExerciseIndex ? null : index);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updatedExercise = {
      ...exerciseTrackingData[exerciseIndex],
      sets: [...exerciseTrackingData[exerciseIndex].sets],
    };

    updatedExercise.sets[setIndex] = {
      ...updatedExercise.sets[setIndex],
      [field]: value === "" ? "" : parseInt(value) || 0,
    };

    dispatch(updateExerciseTrackingDataInStore(updatedExercise));

    dispatch(
      updateExerciseTrackingData({ workoutId, exerciseData: updatedExercise })
    );
  };

  const addSet = (exerciseIndex) => {
    const updatedExercise = {
      ...exerciseTrackingData[exerciseIndex],
      sets: [...exerciseTrackingData[exerciseIndex].sets],
    };

    // Create a new set with reps and weight initialized to 0
    const newSet = {
      setNumber: updatedExercise.sets.length + 1,
      reps: 0, // Initialize reps to 0
      weight: 0, // Initialize weight to 0
    };
    updatedExercise.sets.push(newSet);

    dispatch(updateExerciseTrackingDataInStore(updatedExercise));

    dispatch(
      updateExerciseTrackingData({ workoutId, exerciseData: updatedExercise })
    );
  };

  const handleLongPressSet = (exerciseIndex, setIndex) => {
    const updatedExercise = {
      ...exerciseTrackingData[exerciseIndex],
      sets: [...exerciseTrackingData[exerciseIndex].sets],
    };

    updatedExercise.sets.splice(setIndex, 1);

    updatedExercise.sets = updatedExercise.sets.map((set, index) => ({
      ...set,
      setNumber: index + 1,
    }));

    dispatch(updateExerciseTrackingDataInStore(updatedExercise));

    dispatch(
      updateExerciseTrackingData({ workoutId, exerciseData: updatedExercise })
    );
  };

  const handleLongPressExercise = (exerciseIndex) => {
    const exercise = exerciseTrackingData[exerciseIndex];

    Alert.alert(
      "Delete Exercise",
      `Are you sure you want to delete ${exercise.exerciseTitle}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            dispatch(
              deleteExerciseTrackingData({
                workoutId,
                exerciseId: exercise.id,
              })
            );
          },
        },
      ]
    );
  };

  const showExerciseInfo = (exerciseIndex) => {
    // Implement showing exercise info modal if needed
  };

  const openAddExerciseModal = () => {
    setShowExerciseListModal(true);
  };

  const openNewAddExerciseModal = () => {
    setShowExerciseListModal(false);
    setShowAddExerciseModal(true);
  };

  const addExercise = (exercise) => {
    const newExerciseData = {
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      sets: [
        {
          setNumber: 1,
          reps: 0, // Initialize reps to 0
          weight: 0, // Initialize weight to 0
        },
      ],
      personalBest: exercise.max || 0,
      muscleTags: exercise.muscleTags || [],
      notes: exercise.notes || "",
    };
    dispatch(
      addExerciseTrackingData({ workoutId, exerciseData: newExerciseData })
    );
    setShowExerciseListModal(false);
  };

  const handleAddNewExercise = () => {
    if (newExerciseTitle.trim() === "") {
      Alert.alert("Validation Error", "Exercise title is required.");
      return;
    }

    const newExercise = {
      id: Date.now().toString(), // Generate a unique ID
      title: newExerciseTitle,
      lastUsedWeight: 0, // Initialize to 0
      lastUsedReps: 0, // Initialize to 0
      max: 0, // Initialize to 0
      muscleTags: newExerciseMuscleTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      notes: newExerciseNotes,
    };

    dispatch(addNewExercise(newExercise));

    // Add the new exercise to tracking data with reps and weight as 0
    const newExerciseData = {
      exerciseId: newExercise.id,
      exerciseTitle: newExercise.title,
      sets: [
        {
          setNumber: 1,
          reps: 0, // Initialize reps to 0
          weight: 0, // Initialize weight to 0
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

    // Reset the form fields
    setNewExerciseTitle("");
    setNewExerciseLastUsedWeight("");
    setNewExerciseLastUsedReps("");
    setNewExerciseMax("");
    setNewExerciseMuscleTags("");
    setNewExerciseNotes("");
  };

  const renderHeader = () => <StartSection />;

  const renderItem = ({ item: exercise, index: exerciseIndex }) => {
    const isActive = exerciseIndex === activeExerciseIndex;

    const correspondingExercise = exercises.find(
      (ex) => ex.id === exercise.exerciseId
    );

    return (
      <TouchableOpacity
        key={exerciseIndex}
        onPress={() => toggleActiveExercise(exerciseIndex)}
        onLongPress={() => handleLongPressExercise(exerciseIndex)}
        delayLongPress={500}
        className={`rounded-3xl w-full mb-2 shadow-2xl shadow-zinc-800 ${
          isActive ? "bg-lime-500" : "bg-black"
        }`}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text
              className={`${
                isActive ? "text-black" : "text-lime-500"
              } text-2xl pl-4 pt-4`}
            >
              {exercise.exerciseTitle}
            </Text>
            <Text
              className={`${
                isActive ? "text-black" : "text-gray-200"
              } text-sm pl-6 mt-0 pt-0`}
            >
              Last Used: {correspondingExercise?.lastUsedWeight || 0} lbs,{" "}
              {correspondingExercise?.lastUsedReps || 0} reps
            </Text>
          </View>

          {/* Icon to trigger the modal */}
          <TouchableOpacity
            onPress={() => showExerciseInfo(exerciseIndex)}
            className="p-4"
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Sets */}
        <View className="flex-wrap flex-row mt-2 justify-start pb-4 px-4">
          {exercise.sets.map((set, setIndex) => (
            <TouchableOpacity
              key={setIndex}
              onLongPress={() => handleLongPressSet(exerciseIndex, setIndex)}
              delayLongPress={500}
              className="basis-1/3 mb-1"
            >
              <View
                className={`${
                  isActive ? "bg-lime-600" : "bg-lime-500"
                } rounded-lg mx-1 h-22 flex-row justify-between items-center`}
              >
                <TextInput
                  className="text-black text-4xl text-center pl-2 font-inconsolata"
                  placeholder="0"
                  placeholderTextColor="gray"
                  value={
                    set.weight === 0 || set.weight === ""
                      ? ""
                      : set.weight.toString()
                  }
                  editable={isActive}
                  onFocus={() => {
                    if (set.weight === 0 || set.weight === "") {
                      handleSetChange(exerciseIndex, setIndex, "weight", "");
                    }
                  }}
                  onChangeText={(value) =>
                    handleSetChange(exerciseIndex, setIndex, "weight", value)
                  }
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TextInput
                  className="text-black text-2xl text-center mr-2 font-inconsolata"
                  placeholder="0"
                  placeholderTextColor="gray"
                  value={
                    set.reps === 0 || set.reps === "" ? "" : set.reps.toString()
                  }
                  editable={isActive}
                  onFocus={() => {
                    if (set.reps === 0 || set.reps === "") {
                      handleSetChange(exerciseIndex, setIndex, "reps", "");
                    }
                  }}
                  onChangeText={(value) =>
                    handleSetChange(exerciseIndex, setIndex, "reps", value)
                  }
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </TouchableOpacity>
          ))}

          {isActive && (
            <TouchableOpacity
              onPress={() => addSet(exerciseIndex)}
              className="rounded-lg bg-black h-22 basis-1/3 mb-1"
            >
              <Text className="text-lime-500 text-4xl text-center">+</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => (
    <TouchableOpacity
      onPress={() => setShowExerciseListModal(true)}
      className="p-4 bg-blue-500 rounded-lg m-4"
    >
      <Text className="text-white text-center text-lg">Add Exercise</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <FlatList
          data={exerciseTrackingData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps="handled"
          className="flex-grow mx-2"
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </KeyboardAvoidingView>

      {/* Modal to select exercise to add */}
      {showExerciseListModal && (
        <Modal
          visible={showExerciseListModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowExerciseListModal(false)}
        >
          <View
            className="flex-1 justify-center items-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <View
              className="bg-white rounded-lg p-4 w-4/5 max-h-4/5"
              style={{ maxHeight: "75%" }}
            >
              <Text className="text-black text-lg font-bold mb-2">
                Select Exercise
              </Text>
              <FlatList
                data={exercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => addExercise(item)}
                    className="p-2"
                  >
                    <Text className="text-black">{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={openNewAddExerciseModal}
                className="p-2 mt-2 bg-green-500 rounded"
              >
                <Text className="text-white text-center">Add New Exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowExerciseListModal(false)}
                className="mt-2"
              >
                <Text className="text-blue-500 text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal to add a new exercise */}
      {showAddExerciseModal && (
        <Modal
          visible={showAddExerciseModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAddExerciseModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "80%" }}
            >
              <View className="bg-white rounded-lg p-6">
                <Text className="text-black text-lg font-bold mb-4">
                  Add New Exercise
                </Text>
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Exercise Title"
                  value={newExerciseTitle}
                  onChangeText={setNewExerciseTitle}
                />
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Last Used Weight (lbs)"
                  value={newExerciseLastUsedWeight}
                  onChangeText={setNewExerciseLastUsedWeight}
                  keyboardType="numeric"
                />
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Last Used Reps"
                  value={newExerciseLastUsedReps}
                  onChangeText={setNewExerciseLastUsedReps}
                  keyboardType="numeric"
                />
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Personal Best Weight (lbs)"
                  value={newExerciseMax}
                  onChangeText={setNewExerciseMax}
                  keyboardType="numeric"
                />
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Muscle Tags (comma separated)"
                  value={newExerciseMuscleTags}
                  onChangeText={setNewExerciseMuscleTags}
                />
                <TextInput
                  className="border border-gray-300 rounded p-2 mb-3"
                  placeholder="Notes"
                  value={newExerciseNotes}
                  onChangeText={setNewExerciseNotes}
                />
                <TouchableOpacity
                  onPress={handleAddNewExercise}
                  className="bg-blue-500 rounded p-3 mb-2"
                >
                  <Text className="text-white text-center">Save Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAddExerciseModal(false)}
                  className="mt-2"
                >
                  <Text className="text-red-500 text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </>
  );
};

export default ExerciseTracking;
