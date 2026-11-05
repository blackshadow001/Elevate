"use client";

import { useEffect, useRef, useState } from "react";

type Segment = { id: string; start: number; end: number };
type Cue = { id: string; kind: "caption" | "overlay"; text: string; start: number; end: number; x: number; y: number };

function supportedRecording(): { mimeType: string; extension: "mp4" | "webm" } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const mp4 = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
  if (mp4) return { mimeType: mp4, extension: "mp4" };
  const webm = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    .find((type) => MediaRecorder.isTypeSupported(type));
  return webm ? { mimeType: webm, extension: "webm" } : null;
}

function drawFrame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, cues: Cue[]) {
  const { width, height } = ctx.canvas;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.round(height * 0.045)}px sans-serif`;
  ctx.lineWidth = Math.max(3, Math.round(height * 0.008));
  for (const cue of cues) {
    if (!cue.text || video.currentTime < cue.start || video.currentTime > cue.end) continue;
    const x = cue.kind === "caption" ? width / 2 : width * cue.x / 100;
    const y = cue.kind === "caption" ? height * 0.91 : height * cue.y / 100;
    ctx.strokeStyle = "#111827";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(cue.text, x, y, width * 0.9);
    ctx.fillText(cue.text, x, y, width * 0.9);
  }
}

export function VideoEditingStudio({ onClose, onExport }: { onClose: () => void; onExport: (file: File, durationSeconds: number) => void }) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const captureRef = useRef<MediaStream | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [cues, setCues] = useState<Cue[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setDuration(0);
    setSegments([]);
    setCues([]);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => captureRef.current?.getTracks().forEach((track) => track.stop()), []);

  const beginCapture = async (kind: "screen" | "camera") => {
    setError("");
    try {
      const format = supportedRecording();
      if (!format) throw new Error("Recording needs a browser with MP4 or WebM MediaRecorder support.");
      const stream = kind === "screen"
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      captureRef.current = stream;
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: format.mimeType });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        captureRef.current = null;
        setCapturing(false);
        if (chunks.length) setFile(new File(chunks, `elevate-recording-${Date.now()}.${format.extension}`, { type: `video/${format.extension}` }));
      };
      stream.getVideoTracks()[0]?.addEventListener("ended", () => { if (recorder.state === "recording") recorder.stop(); });
      recorder.start(1000);
      setCapturing(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not start recording."); }
  };

  const updateSegment = (id: string, key: "start" | "end", value: number) =>
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, [key]: value } : segment));
  const updateCue = (id: string, patch: Partial<Cue>) =>
    setCues((current) => current.map((cue) => cue.id === id ? { ...cue, ...patch } : cue));

  const exportVideo = async () => {
    if (!sourceUrl || !file || !duration || !segments.length) return;
    const clips = segments.filter((segment) => Number.isFinite(segment.start) && Number.isFinite(segment.end)
      && segment.start >= 0 && segment.end <= duration + 0.1 && segment.end - segment.start >= 0.1);
    if (clips.length !== segments.length) { setError("Each kept section needs a valid start and end within the video."); return; }
    if (cues.some((cue) => cue.start < 0 || cue.end > duration || cue.end <= cue.start || cue.text.length > 120)) {
      setError("Check the text and timing for each caption and overlay (120 characters maximum)."); return;
    }
    const format = supportedRecording();
    if (!format) { setError("Export needs a browser with MP4 or WebM MediaRecorder support."); return; }
    setRendering(true);
    setProgress(0);
    setError("");
    const video = document.createElement("video");
    video.preload = "auto";
    video.playsInline = true;
    video.src = sourceUrl;
    let audioContext: AudioContext | null = null;
    let output: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("The video could not be decoded for export."));
        video.load();
      });
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1920 / video.videoWidth, 1080 / video.videoHeight);
      canvas.width = Math.max(2, Math.round(video.videoWidth * scale / 2) * 2);
      canvas.height = Math.max(2, Math.round(video.videoHeight * scale / 2) * 2);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser cannot create a video canvas.");
      audioContext = new AudioContext();
      const audio = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      audio.connect(destination);
      await audioContext.resume();
      const canvasStream = canvas.captureStream(30);
      output = new MediaStream([...canvasStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
      const chunks: Blob[] = [];
      recorder = new MediaRecorder(output, { mimeType: format.mimeType, videoBitsPerSecond: 4_000_000 });
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.start(1000);
      const total = clips.reduce((sum, clip) => sum + clip.end - clip.start, 0);
      let completed = 0;
      for (const clip of clips) {
        if (Math.abs(video.currentTime - clip.start) > 0.02) {
          await new Promise<void>((resolve) => { video.onseeked = () => resolve(); video.currentTime = clip.start; });
        }
        drawFrame(ctx, video, cues);
        await video.play();
        await new Promise<void>((resolve, reject) => {
          let lastTime = video.currentTime;
          let lastAdvance = Date.now();
          const frame = () => {
            if (video.error) { reject(new Error("Video decoding failed during export.")); return; }
            if (video.currentTime > lastTime + 0.01) { lastTime = video.currentTime; lastAdvance = Date.now(); }
            if (Date.now() - lastAdvance > 30_000) { reject(new Error("Video export stalled. Try a shorter file.")); return; }
            drawFrame(ctx, video, cues);
            setProgress(Math.min(99, Math.round((completed + Math.max(0, video.currentTime - clip.start)) / total * 100)));
            if (video.currentTime >= clip.end || video.ended) { video.pause(); resolve(); return; }
            requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
        completed += clip.end - clip.start;
      }
      const finished = new Promise<void>((resolve, reject) => {
        recorder!.onstop = () => resolve();
        recorder!.onerror = () => reject(new Error("Video export failed."));
      });
      recorder.requestData();
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      recorder.stop();
      await finished;
      const result = new File(chunks, `elevate-edited-${Date.now()}.${format.extension}`, { type: `video/${format.extension}` });
      if (!result.size) throw new Error("The browser produced an empty video. Try a longer kept section or another browser.");
      if (result.size > 1_000_000_000) throw new Error("Edited video exceeds the 1 GB upload limit. Shorten the kept sections.");
      setProgress(100);
      onExport(result, total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Video export failed.");
    } finally {
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (recorder?.state === "recording") recorder.stop();
      output?.getTracks().forEach((track) => track.stop());
      await audioContext?.close().catch(() => {});
      setRendering(false);
    }
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F172A]/80 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Video editing studio">
    <div className="mx-auto max-w-6xl space-y-6 rounded-3xl bg-white p-5 text-[#172033] shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">Video Studio</h2>
        <p className="mt-1 text-sm text-[#64748B]">Record or import a video, keep the sections you want, add timed text, then export to this lesson.</p></div>
        <button type="button" disabled={rendering} onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-bold">Close</button></div>
      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white">Import MP4 or WebM
          <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={rendering || capturing} onChange={(event) => {
            const selected = event.target.files?.[0]; event.target.value = "";
            if (!selected) return;
            if (selected.size > 1_000_000_000) { setError("Choose a video no larger than 1 GB."); return; }
            setFile(selected); setError("");
          }} /></label>
        <button type="button" disabled={rendering || capturing} onClick={() => void beginCapture("screen")} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Record screen</button>
        <button type="button" disabled={rendering || capturing} onClick={() => void beginCapture("camera")} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Record camera</button>
        {capturing && <button type="button" onClick={() => recorderRef.current?.stop()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Stop recording</button>}
      </div>
      {sourceUrl && <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        <div className="space-y-3"><div className="relative overflow-hidden rounded-2xl bg-black">
          <video ref={previewRef} src={sourceUrl} controls className="aspect-video w-full" onLoadedMetadata={(event) => {
            const value = event.currentTarget.duration;
            if (!Number.isFinite(value)) event.currentTarget.currentTime = 1e101;
          }} onDurationChange={(event) => {
            const value = event.currentTarget.duration;
            if (Number.isFinite(value) && value > 0 && !duration) { setDuration(value); setSegments([{ id: crypto.randomUUID(), start: 0, end: Math.floor(value * 10) / 10 }]); }
          }} onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} />
          {cues.filter((cue) => cue.start <= time && cue.end >= time).map((cue) =>
            <span key={cue.id} className="pointer-events-none absolute max-w-[90%] -translate-x-1/2 text-center text-sm font-bold text-white [text-shadow:0_2px_3px_black,0_-2px_3px_black] sm:text-xl"
              style={{ left: `${cue.kind === "caption" ? 50 : cue.x}%`, top: `${cue.kind === "caption" ? 86 : cue.y}%` }}>{cue.text}</span>)}
        </div>
          <div className="space-y-1" aria-label="Video editing timeline">
            <div className="relative h-4 overflow-hidden rounded bg-slate-200" title="Kept video sections">
              {duration > 0 && segments.map((segment) => <span key={segment.id} className="absolute top-0 h-full bg-[#FF6B35]" style={{ left: `${segment.start / duration * 100}%`, width: `${Math.max(0, segment.end - segment.start) / duration * 100}%` }} />)}
              {duration > 0 && <span className="absolute top-0 h-full w-0.5 bg-[#172033]" style={{ left: `${time / duration * 100}%` }} />}
            </div>
            <div className="relative h-2 overflow-hidden rounded bg-slate-100" title="Captions and overlays">
              {duration > 0 && cues.map((cue) => <span key={cue.id} className={`absolute top-0 h-full ${cue.kind === "caption" ? "bg-blue-500" : "bg-purple-500"}`} style={{ left: `${cue.start / duration * 100}%`, width: `${Math.max(0, cue.end - cue.start) / duration * 100}%` }} />)}
            </div>
            <p className="text-xs text-[#64748B]">Orange: kept video · Blue: captions · Purple: overlays</p>
          </div>
          <p className="text-xs text-[#64748B]">Preview cues on the source timeline. Export joins kept sections and burns text into an MP4 (or WebM fallback) at up to 1080p. Export runs at playback speed in this browser.</p></div>
        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          <section className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold">Kept sections</h3>
            <button type="button" onClick={() => setSegments((current) => [...current, { id: crypto.randomUUID(), start: Math.min(time, duration), end: duration }])} className="text-sm font-bold text-[#FF6B35]">+ Add section</button></div>
            <p className="text-xs text-[#64748B]">Set the start and end of each section. Export joins them in this order; omitted parts are cut.</p>
            {segments.map((segment, index) => <div key={segment.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-xl border p-3 text-xs">
              <label>Start (s)<input type="number" min={0} max={duration} step="0.1" value={segment.start} onChange={(event) => updateSegment(segment.id, "start", Number(event.target.value))} className="mt-1 w-full rounded-lg border p-2" /></label>
              <label>End (s)<input type="number" min={0} max={duration} step="0.1" value={segment.end} onChange={(event) => updateSegment(segment.id, "end", Number(event.target.value))} className="mt-1 w-full rounded-lg border p-2" /></label>
              <button type="button" aria-label={`Remove section ${index + 1}`} onClick={() => setSegments((current) => current.filter((entry) => entry.id !== segment.id))} className="rounded-lg border px-2 py-2">×</button>
            </div>)}
          </section>
          <section className="space-y-3"><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setCues((current) => [...current, { id: crypto.randomUUID(), kind: "caption", text: "", start: Math.floor(time), end: Math.min(duration, Math.floor(time) + 3), x: 50, y: 86 }])} className="text-sm font-bold text-[#FF6B35]">+ Caption</button>
            <button type="button" onClick={() => setCues((current) => [...current, { id: crypto.randomUUID(), kind: "overlay", text: "", start: Math.floor(time), end: Math.min(duration, Math.floor(time) + 3), x: 50, y: 20 }])} className="text-sm font-bold text-[#FF6B35]">+ Text overlay</button></div>
            {cues.map((cue, index) => <div key={cue.id} className="space-y-2 rounded-xl border p-3 text-xs"><div className="flex justify-between"><strong>{cue.kind === "caption" ? "Caption" : "Overlay"} {index + 1}</strong><button type="button" onClick={() => setCues((current) => current.filter((entry) => entry.id !== cue.id))}>Remove</button></div>
              <input value={cue.text} maxLength={120} placeholder="Text" onChange={(event) => updateCue(cue.id, { text: event.target.value })} className="w-full rounded-lg border p-2" />
              <div className="grid grid-cols-2 gap-2"><label>Start (s)<input type="number" min={0} max={duration} step="0.1" value={cue.start} onChange={(event) => updateCue(cue.id, { start: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label>
                <label>End (s)<input type="number" min={0} max={duration} step="0.1" value={cue.end} onChange={(event) => updateCue(cue.id, { end: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label></div>
              {cue.kind === "overlay" && <div className="grid grid-cols-2 gap-2"><label>Horizontal (%)<input type="number" min={5} max={95} value={cue.x} onChange={(event) => updateCue(cue.id, { x: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label>
                <label>Vertical (%)<input type="number" min={5} max={95} value={cue.y} onChange={(event) => updateCue(cue.id, { y: Number(event.target.value) })} className="mt-1 w-full rounded-lg border p-2" /></label></div>}
            </div>)}
          </section>
        </div>
      </div>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {rendering && <div role="status" className="text-sm">Rendering {progress}%<progress max={100} value={progress} className="mt-1 w-full accent-[#FF6B35]" /></div>}
      <div className="flex justify-end"><button type="button" disabled={!sourceUrl || rendering || capturing || !duration} onClick={() => void exportVideo()}
        className="rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{rendering ? "Rendering…" : "Export and upload to lesson"}</button></div>
    </div>
  </div>;
}
