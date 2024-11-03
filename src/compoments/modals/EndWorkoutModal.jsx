import React from "react";
import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
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
      <View className="flex-1 bg-zinc-800 bg-opacity-75 justify-center items-center p-4">
        <View className="bg-white rounded-lg p-4 w-full max-w-md">
          <Text className="text-xl mb-4">Rate your workout (1-5 stars)</Text>
          <View className="flex-row justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="mx-1"
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color="orange"
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            placeholder="Add notes about your workout"
            value={notes}
            onChangeText={setNotes}
            multiline
            className="border border-gray-300 p-2 rounded-lg mb-4"
          />
          <TouchableOpacity
            onPress={finishWorkout}
            className="p-4 bg-green-500 rounded-lg mb-2"
          >
            <Text className="text-white text-center">Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="p-4 bg-gray-500 rounded-lg"
          >
            <Text className="text-white text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default EndWorkoutModal;
