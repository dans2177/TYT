// src/components/utils/RatingComponent.js

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { addOrUpdateWorkoutInFirestore } from "../../redux/slices/workoutsSlice";
import { useDispatch } from "react-redux";

const RatingComponent = ({ rating, date, workoutId }) => {
  const dispatch = useDispatch();
  const [currentRating, setCurrentRating] = useState(rating || 0);

  useEffect(() => {
    // Update workout rating in Firestore
    const updatedWorkout = {
      rating: currentRating,
    };
    dispatch(addOrUpdateWorkoutInFirestore({ date, workout: updatedWorkout }));
  }, [currentRating, date, dispatch]);

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#FFA500",
          marginBottom: 10,
        }}
      >
        Rate Your Workout:
      </Text>
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setCurrentRating(star)}
            style={{ marginRight: 8 }}
          >
            <Text
              style={{
                fontSize: 32,
                color: star <= currentRating ? "gold" : "gray",
              }}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default RatingComponent;
