import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["#000000", "#0a0a0a", "#ff5500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", width: width, height: height }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Flashing Text */}
        <Animated.View>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 40,
              fontWeight: "900",
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            TAKE CARE OF
          </Text>
          <Text
            style={{
              color: "#ffffff",
              fontSize: 50,
              fontWeight: "900",
              letterSpacing: 3,
              textAlign: "center",
              marginTop: -10,
            }}
          >
            WHAT GOD GAVE YOU
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
