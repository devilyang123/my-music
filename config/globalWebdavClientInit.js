import Storage, { getItem } from "./Storage";
import { createClient, AuthType } from "webdav/react-native";

let webdavClient = null;

export function setWebdavClient(client) {
  webdavClient = client;
}

export const getWebdavClient = () => {
  return webdavClient;
};

// init webdav
const initWebdavClient = async (webdavServer, username, password) => {
  console.log(
    `Settings GlobalWebdavClientInit start, webdavServer: ${webdavServer}, username: ${username}, password: ${password}`
  );
  if (webdavClient) {
    console.log(
      `Settings GlobalWebdavClientInit , webdavClient already init, webdavServer: ${webdavServer}, username: ${username}, password: ${password}`
    );
  } else {
    try {
      const client = await createClient(webdavServer, {
        authType: AuthType.auto,
        username: username,
        password: password,
      });
      const rootDirectoryItems = await client.getDirectoryContents("/");
      console.log("GlobalWebdavClientInit, success, rootDirectoryItems: ", rootDirectoryItems);
      webdavClient = client;
    } catch (err) {
      console.log("GlobalWebdavClientInit, err: ", err);
    }
  }
};

(async () => {
  console.log("GlobalWebdavClientInit initUserSettings start");
  const userSettings = await getItem(Storage.USER_SETTINGS_KEY);
  if (userSettings) {
    console.log("GlobalWebdavClientInit initUserSettings, exists, userSettings: ", userSettings);
    const userSettingObj = JSON.parse(userSettings);
    await initWebdavClient(
      userSettingObj.webdavInfo.serverUrl,
      userSettingObj.webdavInfo.username,
      userSettingObj.webdavInfo.password
    );
  }
})();
