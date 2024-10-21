// src/components/utils/RatingComponent.js

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { addOrUpdateWorkoutInFirestore } from "../../redux/slices/workoutSlice";
import { useDispatch } from "react-redux";

const RatingComponent = ({ rating, date, todayWorkout }) => {
  const dispatch = useDispatch();
  const [currentRating, setCurrentRating] = useState(rating || 0);

  useEffect(() => {
    // Update workout rating in Firestore
    const updatedWorkout = {
      ...todayWorkout,
      rating: currentRating,
    };
    dispatch(addOrUpdateWorkoutInFirestore({ date, workout: updatedWorkout }));
  }, [currentRating, todayWorkout, date, dispatch]);

  return (
    <View className="mt-6">
      <Text className="text-xl font-bold">Rate Your Workout:</Text>
      <View className="flex-row mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setCurrentRating(star)}
            className="mr-2"
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
