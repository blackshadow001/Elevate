"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Pen, 
  Highlighter, 
  Type, 
  Square, 
  Circle, 
  RotateCcw, 
  Trash2, 
  X, 
  Download,
  Palette
} from "lucide-react";
import { useNotification } from "@/components/notifications/NotificationProvider";

interface WhiteboardProps {
  onClose?: () => void;
}

export function Whiteboard({ onClose }: WhiteboardProps) {
  const { notify } = useNotification();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pen" | "highlighter" | "text" | "rect" | "circle">("pen");
  const [color, setColor] = useState("#FF6B35");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imageData]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  }, [saveState]);

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    notify({
      type: "info",
      title: "Whiteboard Cleared",
      message: "Canvas reset to blank sheet.",
    });
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    startPos.current = { x, y };
    setIsDrawing(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "text") {
      ctx.fillStyle = color;
      ctx.font = "16px sans-serif";
      ctx.fillText("Server Action -> Database", x, y);
      saveState();
      setIsDrawing(false);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "highlighter") {
      ctx.strokeStyle = `${color}44`;
      ctx.lineWidth = 14;
      ctx.lineCap = "square";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "rect") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      const width = x - startPos.current.x;
      const height = y - startPos.current.y;
      ctx.strokeRect(startPos.current.x, startPos.current.y, width, height);
    } else if (tool === "circle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      const radius = Math.sqrt(
        Math.pow(x - startPos.current.x, 2) + Math.pow(y - startPos.current.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveState();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#172033] text-white flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tool === "pen" ? "bg-[#FF6B35] text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
            }`}
            title="Pen Tool"
          >
            <Pen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool("highlighter")}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tool === "highlighter" ? "bg-[#FF6B35] text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool("text")}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tool === "text" ? "bg-[#FF6B35] text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
            }`}
            title="Text Annotate"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool("rect")}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tool === "rect" ? "bg-[#FF6B35] text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setTool("circle")}
            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tool === "circle" ? "bg-[#FF6B35] text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          {([ ["#FF6B35", "orange"], ["#172033", "navy"], ["#16A34A", "green"], ["#2563EB", "blue"], ["#DC2626", "red"] ] as const).map(([c, name]) => (
            <button
              key={c}
              type="button"
              aria-label={`Use ${name} color`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                color === c ? "scale-125 ring-2 ring-white" : "opacity-80"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* History actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-slate-200 cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-slate-200 cursor-pointer"
            title="Clear Whiteboard"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 cursor-pointer"
              title="Close Whiteboard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full relative min-h-[360px] bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}
