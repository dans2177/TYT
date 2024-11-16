import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { auth } from "../../api/firebase";

const FeedbackModal = ({ visible, onClose }) => {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          email: userEmail,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-80">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="bg-[#1e1e1e] rounded-lg w-5/6 p-4"
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                }}
              >
                <Text className="text-2xl text-center text-white font-bold mb-4">
                  Feedback
                </Text>

                <Text className="text-sm text-gray-400 mb-2">
                  We value your thoughts! Please share your feedback below.
                </Text>

                <TextInput
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Enter your feedback here..."
                  placeholderTextColor="#888"
                  className="border border-gray-600 bg-[#2a2a2a] rounded-md p-3 text-white h-40"
                  editable={!submitting}
                  textAlignVertical="top"
                  accessibilityLabel="Feedback Input"
                  accessibilityHint="Enter your feedback here"
                />

                {submitting ? (
                  <ActivityIndicator size="large" color="#F97316" />
                ) : (
                  <View className="flex-row justify-center my-4">
                    <TouchableOpacity
                      onPress={onClose}
                      className="mr-4 border border-red-500 rounded-md px-4 py-2"
                      disabled={submitting}
                    >
                      <Text className="text-red-400 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSubmit}
                      className="bg-orange-600 px-6 py-2 rounded-md"
                      disabled={submitting}
                    >
                      <Text className="text-white text-lg">Submit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FeedbackModal;
