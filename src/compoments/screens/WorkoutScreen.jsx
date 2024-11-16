// src/screens/WorkoutScreen.js

import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice";
import {
  loadWorkout,
  startWorkout,
  updateWorkoutInFirestore,
} from "../../redux/slices/workoutSlice";
import { Ionicons } from "@expo/vector-icons";
import ExerciseTracking from "../utils/ExerciseTracking";
import LottieView from "lottie-react-native"; // For animations
import { updateProfile } from "../../redux/slices/userSlice"; // Import updateProfile

const WorkoutScreen = () => {
  const dispatch = useDispatch();
  const [isFinished, setIsFinished] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const animationRef = useRef(null); // Animation reference

  // Load muscle tags and workout data on component mount
  useEffect(() => {
    dispatch(loadMuscleTags());
    dispatch(loadWorkout());
  }, [dispatch]);

  const muscleTags = useSelector((state) => state.muscleTags.muscleTags);
  const workoutDay = useSelector((state) => state.user.profile.workoutDay);
  const workoutData = useSelector((state) => state.workout.data);

  // Compute total days
  const totalDays = Object.keys(muscleTags).length;

  // Update isFinished state when workoutData changes
  useEffect(() => {
    if (workoutData?.isFinished) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  }, [workoutData]);

  // Initialize rating and notes from workoutData
  useEffect(() => {
    if (workoutData) {
      setRating(workoutData.rating || 0);
      setNotes(workoutData.notes || "");
    }
  }, [workoutData]);

  const handleStartWorkout = () => {
    console.log("startWorkout");
    dispatch(startWorkout());
  };

  const finishWorkout = () => {
    // Update the workout data
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        isFinished: true,
        isRated: true,
        rating,
        notes,
      })
    );

    // Update the user's workoutDay
    let nextWorkoutDay = workoutDay + 1;
    if (nextWorkoutDay > totalDays) {
      nextWorkoutDay = 1;
    }

    dispatch(updateProfile({ workoutDay: nextWorkoutDay }));
    setIsFinished(true);
    setIsAnimationFinished(false);
  };

  const undoFinishWorkout = () => {
    // Update the workout data
    dispatch(
      updateWorkoutInFirestore({
        ...workoutData,
        isFinished: false,
        isRated: false,
      })
    );

    // Update the user's workoutDay
    let prevWorkoutDay = workoutDay - 1;
    if (prevWorkoutDay < 1) {
      prevWorkoutDay = totalDays;
    }

    dispatch(updateProfile({ workoutDay: prevWorkoutDay }));
    setIsFinished(false);
    setIsAnimationFinished(false);
  };

  const handleAnimationFinish = () => {
    if (animationRef.current) {
      animationRef.current.reset(); // Reset the animation
    }
    setIsAnimationFinished(true);
  };

  const ConfettiAnimation = require("../../assets/lottie/lofi.json");

  if (!workoutData || !workoutData.isStarted) {
    return (
      <SafeAreaView className="flex-1">
        <View className="justify-center items-center mt-44">
          <TouchableOpacity
            className="bg-lime-500 pl-4 h-60 w-60 rounded-full justify-center items-center"
            onPress={handleStartWorkout}
          >
            <Ionicons name="play" size={150} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-5 left-0 right-0 items-center">
          <Text className="text-2xl text-white my-5 font-bold">
            Today's Muscle Groups:
          </Text>
          <View className="flex-row flex-wrap justify-center items-center mb-10 w-11/12">
            {muscleTags &&
            Array.isArray(muscleTags[workoutDay]) &&
            muscleTags[workoutDay].length > 0 ? (
              muscleTags[workoutDay].map((tag, index) => (
                <View
                  key={index}
                  className="bg-gray-900 border-2 border-orange-400 py-2 px-4 rounded-full m-1"
                >
                  <Text className="text-cyan-400 text-lg font-bold">{tag}</Text>
                </View>
              ))
            ) : (
              <Text className="text-lg text-white">
                No muscle tags available
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isFinished) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Text className="text-4xl text-white mb-4 font-bold text-center">
            Great Job!
          </Text>
          <Text className="text-lg text-white mb-8 text-center px-4">
            You've completed today's workout.
          </Text>
          <TouchableOpacity
            onPress={undoFinishWorkout}
            className="absolute bottom-10 p-4 bg-white rounded-full"
            style={{ elevation: 5, zIndex: 2 }}
          >
            <Ionicons name="arrow-back" size={24} color="#3b5998" />
          </TouchableOpacity>
          {!isAnimationFinished && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
            >
              <LottieView
                ref={animationRef}
                source={ConfettiAnimation}
                autoPlay
                loop={false}
                style={{ width: "100%", height: "100%" }}
                onAnimationFinish={handleAnimationFinish}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ExerciseTracking
        onFinishWorkout={finishWorkout}
        setRating={setRating}
        setNotes={setNotes}
        rating={rating}
        notes={notes}
      />
    </SafeAreaView>
  );
};

export default WorkoutScreen;
