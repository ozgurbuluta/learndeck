import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ai_service.dart';
import '../services/firebase_service.dart';

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
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _addAssistantMessage(
      'Hi! I can help you create vocabulary cards. Try saying:\n'
      '• "Give me 10 German words about food"\n'
      '• "I need business vocabulary in German"\n'
      '• "Teach me travel phrases"',
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
      final response = await AIService.generateVocabulary(
        userMessage: text,
        conversationHistory: _messages
            .map((m) => {
                  'type': m.isUser ? 'user' : 'assistant',
                  'content': m.text,
                })
            .toList(),
      );

      setState(() {
        _messages.add(ChatMessage(text: response.response, isUser: false));
        _pendingWords = response.words;
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
    if (_pendingWords.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      int savedCount = 0;
      for (final word in _pendingWords) {
        await FirebaseService.createWord(
          word: word.word,
          definition: word.definition,
          article: word.article,
        );
        savedCount++;
      }

      setState(() {
        _messages.add(ChatMessage(
          text: '✅ Saved $savedCount words to your vocabulary!',
          isUser: false,
        ));
        _pendingWords = [];
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
      backgroundColor: const Color(0xFF1a1a2e),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'AI Vocabulary Assistant',
          style: TextStyle(color: Colors.white),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
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
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.8,
        ),
        decoration: BoxDecoration(
          color: message.isUser
              ? const Color(0xFF6366f1)
              : const Color(0xFF252542),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          message.text,
          style: const TextStyle(color: Colors.white, fontSize: 15),
        ),
      ),
    );
  }

  Widget _buildPendingWords() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF252542),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF6366f1), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_pendingWords.length} words ready to save',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                ),
              ),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _saveWords,
                icon: const Icon(Icons.save, size: 18),
                label: const Text('Save All'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366f1),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _pendingWords.take(5).map((w) {
              return Chip(
                label: Text(
                  w.word,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
                backgroundColor: const Color(0xFF6366f1).withValues(alpha: 0.3),
              );
            }).toList(),
          ),
          if (_pendingWords.length > 5)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                '+${_pendingWords.length - 5} more',
                style: const TextStyle(color: Colors.white54, fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF252542),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Ask for vocabulary...',
                  hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
                  filled: true,
                  fillColor: const Color(0xFF1a1a2e),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 12),
            CircleAvatar(
              backgroundColor: const Color(0xFF6366f1),
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
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
