import { StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import ContentContainer from '@components/container';
import { FeedPostHeader } from './FeedPostHeader';
import { FeedPostActions } from './FeedPostActions';
import { FeedPostCaption } from './FeedPostCaption';
import { ThemedView } from '@components/themed-view';
import FeedImage from '@components/feed/post/FeedImage';
import { resolveImageSource } from '@/utils/image';
import { useFeedStore } from '@/store/feed-store';

// TODO 1: console.log('FeedPost render:', post.id) 를 추가해 렌더링 횟수를 추적하세요
//         좋아요 버튼을 누를 때 몇 개의 로그가 찍히는지 확인하세요

// TODO 2: React.memo로 컴포넌트를 감싸세요
//         export const FeedPost = React.memo(function FeedPost(...) { ... });

function FeedPost({ post }: { post: Post }) {
    console.log('FeedPost render:', post.id);

    const user = post.author;

    // TODO 3: useFeedStore() 전체 구독을 selector로 교체하세요
    //         const liked      = useFeedStore(s => s.posts.find(p => p.id === post.id)?.liked ?? post.liked);
    //         const toggleLike = useFeedStore(s => s.toggleLike);
    const { posts, toggleLike } = useFeedStore();

    const currentPost = posts.find(p => p.id === post.id);
    const liked = currentPost?.liked ?? post.liked;

    if (!user) return null;

    // TODO 4: useCallback으로 감싸세요 — dependency: [liked, toggleLike, post.id]
    //         단, useCallback은 if (!user) return null 보다 위에 있어야 합니다
    const handleDoubleTap = () => {
        if (!liked) toggleLike(post.id);
    };

    return (
        <ThemedView style={styles.feedMargin}>
            <FeedPostHeader user={user} />
            {post.images[0] && (
                <FeedImage
                    image={resolveImageSource(post.images[0])}
                    onDoubleTap={handleDoubleTap}
                />
            )}
            <ContentContainer style={{ gap: 4 }}>
                <FeedPostActions
                    postId={post.id}
                    initialLikes={post.likes}
                    initialLiked={post.liked}
                    commentCount={post.commentCount ?? post.comments.length}
                />
                <FeedPostCaption
                    username={user.username}
                    caption={post.caption}
                    timestamp={post.timestamp}
                />
            </ContentContainer>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    feedMargin: {
        marginBottom: 20,
    },
});

export { FeedPost };
