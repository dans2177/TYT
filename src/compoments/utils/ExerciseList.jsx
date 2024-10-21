// src/components/utils/ExerciseList.jsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  loadExercises,
  addExerciseToFirestore,
  updateExerciseInFirestore,
  deleteExerciseFromFirestore,
} from "../../redux/slices/exerciseSlice";
import { addOrUpdateWorkoutInFirestore } from "../../redux/slices/workoutSlice";
import WorkoutTile from "./WorkoutTile"; // Ensure correct import

const ExerciseList = ({ exercises, date, allExercises }) => {
  const dispatch = useDispatch();

  const [workoutList, setWorkoutList] = useState(Object.values(exercises));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [addWorkoutModalVisible, setAddWorkoutModalVisible] = useState(false);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(null);

  // Handle adding a new set for a workout
  const addSet = (index) => {
    const newWorkouts = [...workoutList];
    newWorkouts[index].sets.push({ weight: "", reps: "" });
    setWorkoutList(newWorkouts);
    updateExercisesInFirestore(newWorkouts);
  };

  // Handle changing the weight or reps for a set
  const handleSetChange = (workoutIndex, setIndex, field, value) => {
    const newWorkouts = [...workoutList];
    newWorkouts[workoutIndex].sets[setIndex][field] = value;
    setWorkoutList(newWorkouts);
    updateExercisesInFirestore(newWorkouts);
  };

  // Handle long press to delete a set
  const handleLongPress = (workoutIndex, setIndex) => {
    Alert.alert(
      "Delete Set",
      "Are you sure you want to delete this set?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            const newWorkouts = [...workoutList];
            newWorkouts[workoutIndex].sets.splice(setIndex, 1);
            setWorkoutList(newWorkouts);
            updateExercisesInFirestore(newWorkouts);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Show modal with full workout info
  const showWorkoutInfo = (workoutIndex) => {
    setSelectedWorkout(workoutList[workoutIndex]);
    setModalVisible(true);
  };

  // Add a new workout
  const addNewWorkout = (exercise) => {
    const newWorkout = {
      id: exercise.id,
      title: exercise.title, // Ensure 'title' exists in exercise
      max: exercise.max || 0,
      notes: exercise.notes || "",
      sets: [],
    };
    const newWorkouts = [...workoutList, newWorkout];
    setWorkoutList(newWorkouts);
    updateExercisesInFirestore(newWorkouts);
    setAddWorkoutModalVisible(false);
  };

  // Toggle active workout
  const toggleActiveWorkout = (index) => {
    if (activeWorkoutIndex === index) {
      setActiveWorkoutIndex(null); // Deactivate if it's already active
    } else {
      setActiveWorkoutIndex(index); // Set as active
    }
  };

  // Update exercises in Firestore
  const updateExercisesInFirestore = (workouts) => {
    const exercisesObj = {};
    workouts.forEach((workout) => {
      exercisesObj[workout.id] = workout;
    });
    const updatedWorkout = {
      exercises: exercisesObj,
    };
    dispatch(addOrUpdateWorkoutInFirestore({ date, workout: updatedWorkout }));
  };

  return (
    <View className="mx-2">
      <View className="h-1 bg-black w-full mb-2"></View>
      <View className="flex-row justify-between items-center mb-2">
        {/* Exercises Text on the Left */}
        <View className="flex-1">
          <Text className="text-white text-2xl">Exercises</Text>
        </View>

        {/* Button on the Right */}
        <TouchableOpacity
          className="rounded-full bg-lime-600 h-10 w-10 justify-center items-center shadow-2xl shadow-zinc-800 ml-2"
          onPress={() => setAddWorkoutModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Workouts */}
      <ScrollView>
        {workoutList.map((workout, workoutIndex) => {
          const isActive = workoutIndex === activeWorkoutIndex;
          return (
            <TouchableOpacity
              key={workoutIndex}
              onPress={() => toggleActiveWorkout(workoutIndex)}
              className={`rounded-3xl w-full mb-2 shadow-2xl shadow-zinc-800  
                 ${isActive ? "bg-lime-500" : "bg-black"}`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text
                    className={` ${
                      isActive ? "text-black " : "text-lime-500"
                    } text-2xl pl-4 pt-4 m`}
                  >
                    {workout.title} {/* Ensure 'title' is correctly set */}
                  </Text>
                  <Text
                    className={` ${
                      isActive ? "text-black" : " text-gray-200"
                    }  text-sm pl-6 mt-0 pt-0 `}
                  >
                    Personal Best: {workout.max} lbs
                  </Text>
                </View>

                {/* Icon to trigger the modal */}
                <TouchableOpacity
                  onPress={() => showWorkoutInfo(workoutIndex)}
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
              <View className="flex-wrap flex-row mt-2 justify-start pb-4 max-w-[100vw] px-4">
                {workout.sets.map((set, setIndex) => (
                  <TouchableOpacity
                    key={setIndex}
                    onLongPress={() => handleLongPress(workoutIndex, setIndex)}
                    delayLongPress={500} // Adjust this if needed
                    style={{ flexBasis: "33%", marginBottom: 5 }} // FlexBasis ensures equal width
                  >
                    <View
                      className={`${
                        isActive ? "bg-lime-600 " : "bg-lime-500 "
                      } rounded-lg  mx-1 h-22 flex-row justify-between align-middle items-center`}
                    >
                      <TextInput
                        className="text-black text-4xl text-center pl-2  font-inconsolata"
                        placeholder="000"
                        placeholderTextColor="black"
                        value={set.weight.toString()}
                        editable={isActive}
                        onChangeText={(value) =>
                          handleSetChange(
                            workoutIndex,
                            setIndex,
                            "weight",
                            value
                          )
                        }
                        keyboardType="numeric"
                        maxLength={3} // Changed maxLength to 3 for TextInput
                      />
                      <TextInput
                        className="text-black text-2xl text-center mr-2 font-inconsolata"
                        placeholder="00"
                        placeholderTextColor="black"
                        value={set.reps.toString()}
                        editable={isActive}
                        onChangeText={(value) =>
                          handleSetChange(workoutIndex, setIndex, "reps", value)
                        }
                        keyboardType="numeric"
                        maxLength={2} // Changed maxLength to 2 for TextInput
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                {isActive && (
                  <TouchableOpacity
                    onPress={() => addSet(workoutIndex)}
                    className="rounded-lg bg-black h-22 "
                    style={{ flexBasis: "31%", marginBottom: 5 }} // Same flexBasis for consistent size
                  >
                    <Text className="text-lime-500 text-4xl text-center">
                      +
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal for displaying workout info */}
      {selectedWorkout && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            className="flex-1 justify-center items-center bg-black bg-opacity-50"
            style={{ padding: 20 }}
          >
            <View className="bg-gray-800 rounded-lg p-5 w-[80vw]">
              <Text className="text-white text-xl mb-4">
                {selectedWorkout.title} {/* Ensure 'title' is correctly set */}
              </Text>
              <Text className="text-white mb-2">
                Max: {selectedWorkout.max} lbs
              </Text>
              <Text className="text-white">Notes:</Text>
              <Text className="text-white mb-4">{selectedWorkout.notes}</Text>

              {/* Close button */}
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Modal for adding new workout */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addWorkoutModalVisible}
        onRequestClose={() => setAddWorkoutModalVisible(false)}
      >
        <View
          className="flex-1 justify-center items-center bg-black bg-opacity-50"
          style={{ padding: 20 }}
        >
          <View className="bg-gray-800 rounded-lg p-5 w-[80vw]">
            <Text className="text-white text-xl mb-4">Add New Exercise</Text>
            {/* List of available exercises */}
            <FlatList
              data={allExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => addNewWorkout(item)}
                  className="p-2"
                >
                  <Text className="text-white">{item.title}</Text>
                  {/* Removed the {" "} to prevent the error */}
                </TouchableOpacity>
              )}
            />
            <Button
              title="Cancel"
              onPress={() => setAddWorkoutModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExerciseList;
