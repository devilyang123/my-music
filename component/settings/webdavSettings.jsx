import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Button,
  Text,
  TextInput,
  Snackbar,
  ActivityIndicator,
  MD2Colors,
  Dialog,
  Portal,
  List,
} from "react-native-paper";
import { createClient, AuthType } from "webdav/react-native";
import TrackPlayer from "react-native-track-player";
import * as FileSystem from "expo-file-system";
import { audioMimeTypes } from "@/config/constant";
import Storage, { getItem, setItem, USER_SETTINGS, removeItem } from "@/config/Storage";

let webdavClient = null;

export default function WebdavSettings() {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [snackbarIsVisible, setSnackbarIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [webdavServer, setWebdavServer] = useState("http://");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingState, setLoadingState] = useState(false);

  const [webdavFoldersVisible, setWebdavFoldersVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [entries, setEntries] = useState([]);
  const [history, setHistory] = useState([]);

  // init webdav
  const initWebdavClient = async (webdavServer, username, password) => {
    console.log(
      `Settings initWebdavClient start, webdavServer: ${webdavServer}, username: ${username}, password: ${password}`
    );
    if (webdavClient) {
      console.log(
        `Settings initWebdavClient , webdavClient already init, webdavServer: ${webdavServer}, username: ${username}, password: ${password}`
      );
    } else {
      setLoadingState(true);
      try {
        // validation param
        if (webdavServer === "") {
          setLoadingState(false);
          setErrorMessage("Error, please enter your webdav server address");
          setSnackbarIsVisible(true);
          return;
        } else if (username === "" || password === "") {
          setLoadingState(false);
          setErrorMessage("Error, please enter your username or password");
          setSnackbarIsVisible(true);
          return;
        }
        const client = await createClient(webdavServer, {
          authType: AuthType.auto,
          username: username,
          password: password,
        });
        // console.log(client);
        const rootDirectoryItems = await client.getDirectoryContents("/");
        console.log("Settings initWebdavClient, success, rootDirectoryItems: ", rootDirectoryItems);

        setLoadingState(false);
        setErrorMessage("Connect Succeed");
        setSnackbarIsVisible(true);
        webdavClient = client;
      } catch (err) {
        console.log("Unknown error, err: ", err);
        setLoadingState(false);
        if (err?.message?.includes("401")) {
          setErrorMessage("Authentication failed: Invalid username or password.");
          setSnackbarIsVisible(true);
        } else if (err?.message?.includes("429")) {
          setErrorMessage("Request error. Please check your webdav server address.");
          setSnackbarIsVisible(true);
        } else if (err?.message?.includes("Network request failed")) {
          setErrorMessage("Request error. Please check your webdav server address.");
          setSnackbarIsVisible(true);
        } else {
          setErrorMessage("Unknown error");
          setSnackbarIsVisible(true);
        }
      }
    }
  };

  useEffect(() => {
    if (webdavClient) {
      loadDirectory(currentPath);
    }
  }, [currentPath]);

  const loadDirectory = async (path) => {
    try {
      const list = await webdavClient.getDirectoryContents(path);
      console.log(list);
      // Define a list of common audio MIME types.
      setEntries(
        list.filter((item) => {
          return item.type === "directory" || audioMimeTypes.has(item.mime);
        })
      );
    } catch (error) {
      console.error("Error loading directory:", error);
    }
  };

  const showServerContent = async () => {
    if (webdavClient) {
      await loadDirectory(currentPath);
      setWebdavFoldersVisible(true);
    } else {
      setErrorMessage("Cannot connect server");
      setSnackbarIsVisible(true);
    }
  };

  const enterDirectory = async (item) => {
    if (item.type === "directory") {
      setHistory((prev) => [...prev, currentPath]);
      setCurrentPath(item.filename);
    }
    if (item.type === "file" && item.mime.includes("audio")) {
      // local cache
      const localFile = FileSystem.cacheDirectory + encodeURI(item.basename);
      console.log("localFile: ", localFile);

      // check file exists
      const fileInfo = await FileSystem.getInfoAsync(localFile);
      let fileUri = localFile;
      if (fileInfo.exists) {
        console.log("File already cached:", localFile);
      } else {
        // remote URL
        const remoteUrl = webdavServer + encodeURI(item.filename);
        console.log("remoteUrl: ", remoteUrl);
        // download
        const result = await FileSystem.downloadAsync(remoteUrl, localFile, {
          headers: {
            Authorization: "Basic " + btoa(`${username}:${password}`),
          },
        });
        fileUri = result.uri;
        console.log("Downloaded to", result.uri);
      }
      console.log("fileUri: ", fileUri);
      try {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: item.filename,
          url: fileUri,
          title: item.basename,
        });
        await TrackPlayer.play();
      } catch (err) {
        console.log("MusicList player err:", err);
      }
    }
  };

  // go back
  const goBack = () => {
    if (history.length > 0) {
      const prevPath = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentPath(prevPath);
    }
  };

  const saveWebdavServerInfo = async () => {
    console.log("WebdavSettings saveWebdavServerInfo start");
    // await removeItem(Storage.USER_SETTINGS_KEY);
    const userSettings = await getItem(Storage.USER_SETTINGS_KEY);
    let webdavInfo = {
      serverUrl: webdavServer,
      username: username,
      password: password,
    };
    if (userSettings) {
      console.log("WebdavSettings saveWebdavServerInfo, userSettings exists, last userSettings: ", userSettings);
      // update
      let userSettingObj = JSON.parse(userSettings);
      userSettingObj.webdavInfo = webdavInfo;
      await setItem(Storage.USER_SETTINGS_KEY, userSettingObj);
      console.log(
        "WebdavSettings saveWebdavServerInfo, userSettings exists, new userSettings: ",
        JSON.stringify(userSettingObj)
      );
    } else {
      // not exist
      console.log("WebdavSettings saveWebdavServerInfo, userSettings not exists");
      USER_SETTINGS.webdavInfo = webdavInfo;
      await setItem(Storage.USER_SETTINGS_KEY, USER_SETTINGS);
    }
    setErrorMessage("Save Succeed");
    setSnackbarIsVisible(true);

    // need update webdavClient
    webdavClient = null;
    await initWebdavClient(webdavInfo.serverUrl, webdavInfo.username, webdavInfo.password);
  };

  const initUserSettings = async () => {
    console.log("WebdavSettings initUserSettings start");
    const userSettings = await getItem(Storage.USER_SETTINGS_KEY);
    if (userSettings) {
      console.log("WebdavSettings initUserSettings, exists, userSettings: ", userSettings);
      const userSettingObj = JSON.parse(userSettings);
      setWebdavServer(userSettingObj.webdavInfo.serverUrl);
      setUsername(userSettingObj.webdavInfo.username);
      setPassword(userSettingObj.webdavInfo.password);
      await initWebdavClient(
        userSettingObj.webdavInfo.serverUrl,
        userSettingObj.webdavInfo.username,
        userSettingObj.webdavInfo.password
      );
    }
  };

  useEffect(() => {
    initUserSettings();
  }, []);

  return (
    <>
      <View style={styles.settingTitleContainer}>
        <Text style={styles.settingTitle}>Webdav Server</Text>
      </View>
      <View style={styles.webdavSettingContainer}>
        <View>
          <TextInput
            label="webdav server address"
            placeholder="please enter your webdav server address"
            onChangeText={(text) => setWebdavServer(text)}
            value={webdavServer}
          />
          <TextInput
            label="username"
            placeholder="please enter your username"
            onChangeText={(text) => setUsername(text)}
            value={username}
          />
          <TextInput
            label="password"
            secureTextEntry={secureTextEntry}
            placeholder="please enter your password"
            right={<TextInput.Icon onPress={() => setSecureTextEntry(!secureTextEntry)} icon="eye" />}
            onChangeText={(text) => setPassword(text)}
            value={password}
          />
        </View>
        <View style={styles.addFolderBtnContainer}>
          <Button mode="text" onPress={() => saveWebdavServerInfo()}>
            Save Server
          </Button>
          <Button mode="text" onPress={() => initWebdavClient(webdavServer, username, password)}>
            Test Connect
          </Button>
        </View>
        {loadingState ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size={30} color={MD2Colors.cyanA100} />
          </View>
        ) : (
          ""
        )}
        <View style={styles.snackbarContainer}>
          <Snackbar
            duration={6000}
            visible={snackbarIsVisible}
            onDismiss={() => setSnackbarIsVisible(false)}
            action={{
              label: "Got it!",
              onPress: () => {
                setSnackbarIsVisible(false);
              },
            }}
          >
            {errorMessage}
          </Snackbar>
        </View>
      </View>
      <Button onPress={() => showServerContent()}>Show Folders</Button>

      <Portal>
        <Dialog
          visible={webdavFoldersVisible}
          onDismiss={() => setWebdavFoldersVisible(false)}
          style={{ maxHeight: "80%" }}
        >
          <Dialog.Title>Folders</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {history.length > 0 && (
                <List.Item title="back" left={(props) => <List.Icon {...props} icon="arrow-left" />} onPress={goBack} />
              )}
              {entries.map((item, idx) => (
                <List.Item
                  key={idx}
                  title={item.basename}
                  left={(props) => <List.Icon {...props} icon={item.mime?.includes("audio") ? "music" : "folder"} />}
                  onPress={() => enterDirectory(item)}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setWebdavFoldersVisible(false)}>Cancel</Button>
            <Button>Add To Library</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  settingTitleContainer: {
    flexDirection: "row",
    // flex: 1,
    height: 30,
    width: "95%",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    // backgroundColor: "#fffbff",
    // backgroundColor: "red",
  },
  settingTitle: {
    fontSize: 17,
  },
  addFolderBtnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  webdavSettingContainer: {
    width: "90%",
    marginLeft: 20,
    borderRadius: 10,
    // marginHorizontal: 20,
    // backgroundColor: "red",
  },
  snackbarContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
