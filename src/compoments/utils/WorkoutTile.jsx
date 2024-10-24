// src/components/utils/WorkoutTile.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WorkoutTile = ({ workoutName }) => {
  return (
    <View style={styles.tile}>
      <Text style={styles.text}>{workoutName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: "#4ade80", // Tailwind 'bg-lime-500'
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  text: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default WorkoutTile;
