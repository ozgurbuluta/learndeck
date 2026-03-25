import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/words_provider.dart';
import '../providers/user_preferences_provider.dart';
import '../services/ai_service.dart';
import '../theme/app_theme.dart';

class AIChatScreen extends ConsumerStatefulWidget {
  const AIChatScreen({super.key});

  @override
  ConsumerState<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends ConsumerState<AIChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  List<ExtractedWord> _pendingWords = [];
  Set<int> _selectedWordIndices = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Defer to get access to ref
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showWelcomeMessage();
    });
  }

  void _showWelcomeMessage() {
    final userPrefs = ref.read(userPreferencesProvider).valueOrNull;
    final targetLang = userPrefs?.targetLanguage ?? 'German';
    final categories = userPrefs?.categories ?? [];

    String suggestions = '';
    if (categories.isNotEmpty) {
      final topCategories = categories.take(2).join(' or ');
      suggestions = '- "Give me words about $topCategories"\n';
    }

    _addAssistantMessage(
      'Hi! I can help you create $targetLang vocabulary cards. Try saying:\n'
      '${suggestions.isNotEmpty ? suggestions : '- "Give me 10 words about food"\n'}'
      '- "I need business vocabulary"\n'
      '- "Teach me travel phrases"',
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _addAssistantMessage(String text) {
    setState(() {
      _messages.add(ChatMessage(text: text, isUser: false));
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isLoading) return;

    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _isLoading = true;
      _pendingWords = [];
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      // Get user preferences for personalized vocabulary
      final userPrefs = ref.read(userPreferencesProvider).valueOrNull;

      final response = await AIService.generateVocabulary(
        userMessage: text,
        conversationHistory: _messages
            .map((m) => {
                  'type': m.isUser ? 'user' : 'assistant',
                  'content': m.text,
                })
            .toList(),
        userPreferences: userPrefs,
      );

      setState(() {
        _messages.add(ChatMessage(text: response.response, isUser: false));
        _pendingWords = response.words;
        // Select all words by default
        _selectedWordIndices = Set.from(List.generate(response.words.length, (i) => i));
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage(
          text: 'Sorry, something went wrong. Please try again.',
          isUser: false,
        ));
        _isLoading = false;
      });
    }
  }

  Future<void> _saveWords() async {
    if (_pendingWords.isEmpty || _selectedWordIndices.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      final wordsNotifier = ref.read(wordsProvider.notifier);
      int savedCount = 0;
      for (int i = 0; i < _pendingWords.length; i++) {
        if (_selectedWordIndices.contains(i)) {
          final word = _pendingWords[i];
          await wordsNotifier.addWord(
            word: word.word,
            definition: word.definition,
            article: word.article,
          );
          savedCount++;
        }
      }

      setState(() {
        _messages.add(ChatMessage(
          text: 'Saved $savedCount words to your vocabulary!',
          isUser: false,
        ));
        _pendingWords = [];
        _selectedWordIndices = {};
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      setState(() {
        _messages.add(ChatMessage(
          text: 'Failed to save words: $e',
          isUser: false,
        ));
        _isLoading = false;
      });
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text('AI Vocabulary Assistant'),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessage(message);
              },
            ),
          ),

          // Pending words preview
          if (_pendingWords.isNotEmpty) _buildPendingWords(),

          // Input
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildMessage(ChatMessage message) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.lg),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: message.isUser ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: message.isUser
              ? null
              : Border.all(color: AppColors.border),
        ),
        child: Text(
          message.text,
          style: AppTextStyles.body.copyWith(
            color: message.isUser
                ? AppColors.textOnPrimary
                : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  void _toggleWordSelection(int index) {
    setState(() {
      if (_selectedWordIndices.contains(index)) {
        _selectedWordIndices.remove(index);
      } else {
        _selectedWordIndices.add(index);
      }
    });
  }

  void _selectAll() {
    setState(() {
      _selectedWordIndices = Set.from(List.generate(_pendingWords.length, (i) => i));
    });
  }

  void _deselectAll() {
    setState(() {
      _selectedWordIndices = {};
    });
  }

  Widget _buildPendingWords() {
    final selectedCount = _selectedWordIndices.length;
    final allSelected = selectedCount == _pendingWords.length;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      constraints: const BoxConstraints(maxHeight: 250),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: AppColors.primary, width: 1),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$selectedCount of ${_pendingWords.length} selected',
                      style: AppTextStyles.labelSmall,
                    ),
                    GestureDetector(
                      onTap: allSelected ? _deselectAll : _selectAll,
                      child: Text(
                        allSelected ? 'Deselect all' : 'Select all',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _isLoading || selectedCount == 0 ? null : _saveWords,
                  icon: const Icon(Icons.save_rounded, size: 18),
                  label: Text('Save ($selectedCount)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.textOnPrimary,
                    disabledBackgroundColor: AppColors.textTertiary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.sm,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Word chips (scrollable)
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.md, 0, AppSpacing.md, AppSpacing.md,
              ),
              child: Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: List.generate(_pendingWords.length, (index) {
                  final word = _pendingWords[index];
                  final isSelected = _selectedWordIndices.contains(index);
                  return GestureDetector(
                    onTap: () => _toggleWordSelection(index),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary.withValues(alpha: 0.15)
                            : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isSelected)
                            Padding(
                              padding: const EdgeInsets.only(right: 4),
                              child: Icon(
                                Icons.check_circle,
                                size: 16,
                                color: AppColors.primary,
                              ),
                            ),
                          Text(
                            word.word,
                            style: AppTextStyles.labelSmall.copyWith(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                decoration: InputDecoration(
                  hintText: 'Ask for vocabulary...',
                  fillColor: AppColors.surfaceVariant,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.md,
                  ),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Container(
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: _isLoading
                  ? Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: AppColors.textOnPrimary,
                          strokeWidth: 2,
                        ),
                      ),
                    )
                  : IconButton(
                      icon: Icon(Icons.send_rounded, color: AppColors.textOnPrimary),
                      onPressed: _sendMessage,
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

  ChatMessage({required this.text, required this.isUser});
}
