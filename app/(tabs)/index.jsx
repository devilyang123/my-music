import React, {useEffect, useState} from 'react'
import {Image, StyleSheet, View, Dimensions} from 'react-native'
import {Appbar, IconButton, Text} from 'react-native-paper'
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  State,
  RepeatMode
} from 'react-native-track-player'
import Slider from '@react-native-community/slider';
import TextTicker from "react-native-text-ticker";


let isPlayerSetup = false;

export async function setupPlayerOnce() {
  if (isPlayerSetup) {
    console.log("Player Has Already Setup")
    return;
  }
  await TrackPlayer.setupPlayer();
  console.log("Player First Setup")
  isPlayerSetup = true;
}


export default function HomeScreen() {

  const { width } = Dimensions.get("window");

  useEffect(() => {
    setupPlayerOnce()
    setTitle()
  }, [])

  const playbackState = usePlaybackState();
  const progress = useProgress(); // {position, duration, buffered}
  const [trackTitle, setTrackTitle] = useState("");
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);


  const setTitle = async () => {
    const currentTrack = await TrackPlayer.getActiveTrack()
    if (currentTrack) {
      setTrackTitle(currentTrack.title || "");
    }
  }

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    // console.log(event)
    if (event.type === Event.PlaybackActiveTrackChanged) {
      console.log("change music");
      setTrackTitle(event.track.title ?? "");
    }
  });


  // play or pause
  const togglePlayPause = async () => {
    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  // format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const hh = String(hrs).padStart(2, "0");
    const mm = String(mins).padStart(2, "0");
    const ss = String(secs).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };


  // swap repeat mode
  const toggleRepeatMode = async () => {
    let newMode;
    if (repeatMode === RepeatMode.Off) newMode = RepeatMode.Track;// single
    else if (repeatMode === RepeatMode.Track) newMode = RepeatMode.Queue;
    else newMode = RepeatMode.Off;
    setRepeatMode(newMode);
    await TrackPlayer.setRepeatMode(newMode);
  };

  return (
      <>
        <Appbar.Header/>
        <View style={styles.container}>
          {/* cover */}
          <Image
              source={require('../../assets/images/my-music-default-cover.jpg')}
              style={styles.artwork}
          />

          {/* title */}
          <TextTicker
              style={styles.title}
              duration={8000}
              loop
              bounce={false}
              repeatSpacer={50}
              marqueeDelay={1000}
              width={width * 0.8}
          >
            {trackTitle}
          </TextTicker>

          {/* progress */}
          <View style={styles.progressSliderContainer}>
            <Slider
                minimumValue={0}
                maximumValue={progress.duration || 0}
                step={1}
                value={seeking ? seekValue : progress.position}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#ddddd"
                thumbTintColor="#6200ee"
                style={{width: "100%"}}
                onSlidingStart={() => {
                  setSeekValue(progress.position);
                  setSeeking(true);
                }}
                onValueChange={(value) => {
                  if (seeking) {
                    setSeekValue(value);
                  }
                }}
                onSlidingComplete={async (value) => {
                  await TrackPlayer.seekTo(value);
                  setSeeking(false);
                }}
            />
          </View>
          {/* time */}
          <View style={styles.progressTimeContainer}>
            <Text>{formatTime(seeking ? seekValue : progress.position)}</Text>
            <Text>{formatTime(progress.duration)}</Text>
          </View>

          {/* operation */}
          <View style={styles.controlContainer}>
            <IconButton icon="skip-previous" size={40} onPress={() => TrackPlayer.skipToPrevious()}/>
            <IconButton
                icon={playbackState.state === State.Playing ? "pause-circle" : "play-circle"}
                size={60}
                onPress={() => togglePlayPause()}/>
            <IconButton icon="skip-next" size={40} onPress={() => TrackPlayer.skipToNext()}/>
            <IconButton icon={
              repeatMode === RepeatMode.Off
                  ? "repeat-off"
                  : repeatMode === RepeatMode.Track
                      ? "repeat-once"
                      : "repeat"
            } size={20} onPress={() => toggleRepeatMode()}/>
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
    // width: 280,
    height: 20,
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
