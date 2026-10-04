"""Trilha original e animada do Reels. Sem amostra de música existente."""
import math
import subprocess
import sys
import wave
from array import array
from pathlib import Path

import numpy as np

SR = 44100
BPM = 118
BEAT = 60 / BPM
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("assets/music/reels-comercial.mp3")
DUR = 70
rng = np.random.default_rng(7)


def nota(nome):
    base = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    oitava = int(nome[-1])
    miolo = nome[1:-1]
    semitom = base[nome[0]] + (1 if "#" in miolo else -1 if "b" in miolo else 0)
    return 440 * 2 ** ((semitom - 9) / 12 + (oitava - 4))


def somar(trilha, inicio, trecho):
    i = int(inicio * SR)
    fim = min(len(trilha), i + len(trecho))
    if i < len(trilha) and fim > i:
        trilha[i:fim] += trecho[: fim - i]


def kick():
    n = int(SR * 0.22)
    t = np.arange(n) / SR
    freq = 48 + 130 * np.exp(-t * 32)
    fase = 2 * math.pi * np.cumsum(freq) / SR
    return np.sin(fase) * np.exp(-t * 14) * 0.72


def clap():
    n = int(SR * 0.12)
    t = np.arange(n) / SR
    ruido = rng.uniform(-1, 1, n)
    corpo = np.diff(ruido, prepend=ruido[0])
    return corpo * np.exp(-t * 28) * 0.34


def hat(aberto=False):
    n = int(SR * (0.09 if aberto else 0.035))
    t = np.arange(n) / SR
    ruido = rng.uniform(-1, 1, n)
    agudo = np.diff(ruido, prepend=ruido[0])
    return agudo * np.exp(-t * (18 if aberto else 70)) * (0.16 if aberto else 0.11)


def pluck(freq, dur, volume):
    n = max(1, int(SR * dur))
    t = np.arange(n) / SR
    y = (
        np.sin(2 * math.pi * freq * t)
        + 0.35 * np.sin(2 * math.pi * freq * 2 * t)
        + 0.12 * np.sin(2 * math.pi * freq * 3 * t)
    )
    return y * np.exp(-t * 7.5) * volume


def baixo(freq, dur):
    n = max(1, int(SR * dur))
    t = np.arange(n) / SR
    y = np.sin(2 * math.pi * freq * t) + 0.25 * np.sin(2 * math.pi * freq * 2 * t)
    env = np.minimum(t / 0.01, 1) * np.exp(-t * 5)
    return y * env * 0.28


def main():
    trilha = np.zeros(int(SR * DUR))
    acordes = ["D3", "G2", "A2", "Bm"]
    raizes = ["D2", "G1", "A1", "B1"]
    melodia = [
        ("F#4", 0.5), ("A4", 0.5), ("D5", 1), ("A4", 0.5), ("F#4", 0.5),
        ("G4", 0.5), ("B4", 0.5), ("D5", 1), ("B4", 1),
        ("E4", 0.5), ("A4", 0.5), ("C#5", 1), ("A4", 0.5), ("E4", 0.5),
        ("F#4", 0.5), ("A4", 0.5), ("D5", 1), ("C#5", 0.5), ("B4", 0.5),
    ]
    # Bm isn't a note name; melody uses real notes. Chord tones for pad:
    pads = [
        ["D3", "F#3", "A3"],
        ["G2", "B2", "D3"],
        ["A2", "C#3", "E3"],
        ["B2", "D3", "F#3"],
    ]

    total_beats = int(DUR / BEAT)
    for batida in range(total_beats):
        quando = batida * BEAT
        casa = batida % 8
        compasso = (batida // 4) % 4
        lift = 1.15 if quando > DUR - 12 else 1
        if casa % 2 == 0:
            somar(trilha, quando, kick() * (1.05 if casa % 4 == 0 else 0.85))
        if casa in (2, 6):
            somar(trilha, quando, clap())
        if casa % 2 == 1:
            somar(trilha, quando, hat(aberto=quando > DUR - 12))
        if casa % 2 == 0:
            somar(trilha, quando, baixo(nota(raizes[compasso]), BEAT * 0.9) * lift)
        if casa == 0:
            for nome in pads[compasso]:
                n = int(SR * BEAT * 4)
                t = np.arange(n) / SR
                freq = nota(nome)
                y = np.sin(2 * math.pi * freq * t) * np.exp(-t * 0.7) * 0.05 * lift
                somar(trilha, quando, y)

    ponteiro = 0
    volta = 0
    while ponteiro < DUR - 1:
        oitava_extra = 2 if ponteiro > DUR - 14 else 1
        for nome, beats in melodia:
            freq = nota(nome) * oitava_extra / 1
            if oitava_extra == 2:
                freq = nota(nome) * 2
            somar(trilha, ponteiro, pluck(freq if oitava_extra == 1 else nota(nome), beats * BEAT * 0.95, 0.16 if oitava_extra == 1 else 0.1))
            if oitava_extra == 2:
                somar(trilha, ponteiro, pluck(nota(nome) * 2, beats * BEAT * 0.7, 0.07))
            ponteiro += beats * BEAT
            if ponteiro >= DUR - 0.4:
                break
        volta += 1
        if volta > 20:
            break

    pico = np.max(np.abs(trilha)) or 1
    trilha = np.tanh(trilha / pico * 1.45) * 0.9
    entra = int(SR * 0.35)
    sai = int(SR * 2.2)
    trilha[:entra] *= np.linspace(0, 1, entra)
    trilha[-sai:] *= np.linspace(1, 0, sai)

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
