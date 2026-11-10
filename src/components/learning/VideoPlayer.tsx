"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { VIDEO_QUALITIES, type VideoQuality } from "@/lib/videoQualities";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Settings, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title: string;
  lessonId: string;
  isCompleted?: boolean;
  onLessonEnded?: () => Promise<boolean> | void;
  onDurationKnown?: (seconds: number) => void;
  onWatchEvent?: (event: { positionSeconds: number; durationSeconds: number;
    playbackRate: number; state: "playing" | "paused" | "seek" | "ended" }) => Promise<{ canComplete: boolean }>;
  onContinueNext?: () => void;
  hasNextLesson?: boolean;
  allowSeeking?: boolean;
}

export function VideoPlayer({
  src = "",
  poster,
  title,
  lessonId,
  isCompleted = false,
  onLessonEnded,
  onDurationKnown,
  onWatchEvent,
  onContinueNext,
  hasNextLesson = false,
  allowSeeking = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reportedDurationRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const pendingQualitySwitchRef = useRef<{ position: number; playing: boolean; rate: number } | null>(null);
  const qualitySwitchingRef = useRef(false);
  const hasStartedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([]);
  const [quality, setQuality] = useState<"original" | VideoQuality>("original");
  const [playbackError, setPlaybackError] = useState("");
  const [controlMessage, setControlMessage] = useState("");

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const furthestWatchedRef = useRef(0);
  const lastTrustedTickRef = useRef(0);
  const lastWatchTickRef = useRef(0);
  const watchQueueRef = useRef<Promise<void>>(Promise.resolve());
  const watchBusyRef = useRef(false);
  const [completionState, setCompletionState] = useState<"saving" | "saved" | "error">("saving");
  const hostedVideo = /^\/api\/media\/[^/?]+\/stream$/.test(src);
  const videoSource = quality === "original" ? src : `${src}?quality=${quality}`;

  useEffect(() => {
    if (!hostedVideo) return;
    let active = true;
    void fetch(`${src.slice(0, -"/stream".length)}/qualities`, { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!active) return;
        const available = VIDEO_QUALITIES.filter((item) => result?.available?.includes(item));
        setAvailableQualities(available);
        if (!hasStartedRef.current) {
          const preferred = (["720p", "480p", "360p", "1080p"] as const).find((item) => available.includes(item));
          if (preferred) setQuality(preferred);
        }
      })
      .catch(() => { if (active) setAvailableQualities([]); });
    return () => { active = false; };
  }, [hostedVideo, src]);

  const queueWatch = useCallback((state: "playing" | "paused" | "seek" | "ended") => {
    const video = videoRef.current;
    if (qualitySwitchingRef.current || !onWatchEvent || allowSeeking || !video || !Number.isFinite(video.duration) || video.duration <= 0)
      return Promise.resolve(null);
    const event = { positionSeconds: video.currentTime, durationSeconds: video.duration,
      playbackRate: video.playbackRate, state };
    watchBusyRef.current = true;
    const next = watchQueueRef.current.catch(() => {}).then(() => onWatchEvent(event));
    const settled = next.then(() => {}, () => {});
    watchQueueRef.current = settled;
    void settled.then(() => { if (watchQueueRef.current === settled) watchBusyRef.current = false; });
    return next;
  }, [allowSeeking, onWatchEvent]);

  const seekTo = (requested: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(requested, video.duration || duration));
    const limited = allowSeeking ? target : Math.min(target, furthestWatchedRef.current);
    if (!allowSeeking && target > limited + 0.25) {
      setControlMessage("You can replay watched sections, but cannot skip ahead.");
    }
    video.currentTime = limited;
    setCurrentTime(limited);
    lastTrustedTickRef.current = performance.now();
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Activity timer to hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isEnded) {
        setShowControls(false);
      }
    }, 2800);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => { setIsPlaying(true); setPlaybackError(""); }).catch((error: Error) => { setIsPlaying(false); setPlaybackError(error.message || "Video playback is unavailable in this browser."); });
      setIsEnded(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || qualitySwitchingRef.current) return;
    const video = videoRef.current;
    const now = performance.now();
    const elapsed = lastTrustedTickRef.current ? Math.max(0, (now - lastTrustedTickRef.current) / 1000) : 0;
    const allowedAdvance = elapsed * Math.min(Math.max(video.playbackRate, 1), 1.5) + 0.75;
    if (!allowSeeking && (video.seeking || video.currentTime > furthestWatchedRef.current + allowedAdvance)) {
      if (!video.seeking && video.currentTime > furthestWatchedRef.current + allowedAdvance) seekTo(furthestWatchedRef.current);
      return;
    }
    if (!allowSeeking && !video.paused) furthestWatchedRef.current = Math.max(furthestWatchedRef.current, video.currentTime);
    lastTrustedTickRef.current = now;
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    if (!allowSeeking && !video.paused && !document.hidden && !watchBusyRef.current && now - lastWatchTickRef.current >= 5000) {
      lastWatchTickRef.current = now;
      void queueWatch("playing").catch(() => {});
    }
  };

  const handleSeeking = () => {
    const video = videoRef.current;
    if (!video || allowSeeking || qualitySwitchingRef.current) return;
    if (video.currentTime > furthestWatchedRef.current + 0.35) seekTo(furthestWatchedRef.current);
    void queueWatch("seek").catch(() => {});
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const pending = pendingQualitySwitchRef.current;
    if (pending && Number.isFinite(videoRef.current.duration)) {
      pendingQualitySwitchRef.current = null;
      const video = videoRef.current;
      const position = Math.min(pending.position, Math.max(0, video.duration - 0.1));
      const resume = () => {
        video.playbackRate = pending.rate;
        lastTrustedTickRef.current = performance.now();
        qualitySwitchingRef.current = false;
        if (pending.playing) void video.play().catch(() => setPlaybackError("Video playback is unavailable at this quality."));
      };
      if (position > 0.1) {
        video.addEventListener("seeked", resume, { once: true });
        video.currentTime = position;
      } else resume();
    }
    setDuration(videoRef.current.duration);
    if (Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0 &&
      reportedDurationRef.current !== videoRef.current.duration) {
      reportedDurationRef.current = videoRef.current.duration;
      onDurationKnown?.(videoRef.current.duration);
    }
  };

  const saveEndedProgress = async () => {
    setCompletionState("saving");
    try {
      if (!allowSeeking && onWatchEvent && !(await queueWatch("ended"))?.canComplete) {
        setCompletionState("error");
        return;
      }
      setCompletionState(await onLessonEnded?.() === false ? "error" : "saved");
    } catch { setCompletionState("error"); }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setShowControls(true);
    void saveEndedProgress();
  };

  useEffect(() => {
    if (!onWatchEvent || allowSeeking) return;
    const onVisibility = () => {
      if (!videoRef.current || videoRef.current.paused) return;
      void queueWatch(document.hidden ? "paused" : "playing").catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [allowSeeking, onWatchEvent, queueWatch]);

  // Seek on timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const mediaDuration = videoRef.current.duration || duration;
    const newTime = Math.max(0, Math.min(pos * mediaDuration, mediaDuration));
    seekTo(newTime);
  };

  // Timeline hover preview
  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = pos / rect.width;
    setHoverPosition(pos);
    setHoverTime(percent * duration);
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSpeedSelect = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const handleQualitySelect = (nextQuality: "original" | VideoQuality) => {
    const video = videoRef.current;
    if (quality === nextQuality || !video) return;
    pendingQualitySwitchRef.current = {
      position: video.currentTime,
      playing: !video.paused,
      rate: video.playbackRate,
    };
    qualitySwitchingRef.current = true;
    setQuality(nextQuality);
    setShowQualityMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (!containerRef.current.requestFullscreen) {
        setControlMessage("Fullscreen is unavailable in this browser.");
        return;
      }
      containerRef.current.requestFullscreen()
        .then(() => { setIsFullscreen(true); setControlMessage(""); })
        .catch(() => setControlMessage("Fullscreen is unavailable in this browser."));
    } else {
      document.exitFullscreen()
        .then(() => { setIsFullscreen(false); setControlMessage(""); })
        .catch(() => setControlMessage("Unable to exit fullscreen. Press Escape to try again."));
    }
  };

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      if (videoRef.current) seekTo(videoRef.current.currentTime + 5);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      if (videoRef.current) seekTo(videoRef.current.currentTime - 5);
    } else if (e.code === "KeyM") {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
      }
    } else if (e.code === "KeyF") {
      toggleFullscreen();
    }
  }, [duration, allowSeeking]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!showSpeedMenu) return;
    const onPointerDown = (event: PointerEvent) => { if (!speedMenuRef.current?.contains(event.target as Node)) setShowSpeedMenu(false); };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowSpeedMenu(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onEscape); };
  }, [showSpeedMenu]);

  useEffect(() => {
    if (!showQualityMenu) return;
    const onPointerDown = (event: PointerEvent) => { if (!qualityMenuRef.current?.contains(event.target as Node)) setShowQualityMenu(false); };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowQualityMenu(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onEscape); };
  }, [showQualityMenu]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      data-lesson-id={lessonId}
      onMouseMove={handleMouseMove}
      onContextMenu={(event) => event.preventDefault()}
      className="relative w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden select-none group max-h-[540px] flex items-center justify-center"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSource}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={() => { if (videoRef.current && !qualitySwitchingRef.current) setDuration(videoRef.current.duration || 0); }}
        onEnded={handleEnded}
        onError={() => {
          qualitySwitchingRef.current = false;
          pendingQualitySwitchRef.current = null;
          if (quality !== "original") {
            setAvailableQualities((current) => current.filter((item) => item !== quality));
            setQuality("original");
            setControlMessage(`${quality} is unavailable. Playing the original video.`);
          } else setPlaybackError("The video could not be loaded. Please try again.");
        }}
        onPlay={() => { hasStartedRef.current = true; setIsPlaying(true); void queueWatch("playing").catch(() => {}); }}
        onPause={() => { setIsPlaying(false); if (!videoRef.current?.ended) void queueWatch("paused").catch(() => {}); }}
        onClick={togglePlay}
        onContextMenu={(event) => event.preventDefault()}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
      />

      {playbackError && <p role="alert" className="absolute left-4 right-4 top-4 rounded-lg bg-red-950/90 p-3 text-center text-xs text-white">Playback unavailable: {playbackError}</p>}
      {controlMessage && <p role="status" className="absolute left-4 right-4 top-4 rounded-lg bg-[#172033]/90 p-3 text-center text-xs text-white">{controlMessage}</p>}

      {/* Lesson Completed Overlay Modal */}
      {isEnded && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {allowSeeking ? "Preview finished" : completionState === "saving" ? "Saving your progress…" : completionState === "saved" ? "Lesson completed" : "Progress could not be confirmed"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-6">
            {allowSeeking ? `Playback of “${title}” finished.` :
              completionState === "saving" ? `Playback of “${title}” finished. Please wait while your progress is saved.` :
              completionState === "saved" ? `Your progress for “${title}” has been saved.` :
                "Your watch progress is incomplete or the connection was interrupted. Replay any unwatched sections, then try again."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {completionState === "error" && !allowSeeking && <button type="button" onClick={() => void saveEndedProgress()}
              className="px-4 py-2.5 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:bg-[#E85D2A]">
              Retry saving progress
            </button>}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                  setIsEnded(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#26344D] hover:bg-[#324566] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Lesson</span>
            </button>

            {completionState === "saved" && hasNextLesson && onContinueNext && (
              <button
                onClick={onContinueNext}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all"
              >
                <span>Continue to Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && !isEnded && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute w-16 h-16 rounded-full bg-[#FF6B35] hover:bg-[#E85D2A] text-white flex items-center justify-center shadow-xl transform hover:scale-110 active:scale-95 transition-all z-20"
          aria-label="Play video"
        >
          <Play className="w-7 h-7 fill-white ml-1" />
        </button>
      )}

      {/* Custom Bottom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-5 z-20 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Interactive Timeline Bar */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
          onPointerMove={(event) => { if (event.buttons & 1) handleTimelineClick(event); }}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          onKeyDown={(event) => {
            if (!videoRef.current) return;
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              event.stopPropagation();
              seekTo(videoRef.current.currentTime + (event.key === "ArrowRight" ? 5 : -5));
            }
          }}
          role="slider"
          tabIndex={0}
          aria-label="Video timeline"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration) || 0}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          className="relative w-full h-2 group/timeline bg-white/20 hover:h-3 rounded-full cursor-pointer mb-3 transition-all"
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#172033] text-white text-[10px] font-mono pointer-events-none border border-white/20 shadow-sm"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Current Progress Fill */}
          <div
            className="h-full bg-[#FF6B35] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Knob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/timeline:scale-100 transition-transform" />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left: Play/Pause, Time */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-[#FF6B35] transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white" />
              )}
            </button>

            {/* Time Stamp */}
            <div className="font-mono text-[11px] sm:text-xs text-slate-200">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-slate-400">/</span>
              <span className="text-slate-400">{formatTime(duration)}</span>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1 sm:gap-2 group/vol">
              <button onClick={toggleMute} className="hover:text-[#FF6B35]" aria-label={isMuted ? "Unmute video" : "Mute video"}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Video volume"
                className="w-12 sm:w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
              />
            </div>
          </div>

          {/* Right: Quality, speed and fullscreen */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {hostedVideo && (
              <div className="relative" ref={qualityMenuRef}>
                <button type="button" onClick={() => setShowQualityMenu(!showQualityMenu)}
                  aria-label="Video quality" aria-expanded={showQualityMenu}
                  className="px-2 py-0.5 rounded hover:bg-white/10 font-bold text-[11px] text-slate-200">
                  {quality === "original" ? "Original" : quality}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#172033] border border-[#26344D] rounded-xl p-1 shadow-xl flex flex-col gap-0.5 z-40 text-xs min-w-[150px]">
                    {VIDEO_QUALITIES.filter((item) => availableQualities.includes(item)).map((item) => (
                      <button key={item} type="button" onClick={() => handleQualitySelect(item)}
                        className={`px-3 py-1.5 text-left rounded-lg ${quality === item ? "bg-[#FF6B35] text-white font-bold" : "hover:bg-slate-700 text-slate-200"}`}>
                        {item}
                      </button>
                    ))}
                    <button type="button" onClick={() => handleQualitySelect("original")}
                      className={`px-3 py-1.5 text-left rounded-lg ${quality === "original" ? "bg-[#FF6B35] text-white font-bold" : "hover:bg-slate-700 text-slate-200"}`}>
                      Original quality
                    </button>
                    {availableQualities.length === 0 && <span className="px-3 py-1.5 text-slate-400">Other qualities are processing</span>}
                  </div>
                )}
              </div>
            )}
            {/* Playback Speed Menu */}
            <div className="relative" ref={speedMenuRef}>
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-0.5 rounded hover:bg-white/10 font-bold text-[11px] text-slate-200"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#172033] border border-[#26344D] rounded-xl p-1 shadow-xl flex flex-col gap-0.5 z-40 text-xs min-w-[70px]">
                  {[1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedSelect(rate)}
                      className={`px-3 py-1 text-left rounded-lg transition-colors ${
                        playbackRate === rate
                          ? "bg-[#FF6B35] text-white font-bold"
                          : "hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:text-[#FF6B35] transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
