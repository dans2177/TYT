import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";

const HomeScreen = () => {
  const dispatch = useDispatch();

  return (
    <View className="flex-1 items-center justify-between bg-zinc-900 p-6">
      {/* Top Banner */}
      <View className="flex-row w-full justify-between items-center mt-10">
        <TouchableOpacity>
          <Text>💪</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white text-neon-green">
          Workout Planner
        </Text>
        <TouchableOpacity>
          <Text>🦾</Text>
        </TouchableOpacity>
      </View>

      {/* Start Workout Button */}
      <View className="flex-1 justify-center items-center ">
        <TouchableOpacity
          className=" "
        >
          <FontAwesome name="play-circle" size={350} color="#39ff14" />
          <Text className="text-xl text-neon-green mt-4 text-center text-white">Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
