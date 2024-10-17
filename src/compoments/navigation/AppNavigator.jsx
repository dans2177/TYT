import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector } from "react-redux";
import SignInScreen from "../screens/SignInScreen";
import RegisterScreen from "../screens/RegisterScreen";
import IntroModal from "../modals/IntroModal";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

const AppNavigator = ({ user }) => {
  const { introComplete } = useSelector((state) => state.user.profile);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          {/* If the user is not logged in, show SignIn and Register screens */}
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
        <>
          {/* If the user is logged in but intro is not complete, show IntroModal */}
          <Stack.Screen
            name="Intro"
            component={IntroModal}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {/* If the user is logged in and intro is complete, show Home */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
              />
              
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
