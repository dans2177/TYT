// src/redux/selectors.js

import { createSelector } from "reselect";

// Base Selectors
const selectWorkoutsState = (state) => state.workouts.workouts;
const selectWorkoutExerciseTrackingState = (state) =>
  state.workoutExerciseTracking.tracking;

// Selector to get workouts by date
export const makeSelectWorkoutByDate = () => {
  return createSelector(
    [selectWorkoutsState, (state, date) => date],
    (workouts, date) => workouts[date] || {}
  );
};

// Selector to get exercise tracking by workoutId
export const makeSelectExerciseTrackingByWorkoutId = () => {
  return createSelector(
    [selectWorkoutExerciseTrackingState, (state, workoutId) => workoutId],
    (tracking, workoutId) => tracking[workoutId] || {}
  );
};

// Selector to get exercises by workoutId
export const makeSelectExercisesByWorkoutId = () => {
  return createSelector(
    [selectWorkoutsState, (state, workoutId) => workoutId],
    (workouts, workoutId) => {
      const workout = workouts[workoutId];
      return workout ? workout.exercises || {} : {};
    }
  );
};

// Selector to get 'isStarted' status by date
export const makeSelectIsStartedByDate = () => {
  return createSelector(
    [selectWorkoutsState, (state, date) => date],
    (workouts, date) => workouts[date]?.isStarted || false
  );
};
