// ExerciseTracking.jsx
import React from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

const ExerciseTracking = () => {
  // Correct selector path
  const workoutId = useSelector((state) => state.workout.data?.id);

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-white text-2xl font-bold mb-5">
        ExerciseTracking
      </Text>
      {workoutId ? (
        <Text className="text-white text-xl font-bold my-5">{workoutId}</Text>
      ) : (
        <Text className="text-gray-400 text-lg my-5">
          No Workout ID Available
        </Text>
      )}
    </View>
  );
};

export default ExerciseTracking;
