$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$base = Join-Path (Split-Path $PSScriptRoot -Parent) 'output\demo-courses'
$speaker = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$speaker.Rate = -1
try {
    foreach ($folder in Get-ChildItem -LiteralPath $base -Directory) {
        $slides = Get-Content -LiteralPath (Join-Path $folder.FullName 'script.json') -Raw | ConvertFrom-Json
        for ($i = 0; $i -lt $slides.Count; $i++) {
            $path = Join-Path $folder.FullName ('slide-{0:D2}.wav' -f ($i + 1))
            $speaker.SetOutputToWaveFile($path)
            $speaker.Speak([string]$slides[$i].narration)
            $speaker.SetOutputToDefaultAudioDevice()
        }
        Write-Output "Narrated $($folder.Name)"
    }
} finally { $speaker.Dispose() }
