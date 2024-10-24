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
  loadExerciseTracking,
  addOrUpdateExerciseTrackingInFirestore,
} from "../../redux/slices/workoutExerciseTrackingSlice";
import WorkoutTile from "./WorkoutTile"; // Ensure correct import
import {
  makeSelectExerciseTrackingByWorkoutId,
  makeSelectExercisesByWorkoutId,
} from "../../redux/selectors"; // Correct import path

const ExerciseList = ({ workoutId, exercises, date, allExercises }) => {
  const dispatch = useDispatch();

  // Create instances of the selectors
  const selectExerciseTrackingByWorkoutId =
    makeSelectExerciseTrackingByWorkoutId();
  const selectExercisesByWorkoutId = makeSelectExercisesByWorkoutId();

  // Use the memoized selectors with useSelector
  const exerciseTracking = useSelector((state) =>
    selectExerciseTrackingByWorkoutId(state, workoutId)
  );

  const workoutExercises = useSelector((state) =>
    selectExercisesByWorkoutId(state, workoutId)
  );

  const trackingStatus = useSelector(
    (state) => state.workoutExerciseTracking.status
  );
  const trackingError = useSelector(
    (state) => state.workoutExerciseTracking.error
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [addWorkoutModalVisible, setAddWorkoutModalVisible] = useState(false);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(null);

  const [newExercise, setNewExercise] = useState({
    title: "",
    max: "",
    notes: "",
  });

  useEffect(() => {
    // Load tracking data for each exercise
    Object.keys(exercises).forEach((exerciseId) => {
      dispatch(loadExerciseTracking({ workoutId, exerciseId }));
    });
  }, [dispatch, workoutId, exercises]);

  // Handle adding a new set for a workout
  const addSet = (exerciseId) => {
    const currentTracking = exerciseTracking[exerciseId]?.sets || [];
    const newSets = [...currentTracking, { reps: "", weight: "" }];
    dispatch(
      addOrUpdateExerciseTrackingInFirestore({
        workoutId,
        exerciseId,
        tracking: { sets: newSets },
      })
    );
  };

  // Handle changing the weight or reps for a set
  const handleSetChange = (exerciseId, setIndex, field, value) => {
    const currentTracking = exerciseTracking[exerciseId]?.sets || [];
    const updatedSets = currentTracking.map((set, index) =>
      index === setIndex ? { ...set, [field]: value } : set
    );
    dispatch(
      addOrUpdateExerciseTrackingInFirestore({
        workoutId,
        exerciseId,
        tracking: { sets: updatedSets },
      })
    );
  };

  // Handle long press to delete a set
  const handleLongPress = (exerciseId, setIndex) => {
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
            const currentTracking = exerciseTracking[exerciseId]?.sets || [];
            const updatedSets = currentTracking.filter(
              (_, index) => index !== setIndex
            );
            dispatch(
              addOrUpdateExerciseTrackingInFirestore({
                workoutId,
                exerciseId,
                tracking: { sets: updatedSets },
              })
            );
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Show modal with full workout info
  const showWorkoutInfo = (exercise) => {
    setSelectedWorkout(exercise);
    setModalVisible(true);
  };

  // Add a new exercise to the workout
  const addNewExerciseToWorkout = () => {
    if (newExercise.title && newExercise.max) {
      // Generate a unique ID for the new exercise
      const exerciseId = `${newExercise.title
        .toLowerCase()
        .replace(/\s+/g, "_")}_${Date.now()}`;

      // Update the workout's exercises in Firestore
      dispatch(
        addOrUpdateWorkoutInFirestore({
          date,
          workout: {
            ...workoutExercises,
            [exerciseId]: {
              title: newExercise.title,
              max: parseInt(newExercise.max),
              notes: newExercise.notes || "",
            },
          },
        })
      );

      // Initialize tracking for the new exercise
      dispatch(
        addOrUpdateExerciseTrackingInFirestore({
          workoutId,
          exerciseId,
          tracking: { sets: [] },
        })
      );

      // Reset and close modal
      setNewExercise({ title: "", max: "", notes: "" });
      setAddWorkoutModalVisible(false);
    } else {
      Alert.alert("Please fill out the exercise name and max weight.");
    }
  };

  // Toggle active workout
  const toggleActiveWorkout = (index) => {
    if (activeWorkoutIndex === index) {
      setActiveWorkoutIndex(null); // Deactivate if it's already active
    } else {
      setActiveWorkoutIndex(index); // Set as active
    }
  };

  return (
    <View style={{ marginHorizontal: 8 }}>
      <View
        style={{
          height: 4,
          backgroundColor: "#000000",
          width: "100%",
          marginBottom: 8,
        }}
      ></View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {/* Exercises Text on the Left */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ffffff", fontSize: 20 }}>Exercises</Text>
        </View>

        {/* Button on the Right */}
        <TouchableOpacity
          style={{
            backgroundColor: "#a0f0a0", // Tailwind 'bg-lime-600'
            height: 40,
            width: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#1a202c",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
            marginLeft: 8,
          }}
          onPress={() => setAddWorkoutModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Workouts */}
      <ScrollView>
        {Object.values(workoutExercises).map((exercise, index) => {
          const isActive = index === activeWorkoutIndex;
          const tracking = exerciseTracking[exercise.id] || { sets: [] };
          return (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => toggleActiveWorkout(index)}
              style={{
                backgroundColor: isActive ? "#b2f2bb" : "#000000",
                borderRadius: 24,
                width: "100%",
                marginBottom: 8,
                shadowColor: "#1a202c",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: isActive ? "#000000" : "#a0f0a0",
                      fontSize: 20,
                      paddingLeft: 16,
                      paddingTop: 16,
                    }}
                  >
                    {exercise.title}
                  </Text>
                  <Text
                    style={{
                      color: isActive ? "#000000" : "#d1d5db",
                      fontSize: 14,
                      paddingLeft: 24,
                      marginTop: 0,
                      paddingTop: 0,
                    }}
                  >
                    Personal Best: {exercise.max} lbs
                  </Text>
                </View>

                {/* Icon to trigger the modal */}
                <TouchableOpacity
                  onPress={() => showWorkoutInfo(exercise)}
                  style={{ padding: 16 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              {/* Sets */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginTop: 8,
                  justifyContent: "flex-start",
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                }}
              >
                {tracking.sets.map((set, setIndex) => (
                  <TouchableOpacity
                    key={setIndex}
                    onLongPress={() => handleLongPress(exercise.id, setIndex)}
                    delayLongPress={500} // Adjust this if needed
                    style={{ flexBasis: "33%", marginBottom: 5 }}
                  >
                    <View
                      style={{
                        backgroundColor: isActive ? "#a0f0a0" : "#90cdf4",
                        borderRadius: 8,
                        marginHorizontal: 4,
                        height: 88, // Tailwind 'h-22' is approximately 88px
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 8,
                      }}
                    >
                      <TextInput
                        style={{
                          color: "#000000",
                          fontSize: 32,
                          textAlign: "center",
                          paddingLeft: 8,
                          fontFamily: "Inconsolata",
                        }}
                        placeholder="000"
                        placeholderTextColor="#000000"
                        value={set.weight.toString()}
                        editable={isActive}
                        onChangeText={(value) =>
                          handleSetChange(
                            exercise.id,
                            setIndex,
                            "weight",
                            value
                          )
                        }
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <TextInput
                        style={{
                          color: "#000000",
                          fontSize: 24,
                          textAlign: "center",
                          marginRight: 8,
                          fontFamily: "Inconsolata",
                        }}
                        placeholder="00"
                        placeholderTextColor="#000000"
                        value={set.reps.toString()}
                        editable={isActive}
                        onChangeText={(value) =>
                          handleSetChange(exercise.id, setIndex, "reps", value)
                        }
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                {isActive && (
                  <TouchableOpacity
                    onPress={() => addSet(exercise.id)}
                    style={{
                      backgroundColor: "#000000",
                      borderRadius: 8,
                      flexBasis: "31%",
                      marginBottom: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      marginHorizontal: 4,
                      height: 88,
                    }}
                  >
                    <Text
                      style={{
                        color: "#a0f0a0",
                        fontSize: 32,
                        textAlign: "center",
                      }}
                    >
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
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#2d3748",
                borderRadius: 8,
                padding: 20,
                width: "80%",
              }}
            >
              <Text
                style={{ color: "#ffffff", fontSize: 20, marginBottom: 16 }}
              >
                {selectedWorkout.title}
              </Text>
              <Text style={{ color: "#ffffff", marginBottom: 8 }}>
                Max: {selectedWorkout.max} lbs
              </Text>
              <Text style={{ color: "#ffffff" }}>Notes:</Text>
              <Text style={{ color: "#ffffff", marginBottom: 16 }}>
                {selectedWorkout.notes}
              </Text>

              {/* Close button */}
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}

      {/* Modal for adding new exercise */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addWorkoutModalVisible}
        onRequestClose={() => setAddWorkoutModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#2d3748",
              borderRadius: 8,
              padding: 20,
              width: "80%",
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 20, marginBottom: 16 }}>
              Add New Exercise
            </Text>
            <TextInput
              style={{
                backgroundColor: "#4a5568",
                color: "#ffffff",
                borderRadius: 4,
                padding: 8,
                marginBottom: 8,
              }}
              placeholder="Exercise Name"
              placeholderTextColor="#cbd5e0"
              value={newExercise.title}
              onChangeText={(value) =>
                setNewExercise({ ...newExercise, title: value })
              }
            />
            <TextInput
              style={{
                backgroundColor: "#4a5568",
                color: "#ffffff",
                borderRadius: 4,
                padding: 8,
                marginBottom: 8,
              }}
              placeholder="Max Weight (lbs)"
              keyboardType="numeric"
              value={newExercise.max}
              onChangeText={(value) =>
                setNewExercise({ ...newExercise, max: value })
              }
            />
            <TextInput
              style={{
                backgroundColor: "#4a5568",
                color: "#ffffff",
                borderRadius: 4,
                padding: 8,
                marginBottom: 8,
              }}
              placeholder="Notes (optional)"
              multiline
              value={newExercise.notes}
              onChangeText={(value) =>
                setNewExercise({ ...newExercise, notes: value })
              }
            />
            <Button title="Add Exercise" onPress={addNewExerciseToWorkout} />
            <Button
              title="Cancel"
              onPress={() => setAddWorkoutModalVisible(false)}
              color="#e53e3e"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExerciseList;
