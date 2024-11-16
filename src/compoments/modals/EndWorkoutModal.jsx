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
  TouchableWithoutFeedback,
  Keyboard,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black bg-opacity-80 justify-center items-center">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="bg-[#1e1e1e] rounded-lg p-4 w-5/6"
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <Text className="text-2xl text-center text-white font-bold mb-4">
                How was your workout?
              </Text>

              {/* Workout Rating */}
              <Text className="text-lg text-gray-400 mb-2">
                Rate your workout:
              </Text>
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
                      color="#FACC15" // Golden yellow for stars
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes Input */}
              <Text className="text-lg text-gray-400 mb-2">Your Notes:</Text>
              <View className="min-h-[200px] border border-gray-600 rounded-md bg-[#2a2a2a] p-3 mb-4">
                <TextInput
                  value={notes}
                  onChangeText={(text) => setNotes(text)}
                  multiline
                  className="flex-1 text-base text-white"
                  placeholder="Write your thoughts..."
                  placeholderTextColor="#888"
                  textAlignVertical="top"
                />
              </View>

              {/* Finish Workout Button */}
              <TouchableOpacity
                onPress={finishWorkout}
                className="p-4 bg-green-600 rounded-md"
              >
                <Text className="text-white text-center text-lg font-bold">
                  Finish Workout
                </Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onClose}
                className="p-4 bg-gray-600 rounded-md my-2"
              >
                <Text className="text-white text-center text-lg font-bold ">
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EndWorkoutModal;
