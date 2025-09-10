import React, {useEffect, useState} from "react";
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Appbar, Text, Button} from "react-native-paper";
import * as ScopedStorage from "react-native-scoped-storage"
import {useMusicLibStore} from "@/config/ZustandStore";
import TrackPlayer from 'react-native-track-player';
import  {getItem, setItem } from "@/config/Storage";

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
}


export default function MusicList() {

  const params = useMusicLibStore((state) => state.musicLib);
  console.log('MusicList params:', params);

  const [musicListState, setMusicListState] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);


  useEffect(() => {
    loadMusicList();
  }, [params])

  useEffect(() => {
    setSelectedItem();
  }, [musicListState]);

  const loadMusicList = async () => {
    console.log('MusicList loadMusicList start');
    try {
      if (params != null) {
        // get from cache
        const cacheMusicList = await getItem(params.uri)
        if (cacheMusicList == null) {
          console.log('MusicList loadMusicList from file system');
          // no cache
          const musicList = await ScopedStorage.listFiles(params.uri);
          const filterData = filterAudioFiles(musicList)
          setMusicListState(filterData)
          if (filterData.length > 0){
            // set cache
            await setItem(params.uri, filterData)
          }
        }else {
          console.log('MusicList loadMusicList from cache');
          setMusicListState(JSON.parse(cacheMusicList))
        }
      } else {
        console.log('MusicList loadMusicList err, params is empty');
      }
    } catch (err) {
      console.log('MusicList loadMusicList err:', err);
    }
  }

  const setSelectedItem = async () => {
    const currentTrack = await TrackPlayer.getActiveTrack()
    if (currentTrack) {
      console.log('MusicList currentTrackUri:', currentTrack.id);
      musicListState.forEach((item, index) => {
        if (currentTrack.id === item.uri) {
          console.log('MusicList itemUri:', item.uri);
          setSelectedIndex(index)
        }
      })
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
        <Appbar.Header style={styles.header}>
          <Appbar.Action icon="refresh" onPress={() => {
          }}/>
        </Appbar.Header>
        {musicListState && musicListState.length === 0 ?
            <View style={styles.emptyContainer}>
              <Text>No music files found.</Text>
            </View>
            :
            <ScrollView style={styles.container}
                        contentContainerStyle={styles.contentContainer}>
              {musicListState.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSelectedIndex(index);
                          player(musicListState, index);
                        }}
                        style={[
                          styles.musicItemContainer,
                          isSelected && styles.selectedItem,
                        ]}
                    >
                      <Button icon="music" compact/>
                      <View style={styles.nameContainer}>
                        <Text
                            numberOfLines={3}
                            ellipsizeMode="tail"
                            style={styles.nameStyle}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                );
              })}
            </ScrollView>}
      </>
  )
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "flex-end",
  },
  emptyContainer:{
    flex: 1,
    backgroundColor: "#fffbff",
    justifyContent:"center",
    alignItems:"center"
  },
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#fffbff",
  },
  contentContainer: {
    flexDirection: "column",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor:"red"
  },
  musicItemContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    marginVertical: 4,
    borderRadius: 8,
    // backgroundColor: "#222",
  },
  selectedItem: {
    backgroundColor: "#e2e4e3",
  },
  nameContainer: {
    width: "85%",
    // backgroundColor:"pink"
  },
  nameStyle: {
    fontSize: 16,
  }
});