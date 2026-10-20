export function formatVideoDuration(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const remaining = String(whole % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remaining}` : `${minutes}:${remaining}`;
}

export function measureVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let finished = false;
    const finish = (seconds?: number) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      if (seconds && Number.isFinite(seconds) && seconds > 0 && seconds <= 86_400) resolve(Math.round(seconds));
      else reject(new Error("Could not read this video's duration. Check that the file plays, then try again."));
    };
    const timeout = setTimeout(() => finish(), 30_000);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) finish(video.duration);
      else video.currentTime = 1e101;
    };
    video.ondurationchange = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) finish(video.duration);
    };
    video.onerror = () => finish();
    video.src = url;
  });
}
