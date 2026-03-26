import { FlatList, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { FeedPost } from './post/FeedPost';
import { ThemedView } from '@components/themed-view';

function FeedList({ posts }: { posts: Post[] }) {
    return (
        <ThemedView style={styles.container}>
            <FlatList<Post>
                data={posts}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }: { item: Post }) => (
                    <FeedPost post={item} />
                )}
                showsVerticalScrollIndicator={false}
                style={styles.list}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { flex: 1 },
});

export { FeedList };
