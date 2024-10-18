import React from "react";
import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WorkoutTile = ({ workoutName }) => {
  return (
    <LinearGradient
      colors={["#FF8C00", "#FF4500"]} // Same gradient color for all tiles
      start={{ x: 0, y: 0 }} // Top-left
      end={{ x: 1, y: 1 }} // Bottom-right
      style={{ margin: 8, padding: 10, borderRadius: 20 }}
    >
      <Text className="text-black text-2xl font-semibold">{workoutName}</Text>
    </LinearGradient>
  );
};

export default WorkoutTile;
