// src/screens/WorkoutScreen.js

import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice";
import { loadWorkout, startWorkout } from "../../redux/slices/workoutSlice";
import { Ionicons } from "@expo/vector-icons";
import ExerciseTracking from "../utils/ExerciseTracking";

const WorkoutScreen = () => {
  const dispatch = useDispatch();

  // Load muscle tags and workout data on component mount
  useEffect(() => {
    dispatch(loadMuscleTags());
    dispatch(loadWorkout());
  }, [dispatch]);

  const muscleTags = useSelector((state) => state.muscleTags.muscleTags);
  const workoutDay = useSelector((state) => state.user.profile.workoutDay);
  const workoutData = useSelector((state) => state.workout.data);

  // Console log muscle tags and workout days for debugging
  console.log("muscleTags", muscleTags);
  console.log("workoutDay", workoutDay);
  console.log("workoutData", workoutData);

  const handleStartWorkout = () => {
    console.log("startWorkout");
    dispatch(startWorkout());
  };

  // Render when workout hasn't started
  if (!workoutData || !workoutData.isStarted) {
    return (
      <SafeAreaView className="flex-1 ">
        <View className=" justify-center items-center mt-44">
          {/* Play Button */}
          <TouchableOpacity
            className="bg-lime-500 pl-4 h-60 w-60 rounded-full justify-center items-center"
            onPress={handleStartWorkout}
          >
            <Ionicons name="play" size={150} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Bottom Section: Title and Tags */}
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

  // Render when workout has started
  return (
    <SafeAreaView className="flex-1 ">
      <ExerciseTracking />
    </SafeAreaView>
  );
};

export default WorkoutScreen;
