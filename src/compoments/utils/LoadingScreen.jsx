// src/components/utils/LoadingScreen.js

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const LoadingScreen = ({ message }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00d1b2" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a202c",
  },
  message: {
    marginTop: 16,
    fontSize: 18,
    color: "#ffffff",
  },
});

export default LoadingScreen;
