/// Settings for Text-to-Speech functionality
class TTSSettings {
  final double speechRate;
  final double pitch;
  final double volume;
  final bool autoPlayOnReveal;

  const TTSSettings({
    this.speechRate = 0.5,
    this.pitch = 1.0,
    this.volume = 1.0,
    this.autoPlayOnReveal = false,
  });

  TTSSettings copyWith({
    double? speechRate,
    double? pitch,
    double? volume,
    bool? autoPlayOnReveal,
  }) {
    return TTSSettings(
      speechRate: speechRate ?? this.speechRate,
      pitch: pitch ?? this.pitch,
      volume: volume ?? this.volume,
      autoPlayOnReveal: autoPlayOnReveal ?? this.autoPlayOnReveal,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'speechRate': speechRate,
      'pitch': pitch,
      'volume': volume,
      'autoPlayOnReveal': autoPlayOnReveal,
    };
  }

  factory TTSSettings.fromJson(Map<String, dynamic> json) {
    return TTSSettings(
      speechRate: (json['speechRate'] as num?)?.toDouble() ?? 0.5,
      pitch: (json['pitch'] as num?)?.toDouble() ?? 1.0,
      volume: (json['volume'] as num?)?.toDouble() ?? 1.0,
      autoPlayOnReveal: json['autoPlayOnReveal'] as bool? ?? false,
    );
  }

  /// Get display name for the current speech rate
  String get rateDisplayName {
    if (speechRate < 0.35) return 'Very Slow';
    if (speechRate < 0.45) return 'Slow';
    if (speechRate < 0.55) return 'Normal';
    if (speechRate < 0.7) return 'Fast';
    return 'Very Fast';
  }

  /// Preset speech rates
  static const Map<String, double> presetRates = {
    'Very Slow': 0.25,
    'Slow': 0.4,
    'Normal': 0.5,
    'Fast': 0.65,
    'Very Fast': 0.8,
  };

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TTSSettings &&
        other.speechRate == speechRate &&
        other.pitch == pitch &&
        other.volume == volume &&
        other.autoPlayOnReveal == autoPlayOnReveal;
  }

  @override
  int get hashCode {
    return Object.hash(speechRate, pitch, volume, autoPlayOnReveal);
  }
}
