import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';
import { Search } from 'lucide-react-native';

type Props = BottomTabScreenProps<MainTabParamList, 'Discover'>;

const DiscoverScreen: React.FC<Props> = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchContainer}>
          <Search
            size={20}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people and posts"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <View style={styles.trendingContainer}>
          <Text style={styles.placeholder}>Trending content will appear here</Text>
        </View>
        <Text style={styles.sectionTitle}>Suggested For You</Text>
        <View style={styles.suggestionsContainer}>
          <Text style={styles.placeholder}>Suggestions will appear here</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  trendingContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  placeholder: {
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default DiscoverScreen;
