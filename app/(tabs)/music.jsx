import React, {useEffect, useState,} from "react";
import {Image, ScrollView, StyleSheet, Text, View, TouchableOpacity} from "react-native";
import {Appbar} from "react-native-paper";
import Storage, {getItem} from "@/config/Storage"
import {useUserGrantDirStore, useMusicLibStore} from "@/config/ZustandStore";
import {useRouter} from "expo-router";


export default function MusicLibrary() {
  const [userHasGrantLib, setUserGrantLib] = useState(null);

  const router = useRouter();

  const setParamsStore = (params) => {
    useMusicLibStore.getState().setMusicLib(params)
  }


  useEffect(() => {
    getUserGrantDirs()
  }, [])

  const getUserGrantDirs = async () => {
    try {
      const userGrantDirArr = await getItem(Storage.USER_PICK_DIR);
      console.log("MusicLibrary Storage: ", userGrantDirArr)
      if (userGrantDirArr != null) {
        setUserGrantLib(JSON.parse(userGrantDirArr))
      }
    } catch (e) {
      console.log(e)
    }
  };
  const storeUserHasGrantLib = useUserGrantDirStore((state) => state.useUserGrantDir);

  const renderData = storeUserHasGrantLib != null ? storeUserHasGrantLib : userHasGrantLib

  console.log("MusicLibrary useUserGrantDirStore", storeUserHasGrantLib)
  return (
      <>
        <Header/>
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
          {renderData && renderData.length > 0 ?
              <>{
                renderData.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.boxContainer}
                                      onPress={() => {
                                        router.push("/musicList")
                                        setParamsStore(item)
                                      }}>
                      <Image
                          resizeMode="contain"
                          style={styles.boxImage}
                          source={require("../../assets/images/react-logo.png")}
                      />
                      <View style={styles.boxBottomContainer}>
                        <Text>{item.name}</Text>
                        <View style={styles.boxBottomTextContainer}>
                          {/*<Text>8 Music</Text>*/}
                          {/*<Text>06:55:02</Text>*/}
                        </View>
                      </View>
                    </TouchableOpacity>
                ))}
              </>
              :
              <>
                <Text>Empty</Text>
              </>
          }
        </ScrollView>
      </>
  );
};

const Header = () => (
    <Appbar.Header style={styles.header}>
      <Appbar.Action icon="plus" onPress={() => {
      }}/>
    </Appbar.Header>
);

const styles = StyleSheet.create({
  header: {
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    backgroundColor: "#fffbff",
  },
  contentContainer: {
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "space-start",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  boxContainer: {
    // backgroundColor: "red",
    width: "50%",
    height: 180,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  boxBottomContainer: {
    // backgroundColor: "pink",
    width: "100%",
    height: 50,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
  },
  boxBottomTextContainer: {
    // backgroundColor: "blue",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  boxImage: {
    height: 120,
    width: "90%",
    borderRadius: 20,
    // backgroundColor: "red",
  },
});
