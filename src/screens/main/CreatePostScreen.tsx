import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types/navigation';

type Props = BottomTabScreenProps<MainTabParamList, 'CreatePost'>;

const CreatePostScreen: React.FC<Props> = () => {
  const [content, setContent] = React.useState('');

  const handlePost = () => {
    // TODO: Implement post creation logic
    console.log('Post content:', content);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
      </View>
      <TextInput
        style={styles.input}
        multiline
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
      />

      <TouchableOpacity
        style={[styles.button, !content && styles.buttonDisabled]}
        onPress={handlePost}
        disabled={!content}
      >
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
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
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePostScreen;
