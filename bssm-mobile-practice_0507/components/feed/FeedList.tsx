import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { SwipeableFeedPost } from './post/SwipeableFeedPost';
import { useFeedStore } from '@/store/feed-store';

// Animated.FlatList: Reanimated의 네이티브 이벤트 시스템과 연결된 FlatList
// — onScroll 핸들러가 JS 브리지 없이 UI 스레드에서 직접 실행됨
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

function FeedList({
    posts,
    onEndReached,
    scrollY,
}: {
    posts: Post[];
    onEndReached?: () => void;
    scrollY?: SharedValue<number>;
}) {
    const { removePost, fetchFeed, loading } = useFeedStore();

    // useAnimatedScrollHandler: 스크롤 이벤트를 UI 스레드 worklet으로 처리
    // 일반 onScroll 대비 이점: JS 스레드 부하 없이 매 프레임 정확한 위치 추적
    const scrollHandler = useAnimatedScrollHandler(event => {
        if (scrollY) scrollY.value = event.contentOffset.y;
    });

    return (
        <AnimatedFlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                // TODO 4. 각 포스트를 독립 ErrorBoundary로 감싸세요.
                //         - key={item.id} : 포스트마다 독립 인스턴스를 생성해 에러를 격리합니다.
                //         - fallback: "이 게시물을 표시할 수 없어요." 텍스트를 postStyles.error 뷰로 표시하세요.
                <SwipeableFeedPost post={item} onDelete={removePost} />
            )}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={fetchFeed}
                    tintColor='#8e8e8e'
                />
            }
        />
    );
}

const postStyles = StyleSheet.create({
    error: {
        paddingVertical: 24,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#efefef',
    },
    errorText: {
        fontSize: 13,
        color: '#c7c7c7',
    },
});

export { FeedList };
