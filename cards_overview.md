# 🎴 Grid Alchemist — Karten-Übersicht & Mechaniken (Modell A)

Diese Dokumentation listet alle 25 Karten von *Grid Alchemist* übersichtlich auf, gegliedert nach Tier 1 bis Tier 5. 
Die Zählweise basiert auf der neuen **Modell-A-Architektur** (**Live-Board-Wert + Sofort-Punkte**).

---

# TIER 1 (Starter)

## 🪙 Münze (Tier 1)
- **Typ / Archetyp:** Starter / Synergie
- **Board-Score (Dauerhaft):** Basis 1. Wert verdoppelt sich (x2 auf **2 Pkt**), wenn angrenzend an mindestens eine Münze (🪙) oder einen Sammler (👛).
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 1 Feldwert. Feldwert verdoppelt sich (x2), wenn angrenzend an Münze oder Sammler."*
- **Exakte Code-Logik:** In `calculateTileScore`: Prüft 4 orthogonale Nachbarn. Falls ein Nachbar `coin` oder `collector` ist, wird `baseYield = baseValue * 2` gerechnet, sonst `baseValue`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🌱 Keimling (Tier 1)
- **Typ / Archetyp:** Scaler / Explosiv
- **Board-Score (Dauerhaft):** Basis 1. Wächst um **+1 Pkt** am Rundenende pro Zug, solange mindestens 1 angrenzendes Feld leer ist.
- **Sofort-Score (Instant):** Gibt **`(baseValue * 2)` Sofort-Punkte**, wenn die Karte zerstört, aufgesaugt oder beim Platzieren überbaut wird.
- **Trigger & Events:** `onTurnEnd` (Wachstum), `onDestroy` (Explosion)
- **Aktueller Beschreibungstext:** *"Basis 1. Wächst +1/Zug auf Feldwert bei 1+ freiem Nachbarn. Explodiert bei Zerstörung für doppelten Wert als Sofort-Punkte."*
- **Exakte Code-Logik:** 
  - `updateTurnEndBoard`: Zählt leere Nachbarn (`null`). Falls > 0, steigt `baseValue += 1`.
  - `triggerCardDestruction`: Falls getriggert, berechnet `(item.baseValue || 1) * 2` und addiert dies direkt auf das `instantScore`-Konto.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🧭 Kompass (Tier 1)
- **Typ / Archetyp:** Nachbar-Buff / Multiplikator
- **Board-Score (Dauerhaft):** Eigener Basiswert 2 Pkt. Verdoppelt (**x2**) den Feldwert aller angrenzenden Nachbarn, WENN der Kompass selbst an einer Kante oder Ecke liegt.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 2 Feldwert. Verdoppelt (x2) an Kanten/Ecken die Feldwerte aller angrenzenden Nachbarn."*
- **Exakte Code-Logik:** In `calculateTileScore`: Prüft angrenzende Kompasse. Wenn der Kompass auf Zeile 0/3 oder Spalte 0/3 liegt, wird der Feldwert der angrenzenden Nachbarn mit `x2` multipliziert.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## ❇️ Resonanz-Kristall (Tier 1)
- **Typ / Archetyp:** Board-Scaler / Synergie
- **Board-Score (Dauerhaft):** Basis 1 Pkt + **2 Pkt** für JEDE Karte des am häufigsten vertretenen Kartentyps auf dem gesamten Board.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 1. Erhält +2 auf den Feldwert für JEDE Karte des am häufigsten vertretenen Kartentyps auf dem Board."*
- **Exakte Code-Logik:** In `calculateTileScore`: Zählt alle Vorkommen jedes Kartentyps auf dem 4x4-Board. `maxCount = max(typeCounts)`. `baseYield = 1 + maxCount * 2`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

# TIER 2 (Synergie-Starter)

## 🦅 Aasgeier (Tier 2)
- **Typ / Archetyp:** Zerstörungs-Scaler / Passiv
- **Board-Score (Dauerhaft):** Erhält dauerhaft **+4 Pkt** auf seinen `baseValue` für JEDE Karte auf dem Board, die zerstört, aufgesaugt oder entfernt wird.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** `onNeighborDestroyed` / `triggerCardDestruction`
- **Aktueller Beschreibungstext:** *"Erhält dauerhaft +4 auf den Feldwert für JEDE Karte auf dem Board, die zerstört, aufgesaugt oder entfernt wird."*
- **Exakte Code-Logik:** `notifyVulturesOfDestruction`: Wird bei jeder Zerstörungsaktion aufgerufen und erhöht `baseValue += destroyedCount * 4` für alle Aasgeier auf dem Board.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🧗 Einsiedler (Tier 2)
- **Typ / Archetyp:** Solitär / Freiraum
- **Board-Score (Dauerhaft):** Erhält **+3 Pkt** pro leerem Feld auf dem gesamten Board. Fällt auf **0 Pkt**, sobald er mindestens 1 besetzten Nachbarn hat!
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Erhält +3 auf den Feldwert für JEDE leere Kachel auf dem Board. Darf keine direkten Nachbarn haben."*
- **Exakte Code-Logik:** In `calculateTileScore`: Falls `occupiedNeighborsCount > 0` ➔ `baseYield = 0`. Sonst `emptyBoardCount * 3`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 👛 Sammler (Tier 2)
- **Typ / Archetyp:** Münz-Synergie / Multiplikator
- **Board-Score (Dauerhaft):** Basis 1 Pkt (**+2 Pkt** pro Münze auf dem Board). Verdoppelt seinen Gesamtwert (**x2**), wenn 3 oder mehr Münzen auf dem Board liegen.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 1 (+2 pro Münze auf Board auf den Feldwert). Feldwert verdoppelt (x2) bei 3+ Münzen."*
- **Exakte Code-Logik:** In `calculateTileScore`: `yieldVal = 1 + 2 * coinCount`. Falls `coinCount >= 3` ➔ `yieldVal *= 2`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🔮 Glaskugel (Tier 2)
- **Typ / Archetyp:** Nachbar-Buff / Multiplikator
- **Board-Score (Dauerhaft):** Basis 2 Pkt. Multipliziert den Ertrag aller angrenzenden Tier-1 Standard-Karten mit **x2**.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 2 Feldwert. Multipliziert den Feldwert aller angrenzenden Tier-1 Standard-Karten mit x2."*
- **Exakte Code-Logik:** In `calculateTileScore`: Falls Kachel Tier 1 ist und angrenzend eine Glaskugel liegt ➔ `baseYield *= 2`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## ⚡ Verstärker (Tier 2)
- **Typ / Archetyp:** Nachbar-Buff / Additiv
- **Board-Score (Dauerhaft):** Basis 2 Pkt. Gibt allen 4 direkt angrenzenden Nachbarkarten **+5 Bonus-Ertrag** auf deren Feldwert.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 2 Feldwert. Gibt allen direkt angrenzenden Nachbarkarten +5 auf den Feldwert."*
- **Exakte Code-Logik:** In `calculateTileScore`: Zählt angrenzende Verstärker `adjacentAmplifierCount` und addiert `+5 * count` zum Feldwert der Nachbarkachel.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🔥 Scheiterhaufen (Tier 2)
- **Typ / Archetyp:** Zerstörer / Instant Burst
- **Board-Score (Dauerhaft):** 0 Pkt (Zerstört sich bei Platzierung selbst).
- **Sofort-Score (Instant):** **+6 Sofort-Punkte** pro zerstörter Karte (sich selbst + bis zu 4 Nachbarn = max +30 Pkt) + Keimling-Explosionsboni.
- **Trigger & Events:** `onPlace` (Selbst- & Nachbar-Zerstörung)
- **Aktueller Beschreibungstext:** *"Zerstört bei Platzierung sich selbst & alle 4 Nachbarn (+6 Sofort-Punkte pro zerstörter Karte)."*
- **Exakte Code-Logik:** `applyItemPlacement`: Zerstört Nachbarn via `triggerCardDestruction`, löscht sich selbst (`null`) und leitet `(totalDestroyed * 6) + pyreExtra` an das `instantScore`-Konto weiter.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## ♻️ Recycler (Tier 2)
- **Typ / Archetyp:** Zerstörer / Conversion
- **Board-Score (Dauerhaft):** Basis 1 Pkt + gesammelter Verzehr-Bonus.
- **Sofort-Score (Instant):** Zerstört die angrenzende Nachbarkarte mit dem niedrigsten Wert und gibt ihren **doppelten Wert + Keimling-Bonus** als Sofort-Punkte.
- **Trigger & Events:** `onPlace` (Einzel-Verzehr)
- **Aktueller Beschreibungstext:** *"Zerstört angrenzende Karte mit niedrigstem Wert (+doppelter Basiswert als Sofort-Punkte)."*
- **Exakte Code-Logik:** `applyItemPlacement`: Sucht schwächsten Nachbarn, zerstört ihn via `triggerCardDestruction` und rechnet `lowestVal * 2 + rExtra` auf `baseValue` und Instant-Points.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🔨 Schmied (Tier 2)
- **Typ / Archetyp:** Transformer / Builder
- **Board-Score (Dauerhaft):** Basis 1 Pkt.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** `onPlace` (Verwandlung)
- **Aktueller Beschreibungstext:** *"Wandelt bei Platzierung angrenzende Tier 1 Items in Goldschätze (+4 Feldwert) um."*
- **Exakte Code-Logik:** `applyItemPlacement`: Durchläuft 4 Nachbarn. Jede Tier-1-Karte wird dauerhaft in einen Goldschatz (`type: 'treasure'`, `baseValue: 4`, Tier 2) umgewandelt.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

# TIER 3 (Multiplikatoren)

## 🧪 Katalysator (Tier 3)
- **Typ / Archetyp:** Zeilen-Multiplikator
- **Board-Score (Dauerhaft):** Basis 2 Pkt. Verdoppelt (**x2**) den Feldwert aller Karten in derselben horizontalen Zeile.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Basis 2 Feldwert. Verdoppelt (x2) den Feldwert aller Karten in derselben Reihe."*
- **Exakte Code-Logik:** In `calculateTileScore`: Zählt Katalysatoren in derselben Zeile `rowCatalystCount` und multipliziert den Zeilenkachel-Feldwert mit `2^count`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🧲 Magnet (Tier 3)
- **Typ / Archetyp:** Absorber / Multiplikator
- **Board-Score (Dauerhaft):** Saugt die Basiswerte aller 4 Nachbarn ab, addiert eigenen Basiswert (2) und verdreifacht (**x3**) seinen eigenen Feldwert.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Saugt Basiswerte der 4 Nachbarn ab & verdreifacht (x3) seinen eigenen Feldwert."*
- **Exakte Code-Logik:** In `calculateTileScore`: `neighborSum = sum(neighbor.baseValue)`. `baseYield = (2 + neighborSum) * 3`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🏗️ Abrissbirne (Tier 3)
- **Typ / Archetyp:** Zeilen-Zerstörer / Instant Burst
- **Board-Score (Dauerhaft):** Basiswert speichert den gesammelten Zeilen-Zerstörungsbonus.
- **Sofort-Score (Instant):** Generiert **+10 Sofort-Punkte** pro zerstörter Karte in der Reihe (+ Keimling-Explosionen).
- **Trigger & Events:** `onPlace` (Zeilen-Abriss)
- **Aktueller Beschreibungstext:** *"Zerstört die gesamte Reihe (+10 Sofort-Punkte & Keimling-Bonus pro zerstörter Karte)."*
- **Exakte Code-Logik:** `applyItemPlacement`: Zerstört alle anderen Kacheln in derselben Zeile via `triggerCardDestruction` und addiert `destroyedCount * 10` zu `baseValue`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🧩 Mosaik (Tier 3)
- **Typ / Archetyp:** Vielfalt-Scaler
- **Board-Score (Dauerhaft):** Erhält **+4 Pkt** auf den Feldwert pro einzigartigem Kartentyp auf dem Board.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"+4 auf den Feldwert pro einzigartigem Kartentyp auf dem Board."*
- **Exakte Code-Logik:** In `calculateTileScore`: Sammelt alle vorhandenen `type`-Strings in einem `Set`. `baseYield = 4 * uniqueTypes.size`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🌪️ Vakuum (Tier 3)
- **Typ / Archetyp:** Freiraum-Scaler
- **Board-Score (Dauerhaft):** Erhält **+4 Pkt** auf den Feldwert pro LEEREM Feld (`null`) auf dem 4x4-Board.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"+4 auf den Feldwert pro LEEREM Feld auf dem Board."*
- **Exakte Code-Logik:** In `calculateTileScore`: Zählt leere Kacheln auf dem Board. `baseYield = 4 * emptyCount`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

# TIER 4 (Board-weite Skalierung)

## 🏛️ Tresor (Tier 4)
- **Typ / Archetyp:** Deck-Scaler / Multiplikator
- **Board-Score (Dauerhaft):** Gibt **+15 Pkt** für jede Karte im Deck des Spielers (`playerPool.length * 15`) und wendet **x2** auf das eigene Feld an.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"Gibt +15 auf den Feldwert für jede Karte im Deck und x2 auf das eigene Feld."*
- **Exakte Code-Logik:** In `calculateTileScore`: `baseYield = (playerPoolLength * 15) * 2`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 💥 Supernova (Tier 4)
- **Typ / Archetyp:** Board-Cleanser / Instant Burst
- **Board-Score (Dauerhaft):** Basiswert speichert gesammelten Zerstörungsbonus.
- **Sofort-Score (Instant):** Generiert **+25 Sofort-Punkte** pro gelöschter Tier-1-Karte (+ Keimling-Explosionen).
- **Trigger & Events:** `onPlace` (Global Cleansing)
- **Aktueller Beschreibungstext:** *"Zerstört bei Platzierung ALLE Tier-1 Karten auf dem Board (+25 Sofort-Punkte pro Karte)."*
- **Exakte Code-Logik:** `applyItemPlacement`: Sucht alle Tier-1-Karten auf dem Board, löscht sie via `triggerCardDestruction` und bucht `destroyedCount * 25` in `baseValue` / Instant-Punkte.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🌀 Verdichter (Tier 4)
- **Typ / Archetyp:** Nachbar-Absorber / Multiplikator
- **Board-Score (Dauerhaft):** Absorbiert 4 Nachbarn und verdoppelt (**x2**) den gefressenen Wert pro gefressener Karte als neuen Feldwert.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** `onPlace` (Absorbtion)
- **Aktueller Beschreibungstext:** *"Absorbiert 4 Nachbarn und verdoppelt (x2) den gefressenen Wert als Feldwert."*
- **Exakte Code-Logik:** `applyItemPlacement`: Berechnet Summe der Kachelwerte aller 4 Nachbarn `sumValues`, löscht sie via `triggerCardDestruction` und setzt `baseValue = Math.floor(sumValues * 2^eatenCount)`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 👑 Midas (Tier 4)
- **Typ / Archetyp:** Gold-Synergie / Buff
- **Board-Score (Dauerhaft):** Basis 1 Pkt. Verdoppelt Basiswerte der Nachbarn & **+5 Feldwert** pro Münze.
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** `onPlace` (Midas-Touch)
- **Aktueller Beschreibungstext:** *"Verdoppelt Basiswerte der Nachbarn & +5 auf den Feldwert pro Münze."*
- **Exakte Code-Logik:** `applyItemPlacement`: Verdoppelt `baseValue` aller 4 Nachbarn dauerhaft und addiert +5 auf den eigenen `baseValue` pro Münze unter den Nachbarn.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 💎 Prisma (Tier 4)
- **Typ / Archetyp:** Global Multiplier
- **Board-Score (Dauerhaft):** Eigener Kachelwert 0 Pkt. Erhöht aber den Gesamtwert des Boards am Rundenende um **x1.5 (+50%)** pro Prisma!
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Global Multiplier in `calculateBoardScore`
- **Aktueller Beschreibungstext:** *"Erhöht den aus allen Kacheln berechneten Gesamt-Board-Wert am Ende um x1.5 (+50%)."*
- **Exakte Code-Logik:** In `calculateBoardScore`: Multipliziert die Board-Gesamtsumme vor dem Stein der Weisen mit `Math.pow(1.5, prismCount)`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

# TIER 5 (God-Mode / Win-Conditions)

## 🪐 Der Stein der Weisen (Tier 5)
- **Typ / Archetyp:** GOD-MODE / Game Winner
- **Board-Score (Dauerhaft):** Basis 5 Pkt. Multipliziert den RUNDEN-FINALSCORE (Board + Sofort) mit **x3**!
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Global Multiplier in `calculateBoardScore`
- **Aktueller Beschreibungstext:** *"GOD-MODE: Multipliziert den RUNDEN-FINALSCORE (Board + Sofort) mit x3!"*
- **Exakte Code-Logik:** In `calculateBoardScore`: Multipliziert den finalen Rundenscore mit `Math.pow(3, philosopherStoneCount)`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🌳 Weltenbaum (Tier 5)
- **Typ / Archetyp:** Board-Filler / High-Value
- **Board-Score (Dauerhaft):** Basis 10 Pkt + **10 Pkt** auf den Feldwert für JEDE besetzte Kachel auf dem gesamten Board (max 170 Pkt).
- **Sofort-Score (Instant):** 0 Pkt
- **Trigger & Events:** Keine
- **Aktueller Beschreibungstext:** *"GOD-MODE: Erhält +10 auf den Feldwert für JEDE besetzte Kachel auf dem Board!"*
- **Exakte Code-Logik:** In `calculateTileScore`: Zählt besetzte Felder `occupiedCount`. `baseYield = 10 + occupiedCount * 10`.
- 📝 **Meine Notizen / Rework-Ideen:** 

---

## 🕳️ Singularität (Tier 5)
- **Typ / Archetyp:** Black Hole / End-Turn Devourer
- **Board-Score (Dauerhaft):** Basis 15 Pkt Feldwert.
- **Sofort-Score (Instant):** Generiert Sofort-Punkte beim Verzehren angrenzender Karten am Zugende.
- **Trigger & Events:** `onTurnEnd` (Nachbar-Verzehr)
- **Aktueller Beschreibungstext:** *"Generiert +15 Feldwert & frisst am Zugende angrenzende Karten für Sofort-Punkte."*
- **Exakte Code-Logik:** `calculateTileScore`: Basiswert 15 Pkt. Frisst am Zugende angrenzende Kacheln und leitet Punkte/Boni an das `instantScore`-Konto weiter.
- 📝 **Meine Notizen / Rework-Ideen:** 

---
