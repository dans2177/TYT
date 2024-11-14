import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/redux/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/api/firebase";
import {
  loginSuccess,
  logoutSuccess,
  setLoading,
} from "./src/redux/slices/authSlice";
import LoadingScreen from "./src/compoments/screens/LoadingScreen";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { fetchProfile } from "./src/redux/slices/userSlice";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});
const MainApp = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        const {
          uid,
          email,
          displayName,
          emailVerified,
          phoneNumber,
          photoURL,
        } = authUser;

        dispatch(
          loginSuccess({
            uid,
            email,
            displayName,
            emailVerified,
            phoneNumber,
            photoURL,
          })
        );
        dispatch(fetchProfile());
      } else {
        dispatch(logoutSuccess());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
};

const App = () => {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Handjet: require("./src/assets/fonts/Handjet.ttf"),
    // Add more fonts here if needed
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center ">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider className="">
      <Provider store={store}>
        <MainApp />
        <Toast topOffset={60} />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
