// src/components/screens/HomeScreen.jsx

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";


import { loadExercises } from "../../redux/slices/exerciseSlice";
import { fetchProfile } from "../../redux/slices/userSlice";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice";
import LoadingScreen from "./LoadingScreen";

const HomeScreen = () => {
  const navigation = useNavigation();

 
  //
  return (
    <View className="flex-1 bg-zinc-800">
      {/* Top Banner */}
      <View className="flex-row justify-between items-center mt-10 px-6 mb-4 p-6">
        {/* Left Icon */}
        <TouchableOpacity>
          <Text className="text-3xl">💪</Text>
        </TouchableOpacity>

        {/* Workout Planner */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text className="text-3xl text-white foint- font-bold">Workout Planner</Text>
        </TouchableOpacity>

        {/* Right Icon */}
        <TouchableOpacity onPress={() => navigation.navigate("Exercises")}>
          <Text className="text-3xl">🦾</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default HomeScreen;
