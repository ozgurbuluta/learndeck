import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDw2nymqxr7fzemYFi4KfmRCaKi44BOi6g',
    appId: '1:660035173354:android:f9c85f8c342a1955f11093',
    messagingSenderId: '660035173354',
    projectId: 'learndeck-vocab-5332',
    storageBucket: 'learndeck-vocab-5332.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyD5flglnJIfiOwndkySsRM0g-lHjTKQ2yQ',
    appId: '1:660035173354:ios:f1620e3b763214e6f11093',
    messagingSenderId: '660035173354',
    projectId: 'learndeck-vocab-5332',
    storageBucket: 'learndeck-vocab-5332.firebasestorage.app',
    iosBundleId: 'online.learndeck.learndeckFlutter',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDj-THtKfgbEBj7nfbjG8v1iHof9MpGWSI',
    appId: '1:660035173354:web:479a08de7a358f10f11093',
    messagingSenderId: '660035173354',
    projectId: 'learndeck-vocab-5332',
    authDomain: 'learndeck-vocab-5332.firebaseapp.com',
    storageBucket: 'learndeck-vocab-5332.firebasestorage.app',
  );
}
