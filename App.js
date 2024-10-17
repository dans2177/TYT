import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/compoments/redux/store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/api/firebase";
import {
  loginSuccess,
  logoutSuccess,
  setLoading,
} from "./src/compoments/redux/slices/authSlice";
import LoadingScreen from "./src/compoments/screens/LoadingScreen";
import AppNavigator from "./src/compoments/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { fetchProfile } from "./src/compoments/redux/slices/userSlice";

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
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <MainApp />
        <Toast topOffset={60} />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
