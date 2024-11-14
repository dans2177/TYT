import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import SignInScreen from "../compoments/screens/SignInScreen";
import RegisterScreen from "../compoments/screens/RegisterScreen";
import IntroModal from "../compoments/modals/IntroModal";
import HomeScreen from "../compoments/screens/HomeScreen";
import ExerciseScreen from "../compoments/screens/ExerciseScreen";
import SettingsScreen from "../compoments/screens/SettingsScreen";
import WorkoutHistory from "../compoments/screens/WorkoutHistory";
import LoadingScreen from "../compoments/screens/LoadingScreen";

const Stack = createStackNavigator();

const AppNavigator = ({ user }) => {
  const { introComplete } = useSelector((state) => state.user.profile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading of user data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Adjust the delay if needed

    return () => clearTimeout(timer);
  }, [user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // User not logged in, show SignIn and Register screens
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : !introComplete ? (
        // User logged in but intro is not complete, show IntroModal
        <Stack.Screen
          name="Intro"
          component={IntroModal}
          options={{ headerShown: false }}
        />
      ) : (
        // User logged in and intro is complete, show Home and other screens
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Exercises"
            component={ExerciseScreen}
            options={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
              gestureDirection: "vertical",
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.height, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          />
          <Stack.Screen
            name="WorkoutHistory"
            component={WorkoutHistory}
            options={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;