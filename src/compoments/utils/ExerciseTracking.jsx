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
  addNewExercise,
} from "../../redux/slices/exerciseSlice";
import { Ionicons } from "@expo/vector-icons";
import StartSection from "../utils/StartSection";
import { ExerciseModals } from "../modals/ExerciseModals"; // Import the new modal component

const ExerciseTracking = () => {
  const dispatch = useDispatch();
  const workoutId = useSelector((state) => state.workout.data?.id);
  const exerciseTrackingData = useSelector(
    (state) => state.exerciseTracking.data
  );
  const exercises = useSelector((state) => state.exercises.data);

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(null);
  const [showExerciseListModal, setShowExerciseListModal] = useState(false);

  const [focusedInput, setFocusedInput] = useState(null);

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

    const newSet = {
      setNumber: updatedExercise.sets.length + 1,
      reps: 0,
      weight: 0,
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
    // Implement exercise info display if needed
  };

  const addExercise = (exercise) => {
    const newExerciseData = {
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      sets: [
        {
          setNumber: 1,
          reps: 0,
          weight: 0,
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
                } rounded-lg mx-1 h-20 flex-col  items-center`}
              >
                <TextInput
                  className="text-black text-4xl text-center  rounded-lg w-20 font-inconsolata"
                  value={set.weight.toString()}
                  editable={isActive}
                  onFocus={() => {
                    setFocusedInput(`${exerciseIndex}-${setIndex}-weight`);
                    if (set.weight === 0 || set.weight === "") {
                      handleSetChange(exerciseIndex, setIndex, "weight", "");
                    }
                  }}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={(value) =>
                    handleSetChange(exerciseIndex, setIndex, "weight", value)
                  }
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TextInput
                  className="text-black text-2xl text-center font-inconsolata mb-2 rounded-md 
                  w-10"
                  value={set.reps.toString()}
                  editable={isActive}
                  onFocus={() => {
                    setFocusedInput(`${exerciseIndex}-${setIndex}-reps`);
                    if (set.reps === 0 || set.reps === "") {
                      handleSetChange(exerciseIndex, setIndex, "reps", "");
                    }
                  }}
                  onBlur={() => setFocusedInput(null)}
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
              className="rounded-lg bg-black h-22 basis-1/3 mb-1 items-center justify-center"
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

      {/* Use the new ExerciseModals component */}
      <ExerciseModals
        visible={showExerciseListModal}
        onClose={() => setShowExerciseListModal(false)}
        addExercise={addExercise}
        openAddExerciseModal={() => {}}
      />
    </>
  );
};

export default ExerciseTracking;
