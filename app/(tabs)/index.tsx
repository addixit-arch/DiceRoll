import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const diceImages = {
  1: require("../../assets/images/one.png"),
  2: require("../../assets/images/two.png"),
  3: require("../../assets/images/three.png"),
  4: require("../../assets/images/four.png"),
  5: require("../../assets/images/five.png"),
  6: require("../../assets/images/six.png"),
};

export default function DiceScreen() {
  const [muted, setMuted] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  async function playSound() {
    if (muted) return;
    if (sound) {
      await sound.replayAsync();
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      require("../../assets/dice-sound.mp3")
    );
    setSound(newSound);
    await newSound.playAsync();
  }

  const rollDice = async () => {
    if (rolling) return;
    await playSound();
    setRolling(true);

    // Pick final face now
    const finalFace = Math.floor(Math.random() * 6) + 1;
    setCurrentFace(finalFace); // set it immediately so it spins with correct face

    // Reset animation
    rotateAnim.setValue(0);

    // Animate the rotation (with overspin so it looks real)
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      // Finished spinning
      setResult(finalFace);
      setRolling(false);
    });
  };

  // Interpolations for tumbling effect
  const rotateX = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"], // 2 spins
  });
  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "540deg"], // 1.5 spins
  });
  const rotateZ = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"], // 1 spin
  });
  const scale = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1], // bounce effect
  });

  return (
    <View style={styles.container}>
      {/* Sound toggle */}
      <TouchableOpacity
        onPress={() => setMuted(!muted)}
        style={styles.soundButton}
      >
        <Ionicons
          name={muted ? "volume-mute" : "volume-high"}
          size={28}
          color="#333"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Tap the dice to roll</Text>

      <TouchableOpacity onPress={rollDice} activeOpacity={0.8}>
        <Animated.Image
          source={diceImages[currentFace]}
          style={[
            styles.dice,
            {
              transform: [
                { perspective: 1000 },
                { rotateX },
                { rotateY },
                { rotateZ },
                { scale },
              ],
            },
          ]}
        />
      </TouchableOpacity>
{/* <View>
      {result && <Text style={styles.result}>You rolled: {result}</Text>}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF3FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#000",
    fontSize: 18,
    marginBottom: 20,
  },
  dice: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  soundButton: {
    position: "absolute",
    top: 50,
    right: 30,
    backgroundColor: "#ffffffdd",
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});


