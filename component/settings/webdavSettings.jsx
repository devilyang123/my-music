import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, Snackbar, ActivityIndicator, MD2Colors } from "react-native-paper";
import { createClient, AuthType } from "webdav/react-native";

export default function WebdavSettings() {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [snackbarIsVisible, setSnackbarIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [webdavServer, setWebdavServer] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingState, setLoadingState] = useState(false);

  // webdav test
  const webdavTestConnect = async () => {
    console.log(`Settings WebdavTestConnect start, webdavServer: ${webdavServer}, username: ${username}, password: ${password}`);
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
      const directoryItems = await client.getDirectoryContents("/");
      // console.log(directoryItems);

      setLoadingState(false);

      setErrorMessage("Connect Succeed");
      setSnackbarIsVisible(true);
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
  };

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
            defaultValue="http://"
          />
          <TextInput label="username" placeholder="please enter your username" onChangeText={(text) => setUsername(text)} />
          <TextInput
            label="password"
            secureTextEntry={secureTextEntry}
            placeholder="please enter your password"
            right={<TextInput.Icon onPress={() => setSecureTextEntry(!secureTextEntry)} icon="eye" />}
            onChangeText={(text) => setPassword(text)}
          />
        </View>
        <View style={styles.addFolderBtnContainer}>
          <Button mode="text">Save Server</Button>
          <Button mode="text" onPress={() => webdavTestConnect()}>
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
            duration={30000}
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
