import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { Word, StudyConfig } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

const MAX_SESSION_WORDS = 20;

const StudySessionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'StudySession'>>();
  const studyConfig = route.params?.studyConfig;

  const { user } = useAuth();
  const { loading: wordsLoading, updateWord, getWordsForStudy } = useWords(user);
  const [isReady, setIsReady] = useState(false);

  const studyWords = useMemo(() => {
    if (!user || !studyConfig) return [];
    return getWordsForStudy(studyConfig, MAX_SESSION_WORDS);
  }, [user, getWordsForStudy, studyConfig]);

  useEffect(() => {
    if (!wordsLoading) {
      setIsReady(true);
    }
  }, [wordsLoading]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const resetFlip = () => {
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  // Get screen dimensions
  const { height, width } = Dimensions.get('window');

  // Animation values for swipe
  const translateX = useRef(new Animated.Value(0)).current;

  // Reset card position when moving to next word
  useEffect(() => {
    translateX.setValue(0);
  }, [currentIndex, translateX]);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      // Release animation resources
      flipAnim.stopAnimation();
      translateX.stopAnimation();
    };
  }, [flipAnim, translateX]);

  const currentWord = studyWords[currentIndex];

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentWord || !user) return;

    const now = new Date();
    const newCorrectCount = isCorrect ? currentWord.correct_count + 1 : currentWord.correct_count;

    const updatedWord: Word = {
      ...currentWord,
      last_reviewed: now,
      review_count: currentWord.review_count + 1,
      correct_count: newCorrectCount,
      next_review: calculateNextReview(currentWord, isCorrect),
      difficulty: updateWordDifficulty(currentWord, isCorrect, newCorrectCount),
    };

    await updateWord(updatedWord);

    const newStats = {
      correct: sessionStats.correct + (isCorrect ? 1 : 0),
      total: sessionStats.total + 1,
    };
    setSessionStats(newStats);

    if (currentIndex === studyWords.length - 1) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      resetFlip();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      const swipeThreshold = width * 0.4;

      if (translationX > swipeThreshold) {
        // Swipe right - correct answer
        Animated.timing(translateX, {
          toValue: width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleAnswer(true);
        });
      } else if (translationX < -swipeThreshold) {
        // Swipe left - incorrect answer
        Animated.timing(translateX, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          handleAnswer(false);
        });
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const cardStyle = {
    transform: [
      { translateX },
      {
        rotate: translateX.interpolate({
          inputRange: [-width, 0, width],
          outputRange: ['-30deg', '0deg', '30deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  const calculateNextReview = (word: Word, isCorrect: boolean): Date => {
    const now = new Date();
    let intervalDays = 1;

    if (word.difficulty === 'new') {
      intervalDays = isCorrect ? 1 : 0.5;
    } else if (word.difficulty === 'learning') {
      intervalDays = isCorrect ? 3 : 1;
    } else if (word.difficulty === 'review') {
      intervalDays = isCorrect ? 7 : 2;
    } else if (word.difficulty === 'mastered') {
      intervalDays = isCorrect ? 30 : 7;
    }

    const next = new Date(now);
    next.setDate(next.getDate() + intervalDays);
    return next;
  };

  const updateWordDifficulty = (word: Word, isCorrect: boolean, newCorrectCount: number): Word['difficulty'] => {
    if (isCorrect) {
      if (word.difficulty === 'new') return 'learning';
      if (word.difficulty === 'learning' && newCorrectCount >= 3) return 'review';
      if (word.difficulty === 'review' && newCorrectCount >= 10) return 'mastered';
    } else {
      if (word.difficulty === 'mastered') return 'review';
      if (word.difficulty === 'review') return 'learning';
    }
    return word.difficulty;
  };

  const flipToBack = () => {
    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setIsFlipped(true));
  };

  const flipToFront = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setIsFlipped(false));
  };

  // ----------- RENDERERS -----------
  if (!isReady) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading study session...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (studyWords.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No words available for study</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    const accuracy = sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total * 100).toFixed(1) : '0';
    
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.completeTitle}>Session Complete!</Text>
          <Text style={styles.statsText}>
            {sessionStats.correct}/{sessionStats.total} correct ({accuracy}%)
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const frontStyle = {
    transform: [
      { rotateY: flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg']
      }) }
    ],
  };

  const backStyle = {
    transform: [
      { rotateY: flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg']
      }) }
    ],
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {studyWords.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / studyWords.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            minDist={10}
          >
            <Animated.View style={[styles.cardContainer, cardStyle]}>
              <TouchableWithoutFeedback onPress={() => (isFlipped ? flipToFront() : flipToBack())}>
                <View style={styles.card}>
                  {!isFlipped ? (
                    <Animated.View style={[styles.cardFace, frontStyle]}>
                      <Text style={styles.wordText}>{currentWord.word}</Text>
                      <Text style={styles.tapHint}>Tap to reveal definition</Text>
                    </Animated.View>
                  ) : (
                    <Animated.View style={[styles.cardFace, styles.cardBack, backStyle]}>
                      <Text style={styles.definitionText}>{currentWord.definition}</Text>
                      <Text style={styles.swipeHint}>Swipe right if you know it, left if you don't</Text>
                    </Animated.View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </PanGestureHandler>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.answerButton, styles.incorrectButton]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.buttonText}>Keep Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.answerButton, styles.correctButton]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>I Know It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#FCA311',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14213D',
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginLeft: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FCA311',
    borderRadius: 6,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    height: '80%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFace: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14213D',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  definitionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14213D',
    textAlign: 'center',
    marginTop: 16,
  },
  swipeHint: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  incorrectButton: {
    backgroundColor: '#DC2626',
  },
  correctButton: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14213D',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
});

export default StudySessionScreen; 