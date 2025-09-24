import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Divider, IconButton, Text } from "react-native-paper";
import Storage, { getItem, removeItem, setItem } from "@/config/Storage";
import { useUserGrantDirStore } from "@/config/ZustandStore";
import * as ScopedStorage from "react-native-scoped-storage";
import Constants from "expo-constants";
import WebdavSettings from "@/component/settings/webdavSettings";

const Settings = () => {
  const [userGrantDirs, setUserGrantDirs] = useState(null);

  useEffect(() => {
    getUserGrantDirs();
  }, []);

  const getUserGrantDirs = async () => {
    console.log("Settings GetUserGrantDirs start");
    try {
      const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
      console.log("Settings GetUserGrantDirs from cache: ", userGrantDirArr);
      if (userGrantDirArr != null) {
        setUserGrantDirs(JSON.parse(userGrantDirArr));
        useUserGrantDirStore.getState().setUserGrantDir(JSON.parse(userGrantDirArr));
      }
    } catch (err) {
      console.log("Settings GetUserGrantDirs err: ", err);
    }
  };

  // let user grant dir
  const userPickDirectory = async (dirSourceType, webdavLibrary) => {
    console.log("Settings UserPickDirectory start");

    try {
      let userGrantDir;
      if (dirSourceType === "local") {
        userGrantDir = await ScopedStorage.openDocumentTree(true);
      } else {
        // webdav
        userGrantDir = webdavLibrary;
      }
      if (userGrantDir == null) {
        console.log("Settings UserPickDirectory grant fail");
        return;
      }
      if (dirSourceType === "local") {
        userGrantDir.libraryType = "local";
      }
      // grant success
      console.log("Settings UserPickDirectory grant success");
      if (userGrantDirs == null) {
        // first grant
        console.log("Settings UserPickDirectory first grant");
        const userPickDirArr = [userGrantDir];
        await setItem(Storage.USER_PICK_DIR, userPickDirArr);
        await getUserGrantDirs();
      } else {
        // need to valid grant dir exists
        console.log("Settings UserPickDirectory valid grant dir exists");
        let index = userGrantDirs.findIndex((item) => item.uri === userGrantDir.uri);
        if (index === -1) {
          // not exists
          console.log("Settings UserPickDirectory valid grant dir not exists");
          const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
          if (userGrantDirArr != null) {
            const userGrantDirArrObj = JSON.parse(userGrantDirArr);
            userGrantDirArrObj.push(userGrantDir);
            await setItem(Storage.USER_PICK_DIR, userGrantDirArrObj);
            await getUserGrantDirs();
          }
        }
      }
    } catch (err) {
      console.log("Settings UserPickDirectory err: ", err);
    }
  };

  // remove all user grant dir
  const removeAllGrantDirs = async () => {
    console.log("Settings RemoveAllGrantDirs start");
    try {
      await removeItem(Storage.USER_PICK_DIR);
      useUserGrantDirStore.getState().removeUserGrantDir();
      setUserGrantDirs(null);
    } catch (err) {
      console.log("Settings RemoveAllGrantDirs err: ", err);
    }
  };

  const removeOneGrantDir = async (uri) => {
    console.log("Settings RemoveOneGrantDir start uri:", uri);
    try {
      if (uri) {
        const removedFilterDirs = userGrantDirs.filter((item) => item.uri !== uri);
        console.log("Settings RemoveOneGrantDir start updatedDirs:", removedFilterDirs);
        setUserGrantDirs(removedFilterDirs);

        // update cache
        await setItem(Storage.USER_PICK_DIR, removedFilterDirs);

        // update store
        useUserGrantDirStore.getState().setUserGrantDir(removedFilterDirs);
      }
    } catch (err) {
      console.log("Settings RemoveOneGrantDir err: ", err);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <Divider />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.settingTitleContainer}>
          <Text style={styles.settingTitle}>Library Folders</Text>
        </View>
        <View style={styles.settingItemContainer}>
          {userGrantDirs && userGrantDirs.length > 0 ? (
            <>
              {userGrantDirs.map((item, index) => (
                <View key={index} style={styles.libraryFolderItemContainer}>
                  <View style={styles.libraryFolderItemLeftContainer}>
                    <IconButton icon={item.libraryType === "local" ? "folder" : "web"} />
                    <Text numberOfLines={1} ellipsizeMode="tail">
                      {item.name}
                    </Text>
                  </View>
                  <IconButton icon="delete" onPress={() => removeOneGrantDir(item.uri)} />
                </View>
              ))}
              <View style={styles.addFolderBtnContainer}>
                <Button mode="text" onPress={() => userPickDirectory("local")}>
                  Add Folder
                </Button>
                <Button mode="text" onPress={removeAllGrantDirs}>
                  Remove All
                </Button>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.libraryFolderItemContainer, { justifyContent: "center" }]}>
                <Text>Empty</Text>
              </View>
              <Button mode="text" onPress={() => userPickDirectory("local")}>
                Add Folder
              </Button>
            </>
          )}
        </View>

        <WebdavSettings
          onAddWebdavFolder={(dirSourceType, webdavLibrary) => userPickDirectory(dirSourceType, webdavLibrary)}
        />

        <View style={styles.settingTitleContainer}>
          <Text style={styles.settingTitle}>App Info</Text>
        </View>
        <View style={styles.settingItemContainer}>
          <View style={[styles.libraryFolderItemContainer, { justifyContent: "space-around" }]}>
            <Text>App Version</Text>
            <Text>{Constants.expoConfig.version}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fffbff",
  },
  contentContainer: {
    width: "95%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
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
  settingItemContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "90%",
    marginLeft: 20,
    // backgroundColor: "pink",
    // backgroundColor: "#fffbff",
  },
  libraryFolderItemContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 10,
    height: 35,
    width: "100%",
    // width: "88%",
    backgroundColor: "#fffbff",
    // backgroundColor: "blue",
  },
  libraryFolderItemLeftContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: "100%",
    // backgroundColor: "green",
  },
  addFolderBtnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
