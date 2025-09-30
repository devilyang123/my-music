import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Appbar, Text, Button, Divider, ActivityIndicator, MD2Colors } from "react-native-paper";
import * as ScopedStorage from "react-native-scoped-storage";
import { useMusicLibStore, useMusicPlaySourceStore } from "@/config/ZustandStore";
import TrackPlayer from "react-native-track-player";
import Storage, { getItem, removeItem, setItem } from "@/config/Storage";
import { audioMimeTypes } from "@/config/constant";
import { getWebdavClient } from "@/config/globalWebdavClientInit";
import * as FileSystem from "expo-file-system";

const player = async (musicListState, index) => {
  console.log("MusicList player start:", index);
  try {
    let tackArr = musicListState.map((item) => {
      return {
        id: item.uri,
        url: item.uri,
        title: item.name,
      };
    });
    useMusicPlaySourceStore.getState().setMusicPlaySource(true);
    await TrackPlayer.setQueue(tackArr);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    useMusicPlaySourceStore.getState().setMusicPlaySource(false);
  } catch (err) {
    console.log("MusicList player err:", err);
  }
};

export default function MusicList() {
  const params = useMusicLibStore((state) => state.musicLib);
  console.log("MusicList start, params:", params);

  const [musicListState, setMusicListState] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadDataState, setLoadDateState] = useState(false);

  useEffect(() => {
    loadMusicList();
  }, [params]);

  useEffect(() => {
    setSelectedItem();
  }, [musicListState]);

  const loadMusicListFromWebdav = async () => {
    console.log("MusicList loadMusicListFromWebdav start");
    let webdavClient = getWebdavClient();
    if (!webdavClient) {
      console.log("MusicList loadMusicListFromWebdav webdavClient not initialized");
      return;
    }
    const musicList = await webdavClient.getDirectoryContents(params.uri);
    const convertList = musicList.map((item) => ({
      size: item.size,
      mime: item.mime,
      lastModified: Math.floor(new Date(item.lastmod).getTime()),
      name: item.basename,
      type: item.type,
      uri: item.filename,
    }));
    const filterData = filterAudioFiles(convertList);
    let downloadArr = [];
    for (const item of filterData) {
      const userSetting = JSON.parse(await getItem(Storage.USER_SETTINGS_KEY));

      // local cache
      const localFile = FileSystem.cacheDirectory + encodeURI(item.name);
      console.log("localFile: ", localFile);

      // check file exists
      const fileInfo = await FileSystem.getInfoAsync(localFile);
      let fileUri = localFile;

      if (fileInfo.exists) {
        console.log("File already cached:", localFile);
      } else {
        // remote URL
        const remoteUrl = userSetting.webdavInfo.serverUrl + encodeURI(item.uri);
        console.log("remoteUrl: ", remoteUrl);

        // download
        const result = await FileSystem.downloadAsync(remoteUrl, localFile, {
          headers: {
            Authorization: "Basic " + btoa(`${userSetting.webdavInfo.username}:${userSetting.webdavInfo.password}`),
          },
        });
        fileUri = result.uri;
        console.log("Downloaded to", result.uri);
      }
      item.uri = fileUri;
      downloadArr.push(item);
    }
    setMusicListState(downloadArr);
    // console.log("MusicList loadMusicList from webdav, downloadArr: ", downloadArr);
  };

  const loadMusicList = async () => {
    console.log("MusicList loadMusicList start");
    setLoadDateState(true);
    try {
      if (params != null) {
        if (params.libraryType === "local") {
          // get from cache
          const cacheMusicList = await getItem(params.uri);
          // console.log("MusicList loadMusicList from cache， cacheMusicList：", cacheMusicList);
          console.log("MusicList loadMusicList from cache， cacheMusicList");
          if (cacheMusicList == null) {
            console.log("MusicList loadMusicList from file system");
            // no cache
            const musicList = await ScopedStorage.listFiles(params.uri);
            const filterData = filterAudioFiles(musicList);
            setMusicListState(filterData);
            if (filterData.length > 0) {
              // set cache
              await setItem(params.uri, filterData);
            }
          } else {
            console.log("MusicList loadMusicList from cache");
            setMusicListState(JSON.parse(cacheMusicList));
          }
        }
        if (params.libraryType === "webdav") {
          await loadMusicListFromWebdav();
        }
      } else {
        console.log("MusicList loadMusicList err, params is empty");
      }
    } catch (err) {
      console.log("MusicList loadMusicList err:", err);
    } finally {
      setLoadDateState(false);
    }
  };

  const refreshMusicList = async () => {
    console.log("MusicList refreshMusicList start");
    try {
      // clear cache
      await removeItem(params.uri);
      // reload data
      await loadMusicList();
    } catch (err) {
      console.log("MusicList refreshMusicList err", err);
    }
  };

  const setSelectedItem = async () => {
    console.log("MusicList setSelectedItem start");
    try {
      const currentTrack = await TrackPlayer.getActiveTrack();
      if (currentTrack) {
        console.log("MusicList setSelectedItem currentTrackUri:", currentTrack.id);
        musicListState.forEach((item, index) => {
          if (currentTrack.id === item.uri) {
            console.log("MusicList setSelectedItem itemUri:", item.uri);
            setSelectedIndex(index);
          }
        });
      }
    } catch (err) {
      console.log("MusicList setSelectedItem err", err);
    }
  };

  // filter audio files
  const filterAudioFiles = (files) => {
    if (!Array.isArray(files)) {
      console.log("Input must be an array.");
      return [];
    }
    // Define a list of common audio MIME types.
    return files.filter((file) => {
      // Check if the object is a file and its MIME type is in our set.
      return file.type === "file" && audioMimeTypes.has(file.mime);
    });
  };

  return (
    <View style={styles.mainContainer}>
      <Appbar.Header style={styles.header}>
        <Appbar.Action icon="refresh" onPress={() => refreshMusicList()} />
      </Appbar.Header>
      <Divider />

      {musicListState && musicListState.length === 0 ? (
        loadDataState ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator animating={true} size={60} color={MD2Colors.cyanA100} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text>No Music Files Found</Text>
          </View>
        )
      ) : (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
          {musicListState.map((item, index) => {
            const isSelected = index === selectedIndex;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedIndex(index);
                  player(musicListState, index);
                }}
                style={[styles.musicItemContainer, isSelected && styles.selectedItem]}
              >
                <Button icon="music" compact />
                <View style={styles.nameContainer}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.nameStyle}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fffbff",
  },
  header: {
    justifyContent: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "column",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  musicItemContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    marginVertical: 4,
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: "#e2e4e3",
  },
  nameContainer: {
    width: "80%",
  },
  nameStyle: {
    fontSize: 16,
  },
});
