// src/components/utils/WorkoutTile.jsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WorkoutTile = ({ workoutName }) => (
  <View style={styles.tile}>
    <Text style={styles.tileText}>{workoutName}</Text>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  tileText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default WorkoutTile;
