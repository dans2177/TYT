import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadAllWorkouts } from "../../redux/slices/workoutSlice";
import { loadExerciseTrackingData } from "../../redux/slices/exerciseTrackingSlice";
import { loadExercises } from "../../redux/slices/exerciseSlice";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const WorkoutHistory = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const workoutsList = useSelector((state) => state.workout.workoutsList);
  const fetchAllStatus = useSelector((state) => state.workout.fetchAllStatus);
  const fetchAllError = useSelector((state) => state.workout.fetchAllError);
  const exercisesList = useSelector((state) => state.exercises.data);
  const exercisesFetchStatus = useSelector(
    (state) => state.exercises.fetchStatus
  );
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState([]);
  const [exerciseDataMap, setExerciseDataMap] = useState({});
  const [loadingExercises, setLoadingExercises] = useState({});
  const [exerciseErrors, setExerciseErrors] = useState({});

  useEffect(() => {
    dispatch(loadAllWorkouts());
  }, [dispatch]);

  useEffect(() => {
    if (exercisesFetchStatus === "idle") {
      dispatch(loadExercises());
    }
  }, [dispatch, exercisesFetchStatus]);

  const toggleExpand = async (workoutId) => {
    if (expandedWorkoutIds.includes(workoutId)) {
      setExpandedWorkoutIds(
        expandedWorkoutIds.filter((id) => id !== workoutId)
      );
    } else {
      setExpandedWorkoutIds([...expandedWorkoutIds, workoutId]);
      if (!exerciseDataMap[workoutId]) {
        setLoadingExercises((prev) => ({ ...prev, [workoutId]: true }));
        try {
          const exercises = await dispatch(
            loadExerciseTrackingData(workoutId)
          ).unwrap();
          setExerciseDataMap((prev) => ({ ...prev, [workoutId]: exercises }));
          setLoadingExercises((prev) => ({ ...prev, [workoutId]: false }));
        } catch (error) {
          setExerciseErrors((prev) => ({ ...prev, [workoutId]: error }));
          setLoadingExercises((prev) => ({ ...prev, [workoutId]: false }));
        }
      }
    }
  };

  const renderExerciseItem = (exercise) => {
    // Try to find the exercise info by matching IDs
    const exerciseInfo = exercisesList.find(
      (ex) => ex.id === exercise.exerciseId
    );

    // If not found, check if exercise name is directly available
    const exerciseName = exerciseInfo
      ? exerciseInfo.title
      : exercise.name || "Unknown Exercise";

    return (
      <View key={exercise.id} className="ml-4 mb-2">
        <Text className="text-white text-base">{exerciseName}</Text>
        {exercise.sets &&
          exercise.sets.map((set, index) => (
            <Text key={index} className="text-gray-400 text-sm">
              Set {index + 1}: {set.reps} reps @ {set.weight} lbs
            </Text>
          ))}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const workoutDate = item.date || "Unknown Date";
    const isFinished = item.isFinished ? "Yes" : "No";
    const rating = item.rating !== undefined ? item.rating : "N/A";
    const isExpanded = expandedWorkoutIds.includes(item.id);

    const exercisesForWorkout = exerciseDataMap[item.id] || [];
    const isLoadingExercises = loadingExercises[item.id];
    const exerciseError = exerciseErrors[item.id];

    // New variables for stretch and cardio
    const stretch = item.stretch ? "Yes" : "No";
    const cardio = item.cardio ? "Yes" : "No";
    const cardioType = item.cardioType || "N/A";
    const cardioLength =
      item.cardioLength !== undefined ? item.cardioLength : "N/A";

    return (
      <View className="rounded-3xl w-full mb-4 shadow-sm bg-black shadow-slate-900">
        <TouchableOpacity
          onPress={() => {
            toggleExpand(item.id);
          }}
        >
          <View className="flex-row justify-between items-center p-4">
            <View>
              <Text className="text-lime-500 text-2xl">{workoutDate}</Text>
              <Text className="text-gray-200 text-sm">
                Finished: {isFinished}
              </Text>
              <Text className="text-gray-200 text-sm">Rating: {rating}</Text>
              <Text className="text-gray-200 text-sm">Stretch: {stretch}</Text>
              <Text className="text-gray-200 text-sm">Cardio: {cardio}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View className="p-4">
            {/* Display stretch and cardio details */}
            <Text className="text-white text-base">Workout Details:</Text>
            <Text className="text-gray-400 text-sm">Stretch: {stretch}</Text>
            <Text className="text-gray-400 text-sm">Cardio: {cardio}</Text>
            {item.cardio && (
              <>
                <Text className="text-gray-400 text-sm">
                  Cardio Type: {cardioType}
                </Text>
                <Text className="text-gray-400 text-sm">
                  Cardio Length: {cardioLength} minutes
                </Text>
              </>
            )}

            {/* Existing code to display exercises */}
            {isLoadingExercises && (
              <Text className="text-white">Loading exercises...</Text>
            )}
            {exerciseError && (
              <Text className="text-red-500">Error loading exercises</Text>
            )}
            {!isLoadingExercises &&
              !exerciseError &&
              exercisesForWorkout.length > 0 && (
                <>
                  {exercisesFetchStatus === "loading" && (
                    <Text className="text-white">Loading exercise info...</Text>
                  )}
                  {exercisesFetchStatus === "failed" && (
                    <Text className="text-red-500">
                      Error loading exercise info
                    </Text>
                  )}
                  {exercisesFetchStatus === "succeeded" &&
                    exercisesForWorkout.map(renderExerciseItem)}
                </>
              )}
            {!isLoadingExercises &&
              !exerciseError &&
              exercisesForWorkout.length === 0 && (
                <Text className="text-gray-400">No exercises recorded.</Text>
              )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-800">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl">Workout History</Text>
        {/* Placeholder for alignment */}
        <View style={{ width: 24 }} />
      </View>

      {fetchAllStatus === "loading" && (
        <Text className="text-white text-center mt-4">Loading...</Text>
      )}
      {fetchAllStatus === "failed" && (
        <Text className="text-red-500 text-center mt-4">
          Error: {fetchAllError}
        </Text>
      )}
      {fetchAllStatus === "succeeded" && (
        <FlatList
          data={workoutsList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        />
      )}
    </SafeAreaView>
  );
};

export default WorkoutHistory;
