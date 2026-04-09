import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Animated, {
    clamp,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { FeedPost } from './FeedPost';

const DELETE_AREA_WIDTH = 80;
const DELETE_THRESHOLD = -60;

function SwipeableFeedPost({
    post,
    onDelete,
}: {
    post: Post;
    onDelete: (id: string) => void;
}) {
    // TODO: translateX 선언 (실습 4-1)
    const translateX = useSharedValue(0);
    // TODO: cardScale 선언 (실습 5-1)
    const cardScale = useSharedValue(1);

    const triggerLongPressHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // TODO: panGesture 정의 (실습 4-2)
    const panGesture = Gesture.Pan()
        .maxPointers(1)
        .activeOffsetX([-20, 20])
        .failOffsetY([-10, 10])
        .onUpdate(e => {
            translateX.value = clamp(
                e.translationX,
                -DELETE_AREA_WIDTH,
                0,
            );
        })
        .onEnd(e => {
            const shouldOpen =
                e.translationX < DELETE_THRESHOLD || e.velocityX < -500;

            translateX.value = withTiming(
                shouldOpen ? -DELETE_AREA_WIDTH : 0,
                { duration: 180 },
            );
        });

    // TODO: longPressGesture 정의 (실습 5-2)
    const longPressGesture = Gesture.LongPress()
        .numberOfPointers(1)
        .maxDistance(8)
        .onStart(() => {
            cardScale.value = withTiming(0.97, { duration: 120 });
            runOnJS(triggerLongPressHaptic)();
        })
        .onFinalize(() => {
            cardScale.value = withTiming(1, { duration: 120 });
        });

    // TODO: Gesture.Race로 합성 (실습 5-3)
    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    // TODO: animatedStyle 정의 (실습 4-3)
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { scale: cardScale.value }],
    }));

    // TODO: handleDeletePress 작성 (실습 4-4)
    const handleDeletePress = () => {
        onDelete(post.id);
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
                <Animated.View style={animatedStyle}>
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
