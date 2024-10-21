// src/components/utils/HomeStartButton.js

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import WorkoutTile from "./WorkoutTile";

const HomeStartButton = ({ workoutData, onStartWorkout }) => {
  return (
    <View style={{ alignItems: "center" }}>
      {/* Play button in the center of the screen */}
      <TouchableOpacity onPress={onStartWorkout} className="mt-20">
        <FontAwesome name="play-circle" size={350} color="#00d1b2" />
      </TouchableOpacity>

      {/* Workout tags at the bottom */}
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#FF8C00",
            marginBottom: 10,
          }}
        >
          Today's Workout:
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {workoutData.map((workout, index) => (
            <WorkoutTile key={index} workoutName={workout} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default HomeStartButton;
