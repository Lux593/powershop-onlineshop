#!/usr/bin/env python3
"""Schneidet die Karte aus einer Shopify-Seite aus (Vergleich vor/nach dem Umbau des Snippets visit-map).

Liest HTML von stdin und gibt den Teilbaum des ersten Elements mit der Klasse `visit__map` aus, Zeichen für Zeichen
wie im Quelltext. `?v=<Zahl>` wird zu `?v=X`, denn die Versionsnummer der Assets ändert sich bei jedem Hochladen.
Findet sich kein solches Element, bleibt die Ausgabe leer und der Exit-Code ist 1.

Aufruf (`-I` lädt nichts aus dem aktuellen Verzeichnis):
    curl -s http://127.0.0.1:9293/pages/service | python3 -I docs/qa/karte-ausschneiden.py > karte.html

Nur Standardbibliothek.
"""
import re
import sys
from html.parser import HTMLParser

KLASSE = "visit__map"

# Elemente ohne End-Tag: sie öffnen keinen Teilbaum
LEER = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}


class Ausschneider(HTMLParser):
    def __init__(self, text):
        # convert_charrefs=False: Zeichenverweise bleiben unberührt. Ausgegeben wird ohnehin der Quelltext selbst.
        super().__init__(convert_charrefs=False)
        self.text = text
        # Zeilenanfänge, um (Zeile, Spalte) aus getpos() in einen Versatz im Text zu verwandeln
        self.zeilen = [0]
        for m in re.finditer("\n", text):
            self.zeilen.append(m.end())
        self.stapel = []      # Namen der offenen Elemente
        self.wurzel = None    # Höhe des Stapels, in der das gesuchte Element liegt
        self.von = None
        self.bis = None

    def versatz(self):
        zeile, spalte = self.getpos()
        return self.zeilen[zeile - 1] + spalte

    def ende_des_tags(self, ab):
        return self.text.index(">", ab) + 1

    @staticmethod
    def hat_klasse(attrs):
        for name, wert in attrs:
            if name == "class" and wert and KLASSE in wert.split():
                return True
        return False

    def gefunden(self):
        return self.bis is not None

    def handle_starttag(self, tag, attrs):
        if self.gefunden():
            return
        ab = self.versatz()
        leer = tag in LEER
        if self.wurzel is None and self.hat_klasse(attrs):
            self.von = ab
            if leer:
                self.bis = ab + len(self.get_starttag_text())
                return
            self.wurzel = len(self.stapel)
        if not leer:
            self.stapel.append(tag)

    def handle_startendtag(self, tag, attrs):
        # <x/> öffnet nichts. Ist es selbst das gesuchte Element, ist der Teilbaum nur dieses Tag.
        if self.gefunden():
            return
        if self.wurzel is None and self.hat_klasse(attrs):
            ab = self.versatz()
            self.von = ab
            self.bis = ab + len(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self.gefunden() or tag not in self.stapel:
            return  # herrenloses End-Tag
        # Höhe des Elements, das dieses End-Tag schließt; was darüber noch offen war, hatte kein End-Tag und endet hier
        hoehe = len(self.stapel) - 1 - self.stapel[::-1].index(tag)
        del self.stapel[hoehe:]
        if self.wurzel is not None:
            if hoehe == self.wurzel:
                self.bis = self.ende_des_tags(self.versatz())
            elif hoehe < self.wurzel:
                self.bis = self.versatz()  # ein Vorfahr schließt, die Wurzel blieb offen: der Teilbaum endet davor


def main():
    text = sys.stdin.buffer.read().decode("utf-8")
    parser = Ausschneider(text)
    parser.feed(text)
    parser.close()
    if parser.von is None:
        sys.stderr.write("Kein Element mit der Klasse %s gefunden.\n" % KLASSE)
        return 1
    # Nicht geschlossenes Element: bis zum Ende des Dokuments
    bis = parser.bis if parser.bis is not None else len(text)
    teil = re.sub(r"\?v=\d+", "?v=X", text[parser.von:bis])
    sys.stdout.buffer.write((teil + "\n").encode("utf-8"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
