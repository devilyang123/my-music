import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar } from "react-native-paper";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.boxContainer}>
          <Image
            resizeMode="contain"
            style={styles.boxImage}
            source={require("../../assets/images/react-logo.png")}
          />
          <View style={styles.boxBottomContainer}>
            <Text>BookishEnglish</Text>
            <View style={styles.boxBottomTextContainer}>
              <Text>8 Music</Text>
              <Text>06:55:02</Text>
            </View>
          </View>
        </View>
        <View style={styles.boxContainer}>
          <Image
            resizeMode="contain"
            style={styles.boxImage}
            source={require("../../assets/images/react-logo.png")}
          />
          <View style={styles.boxBottomContainer}>
            <Text>BookishEnglish</Text>
            <View style={styles.boxBottomTextContainer}>
              <Text>8 Music</Text>
              <Text>06:55:02</Text>
            </View>
          </View>
        </View>
        <View style={styles.boxContainer}>
          <Image
            resizeMode="contain"
            style={styles.boxImage}
            source={require("../../assets/images/react-logo.png")}
          />
          <View style={styles.boxBottomContainer}>
            <Text>BookishEnglish</Text>
            <View style={styles.boxBottomTextContainer}>
              <Text>8 Music</Text>
              <Text>06:55:02</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const Header = () => (
  <Appbar.Header style={styles.header}>
    <Appbar.Action icon="plus" onPress={() => {}} />
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
    flexGrow: 1, // 强制内容容器扩展到 ScrollView 高度
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
    backgroundColor: "red",
    height: 120,
    width: "90%",
    borderRadius: 20,
  },
});
