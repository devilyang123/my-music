import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Music = () => {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>music</Text>
      </View>
    </>
  );
};

export default Music;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "#fffbff",
  },
  text: {
    color: "red",
    fontSize: 30,
    fontWeight: 700,
  },
});
