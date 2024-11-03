// src/components/screens/HomeScreen.jsx

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import WorkoutScreen from "./WorkoutScreen.jsx";

const HomeScreen = () => {
  const navigation = useNavigation();

  //
  return (
    <View className="flex-1 bg-zinc-800">
      {/* Top Banner */}
      <View className="flex-row justify-between items-center mt-12 mb-4 px-6 pt-4">
        {/* Left Icon */}
        <TouchableOpacity>
          <Text className="text-3xl">💪</Text>
        </TouchableOpacity>

        {/* Workout Planner */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text className="text-4xl text-white font-handjet">
            Workout Planner
          </Text>
        </TouchableOpacity>

        {/* Right Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Exercises")}>
          <Text className="text-3xl">📋</Text>
        </TouchableOpacity>
      </View>
      <WorkoutScreen />
    </View>
  );
};

export default HomeScreen;
