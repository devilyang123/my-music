import React, {useEffect, useState} from "react";
import {ScrollView, StyleSheet, TouchableOpacity} from "react-native";
import {Appbar, List, Text} from "react-native-paper";
import * as ScopedStorage from "react-native-scoped-storage"
import {useMusicLibStore} from "@/config/ZustandStore";
import TrackPlayer from 'react-native-track-player';


const player = async (musicListState, index) => {
  console.log('MusicList player:', musicListState, index);
  let tackArr = musicListState.map(item => {
    return {
      id: item.uri,
      url: item.uri,
      title: item.name,
    }
  })
  await TrackPlayer.setQueue(tackArr)
  await TrackPlayer.skip(index)
  await TrackPlayer.play()

  // let trackIndex = await TrackPlayer.getActiveTrackIndex();
  // console.log("currentTrackIndex: ", trackIndex);
  //
  // let trackObject = await TrackPlayer.getTrack(trackIndex);
  // console.log("currentMusic: ", trackObject);
  //
  // const progress = await TrackPlayer.getProgress();
  // console.log("progress:", progress);
  //
  // let playBackState = await TrackPlayer.getPlaybackState()
  // console.log("playBackState:", playBackState)
  //
  // let queue = await TrackPlayer.getQueue()
  // console.log("queue:", queue);
  //
  // let rate = await TrackPlayer.getRate()
  // console.log("rate:", rate);
  //
  // let repeatMode = await TrackPlayer.getRepeatMode()
  // console.log("repeatMode:", repeatMode);
}


export default function MusicList() {

  const params = useMusicLibStore((state) => state.musicLib);
  console.log('MusicList params:', params);

  const [musicListState, setMusicList] = useState([]);

  useEffect(() => {
    loadMusicList()
  }, [params])

  console.log('MusicList musicListState: ', musicListState);

  const loadMusicList = async () => {
    console.log('MusicList loadMusicList');
    try {
      if (params != null) {
        const musicList = await ScopedStorage.listFiles(params.uri);
        const filterData = filterAudioFiles(musicList)
        setMusicList(filterData)
      } else {
        console.log('MusicList err, params is empty');
      }
    } catch (err) {
      console.log('MusicList err:', err);
    }
  }

  // filter audio files
  const filterAudioFiles = (files) => {
    if (!Array.isArray(files)) {
      console.log("Input must be an array.");
      return [];
    }
    // Define a list of common audio MIME types.
    const audioMimeTypes = new Set([
      'audio/mpeg', // .mp3
      'audio/ogg',  // .ogg
      'audio/wav',  // .wav
      'audio/aac',  // .aac
      'audio/flac', // .flac
      'audio/mp4',  // .m4a
    ]);
    return files.filter(file => {
      // Check if the object is a file and its MIME type is in our set.
      return file.type === 'file' && audioMimeTypes.has(file.mime);
    });
  };

  return (
      <>
        <Appbar.Header/>
        {musicListState && musicListState.length === 0 ?
            <Text>No music files found.</Text>
            :
            <ScrollView style={styles.container}
                        contentContainerStyle={styles.contentContainer}>
              {musicListState.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => player(musicListState, index)}>
                    <List.Item
                        title={item.name}
                        left={props => <List.Icon {...props} icon="music"/>}
                        titleNumberOfLines={2}
                        titleStyle={{fontSize: 14,textAlign:"left"}}
                        titleEllipsizeMode="clip"
                    />
                  </TouchableOpacity>
              ))}
            </ScrollView>}
      </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#fffbff",
  },
  contentContainer: {
    flexDirection:"column",
    width: "96%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    // backgroundColor:"red"
  },
});