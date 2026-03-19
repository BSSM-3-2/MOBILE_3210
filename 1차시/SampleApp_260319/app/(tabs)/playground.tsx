import { Image } from 'expo-image';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AvatarSizes, Colors, FeedColors, FontSizes, Spacing} from '@/constants/theme';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PlaygroundScreen() {
    const inset = useSafeAreaInsets();

  return (
    <View style={[styles.contentContainer, {paddingTop: inset.top + 20}]}>
        <View style={styles.contentPadding}>
            <Text style={[styles.title, {
                borderColor: Colors.light.text
            }]}>Playground 1</Text>
        </View>
        <View style={styles.playgroundGap}>
            <View style={[styles.contentPadding, styles.row, {gap: Spacing.lg}]}>
                <Image source={"https://i.pravatar.cc/150?img=5"} contentFit="contain" style={styles.avatar}/>
                <Text style={styles.username}>travel.with.me</Text>
            </View>
            <Image
                source={{ uri: "https://picsum.photos/seed/sun/800/800" }}
                style={styles.postImage}
            />
            <View style={[styles.contentPadding, {gap: 4}]}>
                <View style={[styles.row, {justifyContent: 'space-between'}]}>
                    
                <View style={[styles.row, {gap: Spacing.lg}]}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.row]}
                    >
                        <Ionicons
                            name={"heart-outline"}
                            size={26}
                            color={FeedColors.primaryText}
                        />
                        <Text style={styles.countText}>
                            {parseInt("2341").toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.row]}
                    >
                        <Ionicons
                            name={"chatbubble-outline"}
                            size={26}
                            color={FeedColors.primaryText}
                        />
                        <Text style={styles.countText}>
                            {parseInt("324").toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                    >
                        <Ionicons
                            name={"paper-plane-outline"}
                            size={26}
                            color={FeedColors.primaryText}
                        />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    style={styles.actionButton}
                >
                    <Ionicons
                        name={"bookmark-outline"}
                        size={26}
                        color={FeedColors.primaryText}
                    />
                </TouchableOpacity>
</View>
                <View />    
                    <Text style={styles.caption} numberOfLines={2}>
                        <Text style={styles.bold}>travel.with.me</Text>
                        {'  '}
                        바다가 그리운 날 🌊 제주 한달살기 D+14
                    </Text>

                    <Text style={styles.timestamp}>3시간 전</Text>
                </View>
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
    contentPadding: {
        paddingHorizontal: 16
    },
    flexDirectionRow: {
        flexDirection: 'row',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    playgroundGap: {
        marginTop: Spacing.xxl,
        gap: Spacing.xxl
    },
    title: {
        fontSize: 24,
        paddingBottom: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
    },
    avatar: {
        width: AvatarSizes.md,
        height: AvatarSizes.md,
        borderRadius: AvatarSizes.md / 2,
    },
    username: {
        fontWeight: '600',
        fontSize: FontSizes.md,
    },
    postImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.7,
    },
    actionButton: {
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.xs,
        alignItems: 'center',
    },
    countText: {
        fontWeight: '600',
    },
    bold: {
        fontWeight: '600',
    },
    caption: {
        fontSize: FontSizes.sm,
        color: FeedColors.primaryText,
        lineHeight: 19,
        marginBottom: Spacing.xs,
    },
    timestamp: {
        fontSize: FontSizes.xs,
        color: '#8E8E8E',
    },
});