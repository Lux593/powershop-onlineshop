# Hero-Clip (KI-generiert)

Der Loop im Hero der Startseite ist **KI-generiert** und aus einem vorhandenen Foto entstanden. Diese Notiz hält fest, woher er kommt, wie er
gebaut wurde und was vor dem Livegang noch geklärt werden muss.

## Herkunft

| | |
|---|---|
| Startbild | `assets/hero-ride-road.png` (Road Glide, Fahrer und Beifahrerin auf Bergstraße), 1024 × 576 |
| Datum | 2. Oktober 2026 |
| Werkzeug | Higgsfield |
| Schritt 1 | Hochskalieren des Startbilds auf 3840 × 2160 (`bytedance_image_upscale`) |
| Schritt 2 | Bild-zu-Video mit **Kling v3.0**, Modus `std`, 8 s, 16:9, **ohne Ton**, Start- und Endbild identisch |
| Prompt | Slow cinematic camera move that gently pushes in and settles back to the exact starting frame, two riders on a Harley-Davidson Road Glide cruising along a mountain highway in warm afternoon light, subtle wind, road and guardrail motion blur, background hills drifting slowly, photoreal, no text, no new logos, bike design unchanged, wheels, fairing and helmets stay consistent |
| Rohmaterial | 1280 × 720, 24 fps, 8,04 s (der Modus `std` liefert nicht mehr; `pro` verlangt den Plus-Plan) |

## Nachbearbeitung (ffmpeg)

- **Nahtloser Loop:** Die letzte Sekunde wird in die erste übergeblendet (1 s Kreuzblende). Länge danach 7,04 s. Der Übergang vom letzten zum
  ersten Bild ist nicht von normalen Bildübergängen im Clip zu unterscheiden (SSIM 0,952 gegenüber 0,952 bis 0,963 im Clip).
- **Bildkontrolle:** Frontpartie, Scheinwerfer, Gabeln, Vorderrad, Verkleidung und Helme sind über die gesamte Länge stabil. Kein erkennbares Morphing,
  keine neu erfundenen Logos.

## Dateien

| Datei | Format | Größe | Einsatz |
|---|---|---|---|
| `assets/hero-loop.mp4` | H.264, 1280 × 720 | 1,9 MB | Desktop |
| `assets/hero-loop-720.mp4` | H.264, 960 × 540 | 0,7 MB | Mobil. Der Name ist der vereinbarte Dateiname, die Datei ist 540p. |
| `assets/hero-loop.webm` | VP9, 1280 × 720 | 0,7 MB | Alternative für Browser mit WebM |
| `assets/hero-poster.webp` | 1920 × 1080 | 83 KB | Standbild (Frame 0 des Loops), LCP-Bild, Fallback bei Reduced-Motion und Datensparmodus |

Die Quelle ist 720p. Auf großen Monitoren wirkt der Clip daher etwas weich. Schärfer wird er mit Kling `pro` (Plus-Plan) oder einem
Video-Upscale bei Higgsfield.

## Vor dem Livegang klären

- **Kennzeichnung:** KI-generierte Inhalte können nach Art. 50 der EU-KI-Verordnung kennzeichnungspflichtig sein. Rechtlich prüfen lassen.
- **Markenrechte:** Das Startbild zeigt ein Harley-Davidson-Motorrad. Händlervertrag und Brand-Guidelines von Harley-Davidson prüfen, ob eine
  KI-Bearbeitung von Produktbildern zulässig ist.
- **Ersetzbar:** Der Clip lässt sich jederzeit 1:1 durch eigenes Videomaterial ersetzen. Dazu die vier Dateien unter **demselben Namen** austauschen
  (Seitenverhältnis 16:9, ohne Ton, Loop-fähig, Poster aus dem ersten Bild des Loops).
