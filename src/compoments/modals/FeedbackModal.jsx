// FeedbackModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform, // Import Platform for any platform-specific logic
} from "react-native";
import { auth } from "../../api/firebase"; // Ensure this path is correct

const FeedbackModal = ({ visible, onClose }) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get the current user's email from Firebase Auth
  const currentUser = auth.currentUser;
  const userEmail = currentUser ? currentUser.email : "";

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Validation Error", "Please enter your feedback.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mqakpgbo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: userEmail, // Email is included in the submission
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Thank you for your feedback!");
        setMessage("");
        onClose();
      } else {
        Alert.alert("Submission Failed", data.error || "An error occurred.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!submitting) {
          onClose();
        }
      }}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-lg w-4/5 p-6 shadow-lg">
          <Text className="text-2xl font-bold mb-4 text-center">Feedback</Text>

          <Text className="text-sm text-gray-700 mb-2">Your Feedback</Text>
          <TextInput
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your feedback here..."
            className="border border-gray-300 rounded-md p-3 mb-4 text-gray-800 h-40 min-h-40"
            editable={!submitting}
            textAlignVertical="top" // Ensures text starts at the top on Android
            accessibilityLabel="Feedback Input"
            accessibilityHint="Enter your feedback here"
          />

          {submitting ? (
            <ActivityIndicator size="large" color="#6B21A8" />
          ) : (
            <View className="flex-row justify-center items-center">
              <TouchableOpacity
                onPress={onClose}
                className="mr-4"
                disabled={submitting}
              >
                <Text className="text-red-500 text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-purple-600 px-6 py-2 rounded-md"
                disabled={submitting}
              >
                <Text className="text-white text-lg">Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
