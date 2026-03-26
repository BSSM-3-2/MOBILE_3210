import { Dimensions, FlatList, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { Image } from 'expo-image';
import { resolveImageSource } from '@/utils/image';
import { Grid } from '@/constants/theme';
import { ThemedView } from '@components/themed-view';
import { ComponentType, ReactElement } from 'react';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / Grid.profileColumnCount;

type HeaderComponent = ComponentType | ReactElement | null | undefined;

export default function ProfileFeedList({
    posts,
    ListHeaderComponent,
}: {
    posts: Post[];
    ListHeaderComponent?: HeaderComponent;
}) {
    return (
        <ThemedView style={styles.container}>
            <FlatList<Post>
                data={posts}
                keyExtractor={item => String(item.id)}
                numColumns={Grid.profileColumnCount}
                ListHeaderComponent={ListHeaderComponent}
                renderItem={({ item }: { item: Post }) => (
                    <Image
                        style={styles.image}
                        contentFit={'cover'}
                        source={resolveImageSource(item.images[0])}
                    />
                )}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Grid.gap,
        paddingTop: Grid.gap,
        rowGap: Grid.gap,
    },
    row: {
        columnGap: Grid.gap,
    },
    image: {
        height: ITEM_SIZE * Grid.profileImageRatio,
        width: ITEM_SIZE - Grid.gap,
    },
});
