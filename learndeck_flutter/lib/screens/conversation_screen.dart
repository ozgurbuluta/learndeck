import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/user_preferences_provider.dart';
import '../providers/speech_provider.dart';
import '../services/tts_service.dart';
import '../services/ai_service.dart';
import '../theme/app_theme.dart';

/// Conversation Practice - voice chat with AI
class ConversationScreen extends ConsumerStatefulWidget {
  const ConversationScreen({super.key});

  @override
  ConsumerState<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends ConsumerState<ConversationScreen> {
  final List<ChatMessage> _messages = [];
  final List<ConversationMessage> _apiHistory = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _showTranslation = false;
  String? _selectedTopic;

  final List<String> _topics = [
    'Introduce yourself',
    'At a restaurant',
    'Shopping',
    'Asking for directions',
    'Making plans',
    'Weather',
    'Hobbies',
    'Free conversation',
  ];

  @override
  void initState() {
    super.initState();
  }

  Future<void> _startConversation(String topic) async {
    setState(() {
      _selectedTopic = topic;
      _messages.clear();
      _apiHistory.clear();
    });

    // Get AI to start the conversation
    await _getAIResponse(topic == 'Free conversation' ? 'Hello!' : 'Start a conversation about: $topic');
  }

  Future<void> _startRecording() async {
    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';

    ref.read(speechProvider.notifier).clearText();
    await ref.read(speechProvider.notifier).startListening(language: language);
  }

  Future<void> _stopRecording() async {
    await ref.read(speechProvider.notifier).stopListening();

    // Wait for final result
    await Future.delayed(const Duration(milliseconds: 500));

    final speechState = ref.read(speechProvider);
    if (speechState.recognizedText.isNotEmpty) {
      _sendMessage(speechState.recognizedText);
    }
  }

  Future<void> _sendMessage(String text) async {
    // Add user message
    setState(() {
      _messages.add(ChatMessage(
        text: text,
        isUser: true,
        translation: null,
      ));
      _apiHistory.add(ConversationMessage(role: 'user', content: text));
    });

    _scrollToBottom();

    // Get AI response
    await _getAIResponse(text);
  }

  Future<void> _getAIResponse(String userMessage) async {
    setState(() {
      _isLoading = true;
    });

    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    final nativeLanguage = prefs?.nativeLanguage ?? 'English';
    final level = prefs?.level ?? 'beginner';

    final response = await AIService.getConversationResponse(
      userMessage: userMessage,
      targetLanguage: language,
      nativeLanguage: nativeLanguage,
      level: level,
      topic: _selectedTopic,
      conversationHistory: _apiHistory.isEmpty ? null : _apiHistory,
    );

    if (response.success && response.response.isNotEmpty) {
      setState(() {
        _messages.add(ChatMessage(
          text: response.response,
          isUser: false,
          translation: response.translation,
          suggestion: response.suggestion,
        ));
        _apiHistory.add(ConversationMessage(role: 'assistant', content: response.response));
      });

      // Speak the response
      await TTSService.speak(response.response, language: language);
    }

    setState(() {
      _isLoading = false;
    });

    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _replayMessage(String text) async {
    final prefs = ref.read(userPreferencesProvider).valueOrNull;
    final language = prefs?.targetLanguage ?? 'German';
    await TTSService.speak(text, language: language);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    TTSService.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final speechState = ref.watch(speechProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: Text(
          _selectedTopic ?? 'Conversation',
          style: AppTextStyles.h4,
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              _showTranslation ? Icons.translate : Icons.translate_outlined,
              color: _showTranslation ? AppColors.primary : AppColors.textTertiary,
            ),
            onPressed: () => setState(() => _showTranslation = !_showTranslation),
            tooltip: 'Show translations',
          ),
          if (_selectedTopic != null)
            IconButton(
              icon: Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
              onPressed: () => setState(() {
                _selectedTopic = null;
                _messages.clear();
                _apiHistory.clear();
              }),
              tooltip: 'New conversation',
            ),
        ],
      ),
      body: _selectedTopic == null ? _buildTopicSelection() : _buildConversation(speechState),
    );
  }

  Widget _buildTopicSelection() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Choose a Topic',
            style: AppTextStyles.h2,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Select a conversation scenario to practice',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),
          ..._topics.map((topic) => _buildTopicCard(topic)),
        ],
      ),
    );
  }

  Widget _buildTopicCard(String topic) {
    final icons = {
      'Introduce yourself': Icons.person_rounded,
      'At a restaurant': Icons.restaurant_rounded,
      'Shopping': Icons.shopping_bag_rounded,
      'Asking for directions': Icons.directions_rounded,
      'Making plans': Icons.event_rounded,
      'Weather': Icons.wb_sunny_rounded,
      'Hobbies': Icons.sports_esports_rounded,
      'Free conversation': Icons.chat_bubble_rounded,
    };

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        onTap: () => _startConversation(topic),
        leading: Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Icon(
            icons[topic] ?? Icons.chat_rounded,
            color: AppColors.primary,
          ),
        ),
        title: Text(topic, style: AppTextStyles.bodyLarge),
        trailing: Icon(Icons.chevron_right_rounded, color: AppColors.textTertiary),
      ),
    );
  }

  Widget _buildConversation(SpeechState speechState) {
    return Column(
      children: [
        // Messages
        Expanded(
          child: _messages.isEmpty
              ? _buildEmptyChat()
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) => _buildMessageBubble(_messages[index]),
                ),
        ),

        // Loading indicator
        if (_isLoading)
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Text(
                  'Thinking...',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

        // Recording indicator
        if (speechState.isListening)
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            color: AppColors.error.withValues(alpha: 0.1),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.mic_rounded, color: AppColors.error),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  speechState.recognizedText.isEmpty
                      ? 'Listening...'
                      : speechState.recognizedText,
                  style: AppTextStyles.body.copyWith(color: AppColors.error),
                ),
              ],
            ),
          ),

        // Input area
        _buildInputArea(speechState),
      ],
    );
  }

  Widget _buildEmptyChat() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline_rounded,
            size: 64,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Starting conversation...',
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment: message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.smart_toy_rounded,
                size: 20,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment:
                  message.isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: message.isUser ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: message.isUser ? null : Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        message.text,
                        style: AppTextStyles.body.copyWith(
                          color: message.isUser ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                      if (_showTranslation && message.translation != null && message.translation!.isNotEmpty) ...[
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          message.translation!,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: message.isUser
                                ? Colors.white.withValues(alpha: 0.7)
                                : AppColors.textTertiary,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (!message.isUser) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(Icons.volume_up_rounded, size: 18),
                        onPressed: () => _replayMessage(message.text),
                        color: AppColors.textTertiary,
                        visualDensity: VisualDensity.compact,
                        tooltip: 'Replay',
                      ),
                      if (message.suggestion != null && message.suggestion!.isNotEmpty)
                        TextButton(
                          onPressed: () => _sendMessage(message.suggestion!),
                          child: Text(
                            'Suggest: ${message.suggestion}',
                            style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (message.isUser) ...[
            const SizedBox(width: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.textSecondary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.person_rounded,
                size: 20,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInputArea(SpeechState speechState) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Text(
                'Hold to speak',
                style: AppTextStyles.body.copyWith(color: AppColors.textTertiary),
              ),
            ),
            GestureDetector(
              onTapDown: (_) => _startRecording(),
              onTapUp: (_) => _stopRecording(),
              onTapCancel: () => _stopRecording(),
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: speechState.isListening ? AppColors.error : AppColors.primary,
                  shape: BoxShape.circle,
                  boxShadow: speechState.isListening
                      ? [
                          BoxShadow(
                            color: AppColors.error.withValues(alpha: 0.4),
                            blurRadius: 15,
                            spreadRadius: 2,
                          )
                        ]
                      : null,
                ),
                child: Icon(
                  speechState.isListening ? Icons.mic_rounded : Icons.mic_none_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final String? translation;
  final String? suggestion;

  ChatMessage({
    required this.text,
    required this.isUser,
    this.translation,
    this.suggestion,
  });
}
