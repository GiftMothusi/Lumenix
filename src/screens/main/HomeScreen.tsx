import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

// Temporary mock data
const MOCK_POSTS = [
  { id: '1', content: 'First post' },
  { id: '2', content: 'Second post' },
  { id: '3', content: 'Third post' },
];

const HomeScreen: React.FC<Props> = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderPost = ({ item }: { item: typeof MOCK_POSTS[0] }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_POSTS}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text style={styles.header}>Feed</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  postContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  postContent: {
    fontSize: 16,
  },
});

export default HomeScreen;
