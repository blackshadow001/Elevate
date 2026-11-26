#!/usr/bin/env python3
r"""
Lightweight Offline OpenAI-Compatible Local LLM Server for Elevate Chatbot.
Loads Qwen/Qwen2.5-1.5B-Instruct from D:\HuggingFaceCache onto CUDA RTX 3060 Ti (or CPU fallback).
Designed with a bounded concurrency lock so concurrent requests queue safely without GPU OOM.
"""

import asyncio
import os
import time
from typing import List, Optional

os.environ.setdefault("HF_HOME", r"D:\HuggingFaceCache")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
os.environ.setdefault("HF_HUB_OFFLINE", os.environ.get("HF_HUB_OFFLINE", "1"))

import torch
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = os.environ.get("LOCAL_LLM_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
HOST = os.environ.get("LOCAL_LLM_HOST", "127.0.0.1")
PORT = int(os.environ.get("LOCAL_LLM_PORT", "11435"))

app = FastAPI(title="Elevate Offline LLM Inference Server")

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

print(f"[Elevate LLM] Loading {MODEL_ID} on {device} ({dtype}) from {os.environ['HF_HOME']}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    dtype=dtype,
    local_files_only=True,
).to(device)
model.eval()

# Warm up CUDA kernels silently at startup so the first user query is fast
with torch.inference_mode():
    warm_ids = tokenizer(["Hello"], return_tensors="pt").to(model.device)
    model.generate(**warm_ids, max_new_tokens=4, do_sample=False, pad_token_id=tokenizer.eos_token_id)

print("[Elevate LLM] Model loaded, warmed up, and ready for requests.")

# Strict concurrency guard on GPU generation so queued bursts never trigger CUDA OOM
inference_lock = asyncio.Semaphore(1)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.35


def _run_generation(messages: List[ChatMessage], max_tokens: int, temperature: float) -> str:
    formatted = [{"role": m.role, "content": m.content} for m in messages]
    prompt_text = tokenizer.apply_chat_template(
        formatted,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer([prompt_text], return_tensors="pt").to(model.device)
    input_len = inputs["input_ids"].shape[1]

    do_sample = temperature > 0.05
    gen_kwargs = {
        "max_new_tokens": min(max(64, max_tokens), 768),
        "do_sample": do_sample,
        "pad_token_id": tokenizer.eos_token_id,
    }
    if do_sample:
        gen_kwargs["temperature"] = temperature
        gen_kwargs["top_p"] = 0.9

    with torch.inference_mode():
        output_ids = model.generate(**inputs, **gen_kwargs)

    generated_ids = output_ids[0][input_len:]
    return tokenizer.decode(generated_ids, skip_special_tokens=True).strip()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "device": device,
        "cuda_available": torch.cuda.is_available(),
    }


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    async with inference_lock:
        reply_text = await asyncio.to_thread(
            _run_generation,
            req.messages,
            req.max_tokens or 512,
            req.temperature if req.temperature is not None else 0.35,
        )

    return {
        "id": f"chatcmpl-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": MODEL_ID,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": reply_text},
                "finish_reason": "stop",
            }
        ],
    }


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT, log_level="warning")
