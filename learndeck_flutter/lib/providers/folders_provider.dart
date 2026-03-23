import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/folder.dart';
import '../services/firebase_service.dart';

final foldersProvider = StateNotifierProvider<FoldersNotifier, AsyncValue<List<Folder>>>((ref) {
  return FoldersNotifier();
});

class FoldersNotifier extends StateNotifier<AsyncValue<List<Folder>>> {
  FoldersNotifier() : super(const AsyncValue.loading());

  Future<void> loadFolders() async {
    state = const AsyncValue.loading();
    try {
      final folders = await FirebaseService.getFolders();
      state = AsyncValue.data(folders);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> createFolder({required String name, required String color}) async {
    try {
      final newFolder = await FirebaseService.createFolder(name: name, color: color);
      state.whenData((folders) {
        state = AsyncValue.data([newFolder, ...folders]);
      });
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateFolder(Folder folder) async {
    try {
      await FirebaseService.updateFolder(folder);
      state.whenData((folders) {
        state = AsyncValue.data(
          folders.map((f) => f.id == folder.id ? folder : f).toList(),
        );
      });
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteFolder(String folderId) async {
    try {
      await FirebaseService.deleteFolder(folderId);
      state.whenData((folders) {
        state = AsyncValue.data(folders.where((f) => f.id != folderId).toList());
      });
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

// Provider for word-folder associations
final wordFoldersProvider = StateNotifierProvider<WordFoldersNotifier, Map<String, Set<String>>>((ref) {
  return WordFoldersNotifier();
});

class WordFoldersNotifier extends StateNotifier<Map<String, Set<String>>> {
  WordFoldersNotifier() : super({});

  Future<void> loadWordFolders(String wordId) async {
    try {
      final folderIds = await FirebaseService.getWordFolders(wordId);
      state = {...state, wordId: folderIds.toSet()};
    } catch (e) {
      // Handle error silently
    }
  }

  Future<void> addWordToFolder(String wordId, String folderId) async {
    try {
      await FirebaseService.addWordToFolder(wordId, folderId);
      final current = state[wordId] ?? {};
      state = {...state, wordId: {...current, folderId}};
    } catch (e) {
      // Handle error
    }
  }

  Future<void> removeWordFromFolder(String wordId, String folderId) async {
    try {
      await FirebaseService.removeWordFromFolder(wordId, folderId);
      final current = state[wordId] ?? {};
      state = {...state, wordId: current.where((id) => id != folderId).toSet()};
    } catch (e) {
      // Handle error
    }
  }

  Set<String> getFoldersForWord(String wordId) {
    return state[wordId] ?? {};
  }
}

// Provider to get words by folder
final wordsInFolderProvider = FutureProvider.family<List<String>, String>((ref, folderId) async {
  return FirebaseService.getWordsInFolder(folderId);
});
