import React from 'react'
import {Image, StyleSheet, View} from 'react-native'
import {Appbar, IconButton, Text} from 'react-native-paper'
import TrackPlayer from 'react-native-track-player'
import Slider from '@react-native-community/slider';

export default function HomeScreen() {
  return (
      <>
        <Appbar.Header/>
        <View style={styles.container}>
          {/* cover */}
          <Image
              source={require('../../assets/images/react-logo.png')}
              style={styles.artwork}
          />

          {/* title */}
          <Text style={styles.title}>empty queue</Text>

          {/* progress */}
          <View style={styles.progressSliderContainer}>
            <Slider
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
                style={{width: "100%"}}
            />
          </View>

          {/* time */}
          <View style={styles.progressTimeContainer}>
            <Text>00:00:00</Text>
            <Text>00:00:00</Text>
          </View>

          {/* operation */}
          <View style={styles.controlContainer}>
            <IconButton icon="skip-previous" size={45} onPress={() => TrackPlayer.skipToPrevious()}/>
            <IconButton icon="pause-circle" size={50}/>
            <IconButton icon="skip-next" size={45} onPress={() => TrackPlayer.skipToNext()}/>
            <IconButton icon="repeat-once" size={30}/>
          </View>
        </View>
      </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: "#fffbff",
  },
  artwork: {
    width: "85%",
    height: "50%",
    borderRadius: 16,
    marginBottom: 80,
    // backgroundColor: "red"
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    width: "90%",
    // backgroundColor: "blue"
  },
  progressSliderContainer: {
    flexDirection: "row",
    justifyContent: "center",
    height: 20,
    width: "90%",
    // backgroundColor: "red"
  },
  progressTimeContainer: {
    flexDirection: "row",
    height: 20,
    width: "90%",
    justifyContent: 'space-between',
    // backgroundColor: "yellow"
  },
  controlContainer: {
    flexDirection: 'row',
    width: "90%",
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
    // backgroundColor: "green"
  },
})
