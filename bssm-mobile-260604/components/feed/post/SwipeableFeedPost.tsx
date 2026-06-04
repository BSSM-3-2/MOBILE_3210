import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Post } from '@type/Post';
import { FeedPost } from './FeedPost';

// TODO: React.memo로 컴포넌트를 감싸세요
//       renderItem이 useCallback으로 안정화되면, React.memo가 있는 컴포넌트만 건너뛸 수 있습니다

const DELETE_AREA_WIDTH = 80;
const DELETE_THRESHOLD = -60;

function SwipeableFeedPost({
    post,
    onDelete,
}: {
    post: Post;
    onDelete: (id: string) => void;
}) {
    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate(e => {
            translateX.value = Math.min(
                0,
                Math.max(e.translationX, -DELETE_AREA_WIDTH),
            );
        })
        .onEnd(e => {
            if (e.translationX < DELETE_THRESHOLD) {
                translateX.value = withTiming(-DELETE_AREA_WIDTH);
            } else {
                translateX.value = withTiming(0);
            }
        });

    const longPressGesture = Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
            cardScale.value = withSpring(0.96, { damping: 8 });
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        })
        .onEnd(() => {
            cardScale.value = withSpring(1, { damping: 8 });
        })
        .onFinalize(() => {
            cardScale.value = withSpring(1, { damping: 8 });
        });

    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    const handleDeletePress = () => {
        translateX.value = withTiming(0);
        runOnJS(onDelete)(post.id);
    };

    return (
        <View style={styles.container}>
            <View style={styles.deleteArea}>
                <TouchableOpacity
                    onPress={handleDeletePress}
                    style={styles.deleteButton}
                >
                    <Ionicons name='trash-outline' size={24} color='white' />
                </TouchableOpacity>
            </View>

            <GestureDetector gesture={composedGesture}>
                <Animated.View
                    style={[animatedStyle, { backgroundColor: '#FFF' }]}
                >
                    <FeedPost post={post} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    deleteArea: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_AREA_WIDTH,
        backgroundColor: '#ED4956',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export { SwipeableFeedPost };
