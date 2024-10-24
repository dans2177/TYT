// src/components/screens/HomeScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import HomeStartButton from "../utils/HomeStartButton";
import StartSection from "../utils/StartSection";
import ExerciseList from "../utils/ExerciseList";
import RatingComponent from "../utils/RatingComponent";
import {
  loadWorkoutByDate,
  addOrUpdateWorkoutInFirestore,
  startWorkout,
  completeWorkout,
} from "../../redux/slices/workoutsSlice"; // Ensure correct path
import { loadExercises } from "../../redux/slices/exerciseSlice";
import { fetchProfile } from "../../redux/slices/userSlice";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice";
import { makeSelectIsStartedByDate } from "../../redux/selectors";
import LoadingScreen from "./LoadingScreen";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const userProfile = useSelector((state) => state.user.profile);
  const muscleTags = useSelector((state) => state.muscleTags.muscleTags);
  const workouts = useSelector((state) => state.workouts.workouts);
  const workoutsStatus = useSelector((state) => state.workouts.status); // Added
  const workoutsError = useSelector((state) => state.workouts.error); // Optional: To handle errors
  const exercises = useSelector((state) => state.exercises.data);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  const workoutDay = userProfile.workoutDay || "1";
  const todayMuscleTags = muscleTags[workoutDay] || [];

  const date = selectedDate.toISOString().split("T")[0];
  const todayWorkout = workouts[date];

  const selectIsStartedByDate = makeSelectIsStartedByDate();
  const isStarted = useSelector((state) => selectIsStartedByDate(state, date));

  useEffect(() => {
    // Load necessary data when component mounts
    dispatch(loadExercises());
    dispatch(fetchProfile());
    dispatch(loadMuscleTags());
  }, [dispatch]);

  useEffect(() => {
    // Load workout for the current date
    dispatch(loadWorkoutByDate(date));
  }, [dispatch, date]);

  // Removed redundant useEffect that initializes default workout

  const handleStartWorkout = () => {
    dispatch(startWorkout({ date }));
  };

  const handleCompleteWorkout = () => {
    dispatch(completeWorkout({ date }));
    setWorkoutCompleted(true);
  };

  // Render Loading Screen based on status
  if (workoutsStatus === "loading") {
    return (
      <LoadingScreen />
    );
  }

  // Optional: Handle Error State
  if (workoutsStatus === "failed") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {workoutsError}</Text>
        <TouchableOpacity onPress={() => dispatch(loadWorkoutByDate(date))}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#1a202c" }}>
      {/* Top Banner */}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 40,
          padding: 24,
        }}
      >
        <TouchableOpacity>
          <Text style={{ fontSize: 24 }}>💪</Text>
        </TouchableOpacity>

        {/* Make Workout Planner clickable */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#00FF00",
            }}
          >
            Workout Planner
          </Text>
        </TouchableOpacity>

        {/* Navigate to Exercises */}
        <TouchableOpacity onPress={() => navigation.navigate("Exercises")}>
          <Text style={{ fontSize: 24 }}>🦾</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering */}
      {!isStarted ? (
        // Show Start Button and Today's Workout
        <HomeStartButton
          workoutData={todayMuscleTags}
          onStartWorkout={handleStartWorkout}
          date={date} // Pass 'date' prop
        />
      ) : (
        // Show Stretch, Cardio, Exercises
        <>
          {/* Start Section */}
          <StartSection
            todayWorkout={todayWorkout}
            date={date}
            isLoading={workoutsStatus === "loading"}
          />

          {/* Exercises Component */}
          <ExerciseList
            workoutId={todayWorkout?.id}
            exercises={todayWorkout?.exercises || {}}
            date={date}
            allExercises={exercises}
          />

          {/* Complete Workout Button */}
          {!workoutCompleted && (
            <TouchableOpacity
              onPress={handleCompleteWorkout}
              style={{
                backgroundColor: "#4299e1",
                borderRadius: 8,
                padding: 16,
                marginTop: 16,
              }}
            >
              <Text
                style={{ color: "#ffffff", textAlign: "center", fontSize: 18 }}
              >
                Complete Workout
              </Text>
            </TouchableOpacity>
          )}

          {/* Rating Component */}
          {workoutCompleted && (
            <RatingComponent
              rating={todayWorkout?.rating}
              date={date}
              workoutId={todayWorkout?.id}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a202c",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a202c",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: "#00d1b2",
    textDecorationLine: "underline",
  },
};

export default HomeScreen;
