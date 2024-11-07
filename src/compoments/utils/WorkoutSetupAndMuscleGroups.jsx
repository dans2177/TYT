import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styled } from "nativewind";
import InfoModal from "../modals/AssignMuscleGroupsModal";
import { useDispatch, useSelector } from "react-redux";
import { loadMuscleTags } from "../../redux/slices/muscleTagsSlice"; // Import loadMuscleTags

const StyledView = styled(View);
const StyledText = styled(Text);

const WorkoutSetupAndMuscleGroups = ({
  days,
  incrementDays,
  decrementDays,
  selectedGroups,
  toggleSelection,
  selectedDays,
  dropOnDay,
  removeFromDay,
  muscleGroups,
  dayColors,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const dispatch = useDispatch();
  const muscleTagsState = useSelector((state) => state.muscleTags.muscleTags);

  // Load muscle tags on mount if not already loaded
  useEffect(() => {
    if (Object.keys(muscleTagsState).length === 0) {
      dispatch(loadMuscleTags());
    }
  }, [dispatch, muscleTagsState]);

  return (
    <>
      <View className="flex-row justify-between items-center px-4 pt-4">
        <Text className="text-neutral-100 text-3xl">Workout Setup</Text>
        <TouchableOpacity onPress={() => setShowInfoModal(true)}>
          <StyledText className="text-white text-3xl">ℹ️</StyledText>
        </TouchableOpacity>
      </View>

      <View className="bg-stone-800 mx-4 my-2 rounded-xl p-4 ">
        <Text className="text-neutral-100">
          How many days a week do you workout?
        </Text>
        <StyledView className="flex-row justify-center items-center py-4">
          <TouchableOpacity
            onPress={decrementDays}
            className={`bg-red-600 rounded-full h-14 w-14 flex items-center justify-center mr-4 ${
              days <= 1 ? "opacity-50" : ""
            }`}
            disabled={days <= 1}
          >
            <StyledText className="text-white text-2xl">-</StyledText>
          </TouchableOpacity>
          <StyledText className="text-white text-3xl">{days}</StyledText>
          <TouchableOpacity
            onPress={incrementDays}
            className={`bg-amber-600 rounded-full h-14 w-14 flex items-center justify-center ml-4 ${
              days >= 7 ? "opacity-50" : ""
            }`}
            disabled={days >= 7}
          >
            <StyledText className="text-white text-2xl">+</StyledText>
          </TouchableOpacity>
        </StyledView>
      </View>

      <View className="bg-stone-800 mx-4 rounded-xl p-4 mb-8">
        <View className="flex-row justify-between items-start">
          <Text className="text-neutral-100">What do you hit each day?</Text>
        </View>

        <StyledView className="flex-wrap flex-row justify-center p-2">
          {muscleGroups.map((group) => (
            <TouchableOpacity
              key={group}
              onPress={() => toggleSelection(group)}
              className={`px-4 py-2 m-1 rounded-full ${
                selectedGroups.includes(group) ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <StyledText className="font-bold">{group}</StyledText>
            </TouchableOpacity>
          ))}
        </StyledView>

        <ScrollView className="rounded-xl">
          {Object.keys(selectedDays).map((dayId, index) => (
            <TouchableOpacity
              key={dayId}
              onPress={() => dropOnDay(dayId)}
              className={`${
                dayColors[index % dayColors.length]
              } p-2 mb-2 rounded-lg`}
            >
              <StyledText className="text-white text-xl mr-2">
                {`Day ${dayId}`}
              </StyledText>
              <StyledView className="flex-wrap flex-row">
                {(selectedDays[dayId] || []).map((group, idx) => (
                  <TouchableOpacity
                    key={`${group}-${idx}`}
                    onLongPress={() => removeFromDay(dayId, group)}
                    className="bg-gray-900 px-3 py-2 m-1 rounded-full"
                  >
                    <StyledText className="text-white">{group}</StyledText>
                  </TouchableOpacity>
                ))}
              </StyledView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* InfoModal Component */}
        <InfoModal
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />
      </View>
    </>
  );
};

export default WorkoutSetupAndMuscleGroups;
