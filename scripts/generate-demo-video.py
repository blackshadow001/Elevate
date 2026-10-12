"""Generate a small, local video used to exercise the mock lesson player."""

from pathlib import Path
import cv2
import numpy as np

output = Path(__file__).resolve().parents[1] / "public" / "videos" / "lesson-demo.webm"
output.parent.mkdir(parents=True, exist_ok=True)
fps = 12
duration = 12
writer = cv2.VideoWriter(str(output), cv2.VideoWriter_fourcc(*"VP80"), fps, (960, 540))
if not writer.isOpened():
    raise RuntimeError("OpenCV VP8/WebM encoder is unavailable")

for frame_number in range(fps * duration):
    progress = frame_number / (fps * duration - 1)
    frame = np.full((540, 960, 3), (51, 32, 23), dtype=np.uint8)
    cv2.rectangle(frame, (0, 0), (960, 540), (57, 107, 255), 12)
    cv2.putText(frame, "ELEVATE", (72, 116), cv2.FONT_HERSHEY_SIMPLEX, 1.7, (245, 245, 255), 4, cv2.LINE_AA)
    cv2.putText(frame, "Demo lesson playback", (72, 257), cv2.FONT_HERSHEY_SIMPLEX, 1.6, (255, 255, 255), 3, cv2.LINE_AA)
    cv2.putText(frame, "Sample media for player interaction testing", (74, 316), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (200, 206, 215), 2, cv2.LINE_AA)
    cv2.rectangle(frame, (72, 418), (888, 432), (83, 96, 117), -1)
    cv2.rectangle(frame, (72, 418), (72 + int(816 * progress), 432), (53, 107, 255), -1)
    writer.write(frame)

writer.release()
print(output)
