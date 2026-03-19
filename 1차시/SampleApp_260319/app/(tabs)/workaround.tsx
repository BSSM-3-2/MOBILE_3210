import { Image } from 'expo-image';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing} from '@/constants/theme';
import {useSafeAreaInsets} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WorkaroundScreen() {
    const inset = useSafeAreaInsets();

  return (
    <View style={[styles.contentContainer, {paddingTop: inset.top + 20}]}>
        <View style={styles.contentPadding}>
            <Text style={[styles.title, {
                borderColor: Colors.light.text
            }]}>같이 해보기</Text>
        </View>
        <View style={styles.gapMaker}>
            <View style={[styles.playgroundGap, styles.flexDirectionRow, styles.contentPadding]}>
                <Text>저는</Text>
                <Text>한줄짜리</Text>
                <Text>문장이에요</Text>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Image
                    source={{ uri: "https://picsum.photos/seed/sun/800/800" }}
                    style={styles.postImage}
                />
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    gapMaker: {
      gap: 24
    },
    contentPadding: {
        paddingHorizontal: 16
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    playgroundGap: {
        marginTop: Spacing.xxl,
        gap: Spacing.lg
    },
    flexDirectionRow: {
        flexDirection: 'row',
    },
    title: {
        fontSize: 24,
        paddingBottom: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
    },
    postImage: {
        width: SCREEN_WIDTH - 16,
        height: (SCREEN_WIDTH * 0.7),
        alignItems: 'center',
    },
});