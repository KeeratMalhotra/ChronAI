"""Tests for the voice TTS truncation guard.

Google Cloud TTS rejects inputs over ~5000 bytes; on failure the reply used to
go completely silent. ``_truncate_for_speech`` trims long replies to a safe
size on a natural boundary so a long reply is still spoken (trimmed).

NOTE: ``app.main`` is imported lazily inside each test (not at module top
level) so the import happens while the autouse auth mock is active, matching
how the shared fixtures import the app. Importing it at collection time would
bind the real ``verify_google_token`` and pollute other tests.
"""


def _helpers():
    from app.main import _truncate_for_speech, _TTS_MAX_BYTES
    return _truncate_for_speech, _TTS_MAX_BYTES


def test_short_text_unchanged():
    _truncate_for_speech, _ = _helpers()
    text = "Here is a short reply."
    assert _truncate_for_speech(text) == text


def test_empty_text_unchanged():
    _truncate_for_speech, _ = _helpers()
    assert _truncate_for_speech("") == ""


def test_long_text_truncated_under_cap():
    _truncate_for_speech, _TTS_MAX_BYTES = _helpers()
    long = "This is a full sentence. " * 400  # ~10k bytes
    out = _truncate_for_speech(long)
    assert len(out.encode("utf-8")) <= _TTS_MAX_BYTES
    assert len(out) > 0


def test_truncation_prefers_sentence_boundary():
    _truncate_for_speech, _ = _helpers()
    long = "Alpha beta gamma. " * 400
    out = _truncate_for_speech(long)
    # Should end cleanly on a sentence terminator.
    assert out.endswith(".")


def test_truncation_falls_back_to_word_boundary():
    _truncate_for_speech, _TTS_MAX_BYTES = _helpers()
    # One giant "sentence" with no terminators, only spaces.
    long = ("word " * 2000).strip()
    out = _truncate_for_speech(long)
    assert len(out.encode("utf-8")) <= _TTS_MAX_BYTES
    # No dangling partial word split by the byte cut (ends on a full word).
    assert not out.endswith("wor")
    assert out.endswith("word")


def test_custom_cap_respected():
    _truncate_for_speech, _ = _helpers()
    text = "One. Two. Three. Four. Five. Six."
    out = _truncate_for_speech(text, max_bytes=12)
    assert len(out.encode("utf-8")) <= 12
    assert out  # non-empty


def test_multibyte_not_split():
    _truncate_for_speech, _TTS_MAX_BYTES = _helpers()
    # Emoji-free multibyte text; ensure we never produce invalid partial chars.
    text = "café " * 2000
    out = _truncate_for_speech(text)
    # Round-trips cleanly (no UnicodeDecodeError, no replacement chars added).
    assert "\ufffd" not in out
    assert len(out.encode("utf-8")) <= _TTS_MAX_BYTES
