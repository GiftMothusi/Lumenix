import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';

type Props = BottomTabScreenProps<MainTabParamList, 'Notifications'>;

type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  text: string;
  time: string;
  read: boolean;
};

// Mock data for notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    text: 'John liked your post',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    text: 'Sarah commented on your post',
    time: '5m ago',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    text: 'Mike started following you',
    time: '1h ago',
    read: true,
  },
];

const NotificationsScreen: React.FC<Props> = () => {
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification]}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.text}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  unreadNotification: {
    backgroundColor: '#f0f9ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
});

export default NotificationsScreen;
