import {MaterialCommunityIcons} from "@expo/vector-icons";
import {Tabs} from "expo-router";

export default function TabLayout() {
  return (
      <Tabs
          screenOptions={{
            headerShown: false,
          }}
      >
        <Tabs.Screen
            name="index"
            options={{
              title: "",
              tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons name="album" color={color} size={28}/>
              ),
            }}
        />
        <Tabs.Screen
            name="music"
            options={{
              title: "",
              tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                      name="folder-music-outline"
                      color={color}
                      size={28}
                  />
              ),
            }}
        />
        <Tabs.Screen
            name="settings"
            options={{
              title: "",
              tabBarIcon: ({color, size}) => (
                  <MaterialCommunityIcons
                      name="cog-outline"
                      color={color}
                      size={28}
                  />
              ),
            }}
        />
      </Tabs>
  );
}
