// src/components/utils/HomeStartButton.js

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import WorkoutTile from "./WorkoutTile";
import { useSelector } from "react-redux";
import { makeSelectIsStartedByDate } from "../../redux/selectors";

const HomeStartButton = ({ workoutData, onStartWorkout, date }) => {
  const selectIsStartedByDate = makeSelectIsStartedByDate();
  const isStarted = useSelector((state) => selectIsStartedByDate(state, date));

  return (
    <View style={{ alignItems: "center", marginTop: 80 }}>
      {!isStarted && (
        <TouchableOpacity onPress={onStartWorkout} style={{ marginTop: 80 }}>
          <FontAwesome name="play-circle" size={350} color="#00d1b2" />
        </TouchableOpacity>
      )}

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
