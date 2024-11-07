// GlitchText.js
import React, { useEffect } from "react";
import { Animated, Text, StyleSheet } from "react-native";

const GlitchText = ({ text, style }) => {
  const glitchTranslateX = new Animated.Value(0);
  const glitchTranslateY = new Animated.Value(0);

  useEffect(() => {
    const startGlitch = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glitchTranslateX, {
            toValue: Math.random() * 10 - 5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(glitchTranslateY, {
            toValue: Math.random() * 10 - 5,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glitchTranslateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(glitchTranslateY, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
      ]).start(() => startGlitch());
    };

    startGlitch();
  }, []);

  return (
    <Animated.View style={[styles.container, style]}>
      {/* Red Layer */}
      <Animated.Text
        style={[
          styles.glitchText,
          styles.glitchTextRed,
          {
            transform: [
              { translateX: glitchTranslateX },
              { translateY: glitchTranslateY },
            ],
          },
        ]}
      >
        {text}
      </Animated.Text>
      {/* Blue Layer */}
      <Animated.Text
        style={[
          styles.glitchText,
          styles.glitchTextBlue,
          {
            transform: [
              { translateX: Animated.multiply(glitchTranslateX, -1) },
              { translateY: Animated.multiply(glitchTranslateY, -1) },
            ],
          },
        ]}
      >
        {text}
      </Animated.Text>
      {/* Main Text */}
      <Text style={[styles.glitchText, styles.glitchTextMain]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  glitchText: {
    fontFamily: "PressStart2P-Regular",
    fontSize: 24,
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  glitchTextMain: {
    zIndex: 1,
  },
  glitchTextRed: {
    position: "absolute",
    color: "#FF3B3B",
    zIndex: 0,
  },
  glitchTextBlue: {
    position: "absolute",
    color: "#3B3BFF",
    zIndex: 0,
  },
});

export default GlitchText;
