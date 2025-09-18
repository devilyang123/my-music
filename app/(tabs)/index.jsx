import React, {useEffect, useState, useRef} from 'react'
import {Image, StyleSheet, View, Dimensions} from 'react-native'
import {Appbar, IconButton, Text,Dialog ,Portal, Button} from 'react-native-paper'
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  State,
  RepeatMode,
  Capability
} from 'react-native-track-player'
import Slider from '@react-native-community/slider';
import TextTicker from "react-native-text-ticker";
import { Picker } from "@react-native-picker/picker";
import { createClient,AuthType } from "webdav/react-native";


let isPlayerSetup = false;

export async function setupPlayerOnce() {
  console.log("HomeScreen SetupPlayerOnce start")
  try {
    if (isPlayerSetup) {
      console.log("HomeScreen SetupPlayerOnce Player Has Already Setup")
      return;
    }
    await TrackPlayer.setupPlayer();
    console.log("HomeScreen SetupPlayerOnce Player First Setup")
    isPlayerSetup = true;

    await TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });
  }catch (err){
    console.log("HomeScreen SetupPlayerOnce err", err)
  }
}
export async function resetPlayer(){
  console.log("HomeScreen ResetPlayer start")
  try {
    await TrackPlayer.reset()
  }catch (err){
    console.log("HomeScreen ResetPlayer err", err)
  }
}


export async function webdav() {
  try {
    console.log("webdav start");
    const client = createClient(
        "http://openlist-en.fancwkj.com:5244/dav/YoutubeVideo/EnglishAudio/BookishEnglish",
        {
          username: "admin",
          password: "OpenListAdmin666666",
          authType: AuthType.auto
        }
    );
// Get directory contents
    const directoryItems = await client.getDirectoryContents("/");
    console.log(directoryItems);
  }catch (err){
    console.log("webdav err", err);
  }
}


export default function HomeScreen() {

  const { width } = Dimensions.get("window");

  useEffect(() => {
    webdav()
    setupPlayerOnce()
    setTitle()
  }, [])

  const playbackState = usePlaybackState();
  const progress = useProgress(); // {position, duration, buffered}
  const [trackTitle, setTrackTitle] = useState("");
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);

  const [timerVisible, setTimerVisible] = useState(false);
  const [hasTimer, setHasTimer] = useState(false);
  const timerRef = useRef(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const totalMs = (selectedHour * 60 + selectedMinute) * 60 * 1000;
    if (totalMs > 0) {
      timerRef.current = setTimeout(() => {
        TrackPlayer.pause();
        setHasTimer(false);
      }, totalMs);
      setHasTimer(true);
    }
    setTimerVisible(false);
  };

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHasTimer(false);
    setTimerVisible(false);
  };

  const setTitle = async () => {
    const currentTrack = await TrackPlayer.getActiveTrack()
    if (currentTrack) {
      setTrackTitle(currentTrack.title || "");
    }
  };

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged) {
      console.log("change music");
      if (event.track){
        setTrackTitle(event.track.title ?? "");
      }
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
        <Appbar.Header style={styles.header}>
          <Appbar.Action icon="stop-circle" onPress={() => resetPlayer()}/>
        </Appbar.Header>
        <View style={styles.container}>
          {/* cover */}
          <Image
              source={require('../../assets/images/my-music-default-cover.jpg')}
              style={styles.artwork}
          />

          {/* title */}
          <View style={styles.titleContainer}>
            <TextTicker
                style={styles.title}
                duration={8000}
                loop
                bounce={false}
                repeatSpacer={50}
                marqueeDelay={1000}
                // width={width * 0.8}
            >
              {trackTitle}
            </TextTicker>
          </View>

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
            <IconButton
                icon={hasTimer ? "timer" : "timer-off"}
                size={20}
                onPress={() => setTimerVisible(true)}
            />
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

        <Portal>
          <Dialog visible={timerVisible} onDismiss={() => setTimerVisible(false)}>
            <Dialog.Title>Sleep Timer</Dialog.Title>
            <Dialog.Content>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text>Hour</Text>
                  <Picker
                      selectedValue={selectedHour}
                      onValueChange={(itemValue) => setSelectedHour(itemValue)}
                      style={{ width: 100 }}
                      mode="dropdown"
                  >
                    {hoursArray.map((h) => (
                        <Picker.Item key={h} label={h.toString()} value={h} />
                    ))}
                  </Picker>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text>Minute</Text>
                  <Picker
                      selectedValue={selectedMinute}
                      onValueChange={(itemValue) => setSelectedMinute(itemValue)}
                      style={{ width: 100 }}
                      mode="dropdown"
                  >
                    {minutesArray.map((m) => (
                        <Picker.Item key={m} label={m.toString()} value={m} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              {hasTimer && <Button onPress={clearTimer}>Clear</Button>}
              <Button onPress={startTimer}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </>
  )
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "flex-end",
  },
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
  titleContainer:{
    flexDirection:"row",
    justifyContent: "center",
    alignItems:"center",
    width:"88%",
    // backgroundColor: "pink"
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    // width: "100%",
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
