// src/components/screens/HomeScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import HomeStartButton from "../utils/HomeStartButton";
import StartSection from "../utils/StartSection";
import ExerciseList from "../utils/ExerciseList"; // Correct import
import RatingComponent from "../utils/RatingComponent";
import {
  loadWorkouts,
  addOrUpdateWorkoutInFirestore,
} from "../../redux/slices/workoutSlice";
import { loadExercises } from "../../redux/slices/exerciseSlice";
import { fetchProfile } from "../../redux/slices/userSlice";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const userProfile = useSelector((state) => state.user.profile);
  const muscleTags = useSelector((state) => state.muscleTags.muscleTags);
  const workouts = useSelector((state) => state.workout.workouts);
  const exercises = useSelector((state) => state.exercises.data);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  const workoutDay = userProfile.workoutDay || "1";
  const todayMuscleTags = muscleTags[workoutDay] || [];

  const date = selectedDate.toISOString().split("T")[0];
  const todayWorkout = workouts[date];

  useEffect(() => {
    // Load workouts, exercises, muscle tags, and user profile when component mounts
    dispatch(loadWorkouts());
    dispatch(loadExercises());
    dispatch(fetchProfile());
    dispatch(loadMuscleTags());
  }, [dispatch]);

  useEffect(() => {
    if (workouts && !workouts[date]) {
      // Create a default workout
      const defaultWorkout = {
        stretch: false,
        cardio: {
          type: "treadmill",
          time: 10,
        },
        cardioCompleted: false,
        exercises: {},
        rating: null,
      };
      // Dispatch action to add the default workout to Firestore
      dispatch(
        addOrUpdateWorkoutInFirestore({ date, workout: defaultWorkout })
      );
    }
  }, [workouts, date, dispatch]);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
  };

  const handleCompleteWorkout = () => {
    setWorkoutCompleted(true);
  };

  return (
    <ScrollView className="flex-1 bg-zinc-900">
      {/* Top Banner */}
      <View className="flex-row w-full justify-between items-center mt-10 p-6">
        <TouchableOpacity>
          <Text>💪</Text>
        </TouchableOpacity>

        {/* Make Workout Planner clickable */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text className="text-2xl font-bold text-white text-neon-green">
            Workout Planner
          </Text>
        </TouchableOpacity>

        {/* Navigate to Exercises */}
        <TouchableOpacity onPress={() => navigation.navigate("Exercises")}>
          <Text>🦾</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering */}
      {!workoutStarted ? (
        // Show Start Button and Today's Workout
        <>
          {/* Start Workout Button */}
          <HomeStartButton
            workoutData={todayMuscleTags}
            onStartWorkout={handleStartWorkout}
          />
        </>
      ) : (
        // Show Stretch, Cardio, Exercises
        <>
          {/* Start Section */}
          <StartSection todayWorkout={todayWorkout} date={date} />

          {/* Exercises Component */}
          <ExerciseList
            exercises={todayWorkout?.exercises || {}}
            date={date}
            allExercises={exercises}
          />

          {/* Complete Workout Button */}
          {!workoutCompleted && (
            <TouchableOpacity
              onPress={handleCompleteWorkout}
              className="bg-blue-500 rounded-lg p-4 mt-4"
            >
              <Text className="text-white text-center text-lg">
                Complete Workout
              </Text>
            </TouchableOpacity>
          )}

          {/* Rating Component */}
          {workoutCompleted && (
            <RatingComponent
              rating={todayWorkout?.rating}
              date={date}
              todayWorkout={todayWorkout}
            />
          )}
        </>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
