import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const AddWordScreen: React.FC = () => {
  const { user } = useAuth();
  const { addWord } = useWords(user);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!word || !definition) {
      Alert.alert('Missing fields', 'Please enter both word and definition');
      return;
    }
    setLoading(true);
    try {
      await addWord({ word, definition });
      Alert.alert('Success', 'Word added!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Word</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Word"
          placeholderTextColor="#6B7280"
          value={word}
          onChangeText={setWord}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Definition"
          placeholderTextColor="#6B7280"
          multiline
          value={definition}
          onChangeText={setDefinition}
        />
        <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Word'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  backButton: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FCA311',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  formContainer: {
    padding: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#FCA311',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddWordScreen; 