import AsyncStorage from "@react-native-async-storage/async-storage";

export const getItem = async (key) => {
  return await AsyncStorage.getItem(key);
};

export const setItem = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = async (key) => {
  await AsyncStorage.removeItem(key);
};

const StorageKeyConfig = {
  USER_PICK_DIR: "USER_PICK_DIR",
  USER_SETTINGS_KEY: "USER_SETTINGS",
};

export const USER_SETTINGS = {
  webdavInfo: {
    serverUrl: "",
    username: "",
    password: "",
  },
};

export default StorageKeyConfig;
