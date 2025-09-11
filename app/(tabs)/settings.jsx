import React, {useEffect, useState} from "react";
import {StyleSheet, View, } from "react-native";
import {Appbar, Button, Divider, IconButton, Text} from "react-native-paper";
import Storage, {getItem, removeItem, setItem} from "@/config/Storage";
import {useUserGrantDirStore} from "@/config/ZustandStore";
import * as ScopedStorage from "react-native-scoped-storage"
import Constants from 'expo-constants';


const Settings = () => {

  const [userPickDirs, setUserPickDir] = useState(null);

  useEffect(() => {
    getUserGrantDirs()
  }, []);


  const getUserGrantDirs = async () => {
    console.log("Settings GetUserGrantDirs start")
    try {
      const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
      console.log("Settings GetUserGrantDirs from cache: ", userGrantDirArr)
      if (userGrantDirArr != null) {
        setUserPickDir(JSON.parse(userGrantDirArr))
        useUserGrantDirStore.getState().setUserGrantDir(JSON.parse(userGrantDirArr))
      }
    } catch (err) {
      console.log("Settings GetUserGrantDirs err: ", err)
    }
  };

  // let user grant dir
  const userPickDirectory = async () => {
    console.log("Settings UserPickDirectory start")
    try {
      const userGrantDir = await ScopedStorage.openDocumentTree(true)
      if (userGrantDir == null){
        console.log("Settings UserPickDirectory grant fail")
        return
      }
      // grant success
      console.log("Settings UserPickDirectory grant success")
      if (userPickDirs == null) {
        // first grant
        console.log("Settings UserPickDirectory first grant")
        const userPickDirArr = [userGrantDir]
        await setItem(Storage.USER_PICK_DIR, userPickDirArr)
        await getUserGrantDirs()
      } else {
        // need to valid grant dir exists
        console.log("Settings UserPickDirectory valid grant dir exists")
        let index = userPickDirs.findIndex(item =>  item.uri === userGrantDir.uri)
        if (index === -1) {
          // not exists
          console.log("Settings UserPickDirectory valid grant dir not exists")
          const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
          if (userGrantDirArr != null){
            const userGrantDirArrObj = JSON.parse(userGrantDirArr)
            userGrantDirArrObj.push(userGrantDir)
            await setItem(Storage.USER_PICK_DIR, userGrantDirArrObj)
            await getUserGrantDirs()
          }
        }
      }
    }catch (err){
      console.log("Settings UserPickDirectory err: ", err)
    }
  };

  // remove all user grant dir
  const removeAllGrantDirs = async () => {
    console.log("Settings RemoveAllGrantDirs start")
    try {
      await removeItem(Storage.USER_PICK_DIR)
      useUserGrantDirStore.getState().removeUserGrantDir()
      setUserPickDir(null)
    } catch (err) {
      console.log("Settings RemoveAllGrantDirs err: ", err)
    }
  }

  const removeOneGrantDir = async (uri) => {
    console.log("Settings RemoveOneGrantDir start uri:", uri)
    try {
      if (uri){
        const removedFilterDirs = userPickDirs.filter((item) => item.uri !== uri);
        console.log("Settings RemoveOneGrantDir start updatedDirs:", removedFilterDirs)
        setUserPickDir(removedFilterDirs)

        // update cache
        await setItem(Storage.USER_PICK_DIR, removedFilterDirs)

        // update store
        useUserGrantDirStore.getState().setUserGrantDir(removedFilterDirs)
      }
    }catch (err){
      console.log("Settings RemoveOneGrantDir err: ", err)
    }
  }

  return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Settings" />
        </Appbar.Header>
        <Divider/>
        <View style={styles.settingTitleContainer}>
          <Text style={styles.settingTitle}>Library Folders</Text>
        </View>
        <View style={styles.settingItemContainer}>
          {userPickDirs && userPickDirs.length > 0 ?
              <>
                {userPickDirs.map((item, index) =>(
                    <View key= {index} style={styles.libraryFolderItemContainer}>
                      <View style={styles.libraryFolderItemLeftContainer}>
                        <IconButton icon="folder"/>
                        <Text>{item.name}</Text>
                      </View>
                      <IconButton icon="delete" onPress={() => removeOneGrantDir(item.uri)}/>
                    </View>
                ))}
                <View style={styles.addFolderBtnContainer}>
                  <Button mode="text" onPress={userPickDirectory}>
                    Add Folder
                  </Button>
                  <Button mode="text" onPress={removeAllGrantDirs}>
                    Remove All
                  </Button>
                </View>
              </>
              :
              <>
                <View style={[styles.libraryFolderItemContainer, {justifyContent: "center"}]}>
                  <Text>Empty</Text>
                </View>
                <Button mode="text" onPress={userPickDirectory}>
                  Add Folder
                </Button>
              </>
          }
        </View>

        <View style={styles.settingTitleContainer}>
          <Text style={styles.settingTitle}>App Info</Text>
        </View>
        <View style={styles.settingItemContainer}>
          <View style={[styles.libraryFolderItemContainer, {justifyContent: "space-around", }]}>
            <Text>App Version</Text>
            <Text>{Constants.expoConfig.version}</Text>
          </View>
        </View>
      </>
  );
};

export default Settings;

const styles = StyleSheet.create({
  settingTitleContainer:{
    flexDirection:"row",
    // flex: 1,
    height: 30,
    width: 120,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "flex-start",
    alignItems:"center",
    // backgroundColor: "#fffbff",
    // backgroundColor:"red"
  },
  settingTitle:{
    fontSize: 17
  },
  settingItemContainer: {
    flexDirection:"column",
    alignItems:"center",
    // backgroundColor:"pink",
    // backgroundColor: "#fffbff",
  },
  libraryFolderItemContainer:{
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems:"center",
    borderRadius: 10,
    height: 35,
    // backgroundColor:"blue",
    backgroundColor: "#fffbff",
    width:"88%"
  },
  libraryFolderItemLeftContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent:"flex-start",
    alignItems:"center",
    height:"100%",
    // backgroundColor:"green"
  },
  addFolderBtnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  }
});
