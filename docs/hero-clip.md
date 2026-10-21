# Hero-Clip

Der Film im Hero der Startseite (erster Slide, Road Glide) ist seit dem 21. Oktober 2026 **echtes Filmmaterial** und ersetzt den vorherigen,
KI-generierten Loop. Diese Notiz hält fest, woher er kommt, wie er gebaut wurde und was vor dem Livegang noch geklärt werden muss.

## Herkunft

| | |
|---|---|
| Quelle | `hero-movie-new.mp4`, vom Nutzer geliefert. Laut Metadaten Export aus DaVinci Resolve, erstellt am 16. Juni 2026 |
| Rohmaterial | 1828 × 1332, HEVC, 29,97 fps, 21,44 s, mit Ton |
| Inhalt | Schnell geschnittener Clip: Fahrer mit Helm auf einer Road Glide, Details (Lenker, Rad, Hoodie), Fahrt durch Grün |

## Nachbearbeitung (ffmpeg)

- **Ausschnitt:** 16:9 aus der Mitte (`crop=1828:1028:0:152`), skaliert mit Lanczos. Mittig bleiben Helme oben und Scheinwerfer unten am besten im Bild.
- **Länge und Loop:** Volle Länge, keine Kreuzblende. Der Clip ist durchgehend hart geschnitten, der Sprung vom Ende zum Anfang wirkt wie ein weiterer
  Schnitt. Der Slide wechselt alle 8 s (`autoplay_seconds`), der Film läuft beim nächsten Durchgang an der angehaltenen Stelle weiter.
- **Kodierung:** ohne Ton, ohne Metadaten und Zeitcode-Spur, 29,97 fps wie die Quelle.
  - MP4: `libx264 -preset slow -crf 26 -g 48 -pix_fmt yuv420p -movflags +faststart` (Mobil zusätzlich `-profile:v main`). CRF 26 ist seit dem
    21. Oktober 2026 der Standard für alle Filme im Shop.
  - WebM: `libvpx-vp9 -crf 38 -b:v 0`. Gegen eine verlustfreie Referenz gemessen: VMAF 94,1 bei 4,8 MB, das MP4 hat 93,0 bei 6,1 MB.
- **Poster:** Bild 0 aus der Quelle (gleicher Ausschnitt), Farbumrechnung BT.709 Videobereich, WebP Qualität 80.

## Dateien

| Datei | Format | Größe | Einsatz |
|---|---|---|---|
| `assets/hero-loop.mp4` | H.264, 1280 × 720 | 6,1 MB | Desktop |
| `assets/hero-loop-720.mp4` | H.264, 960 × 540 | 4,1 MB | Mobil. Der Name ist der vereinbarte Dateiname, die Datei ist 540p. |
| `assets/hero-loop.webm` | VP9, 1280 × 720 | 4,8 MB | Desktop in Browsern mit sicherem VP9 (`hero.js`) |
| `assets/hero-poster.webp` | 1920 × 1080 | 94 KB | Standbild (Bild 0 des Films), LCP-Bild, Fallback bei Reduced-Motion und Datensparmodus |
| `assets/hero-poster-960.webp` | 960 × 540 | 19 KB | dasselbe Standbild für schmale Bildschirme (`srcset` in `sections/hero.liquid`). Beide Poster immer gemeinsam ersetzen, sonst zeigt Mobil weiter das alte Bild. |

Die Filme laden erst nach dem Seitenaufbau (`preload="none"`, Start nach Load und Leerlauf), nie bei Datensparmodus oder reduzierter Bewegung.
Wegen der Länge und der vielen schnellen Bewegungen sind sie trotzdem deutlich größer als der alte 7-s-Loop (1,9 / 0,7 / 0,7 MB).

## Vor dem Livegang klären

- **Nutzungsrechte:** Rechte am Film und Einverständnis der gezeigten Person für die Nutzung im Shop klären.
- **Markenrechte:** Der Film zeigt Harley-Davidson-Motorräder und -Kleidung. Händlervertrag und Brand-Guidelines von Harley-Davidson prüfen.
- **Ersetzbar:** Der Film lässt sich jederzeit 1:1 austauschen. Dazu die fünf Dateien unter **demselben Namen** ersetzen
  (Seitenverhältnis 16:9, ohne Ton, Poster aus dem ersten Bild des Films).
