import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import ScreenContainer from '../components/ScreenContainer';
import { useAuth } from '../hooks/useAuth';
import { useWords } from '../hooks/useWords';
import { Word, StudyConfig } from '@shared/types';
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

  const translateX = useSharedValue(0);
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

  const onSwipeComplete = (isCorrect: boolean) => {
    handleAnswer(isCorrect);
  };

  useEffect(() => {
    // Reset card position when the word changes
    translateX.value = 0;
  }, [currentIndex]);

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

  const resetFlip = () => {
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const { height, width } = Dimensions.get('window');

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const swipeThreshold = width * 0.4;

      if (event.translationX > swipeThreshold) {
        translateX.value = withSpring(width, {}, () => {
          runOnJS(onSwipeComplete)(true);
        });
      } else if (event.translationX < -swipeThreshold) {
        translateX.value = withSpring(-width, {}, () => {
          runOnJS(onSwipeComplete)(false);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotateZ = (translateX.value / (width / 2)) * 10;
    return {
      transform: [
        { translateX: translateX.value },
        { rotateZ: `${rotateZ}deg` },
      ],
    };
  });

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const animatedFrontStyle = {
    transform: [{ rotateY: frontInterpolate }, { perspective: 1000 }],
  } as const;

  const animatedBackStyle = {
    transform: [{ rotateY: backInterpolate }, { perspective: 1000 }],
  } as const;

  // ----------- RENDERERS -----------
  if (!isReady) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FCA311" />
        </View>
      </ScreenContainer>
    );
  }

  if (studyWords.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.noWords}>No words to study right now.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.completeHeader}>Session Complete!</Text>
          <Text style={styles.completeSub}>{`Accuracy: ${sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%`}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ justifyContent: 'flex-start' }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{`${currentIndex + 1}/${studyWords.length}`}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentContainer}>
        <GestureDetector gesture={panGesture}>
          <Reanimated.View style={animatedCardStyle}>
            <TouchableWithoutFeedback onPress={() => (isFlipped ? flipToFront() : flipToBack())}>
              <View style={styles.cardContainer}>
                {/* Front Side */}
                <Animated.View style={[styles.wordCard, animatedFrontStyle, { position: 'absolute', backfaceVisibility: 'hidden' }]}>
                  <View style={styles.wordTopSection}>
                    <Text style={styles.wordText}>
                      {currentWord.article ? `${currentWord.article} ` : ''}
                      {currentWord.word}
                    </Text>
                  </View>
                  <Text style={styles.revealHint}>Tap to Reveal Definition</Text>
                </Animated.View>

                {/* Back Side */}
                <Animated.View style={[styles.wordCard, animatedBackStyle, { position: 'absolute', backfaceVisibility: 'hidden' }]}>
                  <View style={styles.wordTopSection}>
                    <Text style={styles.wordText}>{currentWord.definition}</Text>
                    <Text style={styles.reminderWordText}>
                      {currentWord.article ? `${currentWord.article} ` : ''}
                      {currentWord.word}
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Reanimated.View>
        </GestureDetector>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.answerBtn, { backgroundColor: '#DC2626' }]} onPress={() => handleAnswer(false)}>
          <Text style={styles.answerIcon}>✕</Text>
          <Text style={styles.answerText}>Keep Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.answerBtn, { backgroundColor: '#16A34A' }]} onPress={() => handleAnswer(true)}>
          <Text style={styles.answerIcon}>✔</Text>
          <Text style={styles.answerText}>I Know It</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noWords: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  completeHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14213D',
    marginBottom: 8,
  },
  completeSub: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#FCA311',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 1,
    paddingBottom: 15,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14213D',
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
  wordCard: {
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
  wordTopSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14213D',
    textAlign: 'center',
  },
  reminderWordText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  revealHint: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  answerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  answerText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14213D',
  },
  answerIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default StudySessionScreen; 