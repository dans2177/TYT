import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import HomeStartButton from "../utils/HomeStartButton";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Initialize navigation

  return (
    <View className="flex-1 items-center justify-between bg-zinc-900 p-6">
      {/* Top Banner */}
      <View className="flex-row w-full justify-between items-center mt-10">
        <TouchableOpacity>
          <Text>💪</Text>
        </TouchableOpacity>

        {/* Make Workout Planner clickable */}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text className="text-2xl font-bold text-white text-neon-green">
            Workout Planner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text>🦾</Text>
        </TouchableOpacity>
      </View>

      {/* Start Workout Button */}
      <HomeStartButton />
    </View>
  );
};

export default HomeScreen;
