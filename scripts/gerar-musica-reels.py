"""Trilha original do Reels. Não usa amostra de música existente."""
import math
import subprocess
import sys
import wave
from array import array
from pathlib import Path

import numpy as np

SR = 44100
BPM = 78
BEAT = 60 / BPM
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("assets/music/reels-comercial.mp3")
DUR = 72


def nota(nome):
    base = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    oitava = int(nome[-1])
    acidente = nome[1:-1]
    semitom = base[nome[0]] + (1 if "#" in acidente else -1 if "b" in acidente else 0)
    return 440 * 2 ** ((semitom - 9) / 12 + (oitava - 4))


def curva(n, ataque, cauda):
    t = np.arange(n) / SR
    dur = n / SR
    sobe = np.clip(t / max(ataque, 0.001), 0, 1)
    desce = np.clip((dur - t) / max(cauda, 0.001), 0, 1)
    return (sobe ** 2) * (desce ** 1.4)


def voz(freq, dur, volume, harmonicos, ataque, cauda, desafino=0.0):
    n = max(1, int(SR * dur))
    t = np.arange(n) / SR
    y = np.zeros(n)
    for i, peso in enumerate(harmonicos, start=1):
        y += peso * np.sin(2 * math.pi * freq * i * t * (1 + desafino))
        if desafino:
            y += peso * 0.65 * np.sin(2 * math.pi * freq * i * t * (1 - desafino))
    return y * curva(n, ataque, cauda) * volume


def somar(trilha, inicio, trecho):
    i = int(inicio * SR)
    fim = min(len(trilha), i + len(trecho))
    if i >= len(trilha) or fim <= i:
        return
    trilha[i:fim] += trecho[: fim - i]


def main():
    trilha = np.zeros(int(SR * DUR))
    acordes = [
        (["C3", "E3", "G3", "B3"], 4),
        (["A2", "C3", "E3", "G3"], 4),
        (["F2", "A2", "C3", "E3"], 4),
        (["G2", "B2", "D3", "F3"], 4),
    ]
    melodia = [
        ("E4", 1.5), ("G4", 0.5), ("B4", 2),
        ("A4", 1), ("G4", 1), ("E4", 2),
        ("F4", 1.5), ("A4", 0.5), ("C5", 2),
        ("B4", 1), ("G4", 1), ("D4", 2),
    ]
    baixo_notas = ["C2", "A1", "F1", "G1"]

    compassos = int(DUR / (16 * BEAT)) + 1
    for volta in range(compassos):
        marca = volta * 16 * BEAT
        for indice, (nomes, beats) in enumerate(acordes):
            quando = marca + sum(b for _, b in acordes[:indice]) * BEAT
            for nome in nomes:
                somar(trilha, quando, voz(nota(nome), beats * BEAT * 1.05, 0.045, (1, 0.28, 0.08), 0.35, 0.9, 0.004))
            somar(trilha, quando, voz(nota(baixo_notas[indice]), beats * BEAT, 0.07, (1, 0.15), 0.08, 0.35))
        ponteiro = marca
        for nome, beats in melodia:
            somar(trilha, ponteiro, voz(nota(nome), beats * BEAT * 0.92, 0.055, (1, 0.22, 0.06, 0.02), 0.04, 0.28))
            ponteiro += beats * BEAT

    pico = np.max(np.abs(trilha)) or 1
    trilha = np.tanh(trilha / pico * 1.3) * 0.86
    fade_in = int(SR * 1.4)
    fade_out = int(SR * 2.8)
    trilha[:fade_in] *= np.linspace(0, 1, fade_in) ** 2
    trilha[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2

    pcm = np.clip(trilha * 32767, -32767, 32767).astype(np.int16)
    wav = OUT.with_suffix(".wav")
    wav.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(wav), "w") as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(SR)
        arquivo.writeframes(array("h", pcm).tobytes())

    if OUT.suffix == ".mp3":
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(OUT)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        wav.unlink()
    print(OUT)


if __name__ == "__main__":
    main()
