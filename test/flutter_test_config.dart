import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

/// Allow a tiny fraction of pixels to differ from the golden — absorbs
/// sub-pixel font anti-aliasing drift between macOS versions / runners
/// without masking real visual regressions.
const double _pixelTolerance = 0.005; // 0.5%

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  goldenFileComparator = _TolerantGoldenComparator(
    Uri.parse('${Directory.current.path}/test/test.dart'),
    _pixelTolerance,
  );
  await testMain();
}

class _TolerantGoldenComparator extends LocalFileComparator {
  _TolerantGoldenComparator(super.testFile, this.tolerance);

  final double tolerance;

  @override
  Future<bool> compare(Uint8List imageBytes, Uri golden) async {
    final result = await GoldenFileComparator.compareLists(
      imageBytes,
      await getGoldenBytes(golden),
    );
    if (result.passed || result.diffPercent <= tolerance) return true;
    final error = await generateFailureOutput(result, golden, basedir);
    throw FlutterError(error);
  }
}
