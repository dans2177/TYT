import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { styled } from "nativewind";

// Styled components using NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);

const AssignMuscleGroupsModal = ({ visible, onClose }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <StyledView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      >
        <StyledView className="bg-zinc-800 p-6 rounded-lg mx-5">
          <StyledText className="text-white text-xl font-bold text-center mb-4">
            How to Assign Muscle Groups
          </StyledText>
          <StyledText className="text-white mb-2">
            <Text className="font-bold">1. Select Muscle Groups:</Text> Tap on
            the tags of the muscle groups you want to include in your workout.
            Selected tags will be highlighted.
          </StyledText>
          <StyledText className="text-white mb-2">
            <Text className="font-bold">2. Assign to a Day:</Text> Tap on the
            day you want to assign the selected muscle groups to. They will be
            added to that day's workout plan.
          </StyledText>
          <StyledText className="text-white mb-2">
            <Text className="font-bold">3. Remove Muscle Groups:</Text> To
            remove a muscle group from a day, press and hold (long-press) on the
            muscle group tag under that day.
          </StyledText>
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 bg-teal-500 py-2 px-4 rounded-full"
          >
            <StyledText className="text-white text-center text-lg">
              Close
            </StyledText>
          </TouchableOpacity>
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default AssignMuscleGroupsModal;
