import React, {useEffect, useState} from "react";
import {StyleSheet, View} from "react-native";
import {Appbar, List, Button,} from "react-native-paper";
import Storage, {getItem, removeItem, setItem} from "@/config/Storage";
import {useUserGrantDirStore} from "@/config/ZustandStore";
import * as ScopedStorage from "react-native-scoped-storage"


const Settings = () => {

  const [userPickDirs, setUserPickDir] = useState(null);

  useEffect(() => {
    getUserGrantDirs()
  }, []);


  const getUserGrantDirs = async () => {
    try {
      const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
      console.log("Settings Storage: ", userGrantDirArr)
      if (userGrantDirArr != null) {
        setUserPickDir(JSON.parse(userGrantDirArr))
        useUserGrantDirStore.getState().setUserGrantDir(JSON.parse(userGrantDirArr))
        console.log("Settings useUserGrantDirStore", useUserGrantDirStore.getState().useUserGrantDir)
      }
    } catch (e) {
      console.log(e)
    }
  };

  // remove all user grant dir
  const removeAllGrantDirs = async () => {
    try {
      await removeItem(Storage.USER_PICK_DIR)
      useUserGrantDirStore.getState().removeUserGrantDir()
      setUserPickDir(null)
    } catch (e) {
      console.log(e)
    }
  }


  // let user grant dir
  const userPickDirectory = async () => {
    const userGrantDir = await ScopedStorage.openDocumentTree(true)
    if (userGrantDir != null) {
      // grant success
      if (userPickDirs == null) {
        // first grant
        const userPickDirArr = [userGrantDir]
        await setItem(Storage.USER_PICK_DIR, userPickDirArr)
        getUserGrantDirs()
      } else {
        // todo need to valid grant dir exists
        const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
        const userGrantDirArrObj = JSON.parse(userGrantDirArr)
        userGrantDirArrObj.push(userGrantDir)
        await setItem(Storage.USER_PICK_DIR, userGrantDirArrObj)
        getUserGrantDirs()
      }
    }
  };


  return (
      <>
        <Appbar.Header/>
        <View style={styles.container}>
          {userPickDirs ?
              <>
                <List.Section>
                  <List.Subheader>Library Folders</List.Subheader>
                  {userPickDirs.map((item, index) => (
                      <List.Item
                          key={index}
                          title={item.name}
                          left={props => <List.Icon {...props} icon="folder"/>}></List.Item>
                  ))}
                  <View style={styles.addFolderBtnContainer}>
                    <Button mode="text" onPress={userPickDirectory}>
                      Add Folder
                    </Button>
                    <Button mode="text" onPress={removeAllGrantDirs}>
                      Remove All
                    </Button>
                  </View>
                </List.Section>

              </>
              :
              <>
                <List.Section>
                  <List.Subheader>Library Folders</List.Subheader>
                  <Button mode="text" onPress={userPickDirectory}>
                    Add Folder
                  </Button>
                </List.Section>
              </>
          }
        </View>
      </>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffbff",
  },
  addFolderBtnContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  }
});
