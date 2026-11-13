"""Mux the locally narrated slides into private, playable MP4 lesson assets."""

import sys
import wave
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "output" / "demo-courses"
sys.path.insert(0, str(ROOT / "output" / "video-tools"))
import imageio_ffmpeg  # noqa: E402

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

for folder in sorted(BASE.iterdir()):
    if not folder.is_dir() or not (folder / "script.json").exists():
        continue
    segments = sorted(folder.glob("slide-*.wav"))
    if len(segments) != len(list(folder.glob("slide-*.png"))):
        raise RuntimeError(f"Missing narrated slide in {folder}")
    concat = ["ffconcat version 1.0"]
    params = None
    frames = []
    duration = 0.0
    for i, path in enumerate(segments, 1):
        with wave.open(str(path), "rb") as source:
            if params is None:
                params = source.getparams()
            elif source.getparams()[:3] != params[:3]:
                raise RuntimeError(f"Audio format differs in {path}")
            seconds = source.getnframes() / source.getframerate() + 1.0
            duration += seconds
            frames.append(source.readframes(source.getnframes()))
            frames.append(bytes(source.getframerate() * source.getnchannels() * source.getsampwidth()))
        slide = folder / f"slide-{i:02}.png"
        concat.extend([f"file '{slide.as_posix()}'", f"duration {seconds:.3f}"])
    concat.append(f"file '{(folder / f'slide-{len(segments):02}.png').as_posix()}'")
    (folder / "slides.ffconcat").write_text("\n".join(concat) + "\n", encoding="utf-8")
    with wave.open(str(folder / "narration.wav"), "wb") as output:
        output.setparams(params)
        for frame in frames:
            output.writeframes(frame)
    target = folder / "lesson.mp4"
    command = [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0",
               "-i", str(folder / "slides.ffconcat"), "-i", str(folder / "narration.wav"),
               "-vf", "fps=2,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
               "-c:a", "aac", "-b:a", "64k", "-t", f"{duration:.3f}", "-movflags", "+faststart", str(target)]
    subprocess.run(command, check=True)
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", str(target),
                    "-t", "45", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30",
                    "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart",
                    str(folder / "preview.mp4")], check=True)
    print(f"{folder.name}: {duration:.1f}s, {target.stat().st_size} bytes")
