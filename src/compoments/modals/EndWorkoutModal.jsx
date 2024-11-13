// EndWorkoutModal.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EndWorkoutModal = ({
  visible,
  onClose,
  rating,
  setRating,
  notes,
  setNotes,
  finishWorkout,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black bg-opacity-75 justify-center items-center p-4">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="w-full max-w-md bg-white rounded-lg p-4"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Text className="text-2xl mb-4 text-center font-bold">
              How was your workout?
            </Text>

            <Text className="text-lg mb-2">Rate your workout:</Text>
            <View className="flex-row justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  className="mx-1"
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-lg mb-2">Your Notes:</Text>
            <View className="min-h-[200px] border border-gray-300 rounded-md mb-4 bg-[#fdfdc4] p-2">
              <TextInput
                value={notes}
                onChangeText={(text) => setNotes(text)}
                multiline
                className="flex-1 text-base text-gray-800 font-mono text-top"
                placeholder="Write your thoughts..."
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              onPress={finishWorkout}
              className="p-4 bg-green-600 rounded-lg mt-4"
            >
              <Text className="text-white text-center text-lg font-bold">
                Finish Workout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="p-4 bg-gray-600 rounded-lg mt-2 mb-12"
            >
              <Text className="text-white text-center text-lg font-bold">
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EndWorkoutModal;
