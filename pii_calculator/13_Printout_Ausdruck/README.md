# Sheet 13: Printout Template (`13_Printout_Ausdruck`)

This sheet is a presentation-oriented utility designed as a clean, printable grid. It allows players who prefer manual tracking or physical record-keeping to print out a structured form and note down building constructions, population changes, and targets by hand.

---

## 1. Structure

The sheet lists the 40 Hanseatic cities in Column A (matching `$1_Beiblatt`) and maps:
* **Columns B - D**: Demographics (Rich, Wealthy, Poor classes).
* **Columns E - V**: The 18 industrial production businesses.
* **Columns W - Y**: The 3 residential housing types (FWH, GH, KMH).

---

## 2. Dynamic Linking

Every cell in the sheet acts as a mirror referencing either `$1_Beiblatt` (to populate city names and active base counters) or leaves blank slots for physical data entry:
```excel
= [$1_Beiblatt.A2]
```
This ensures that if the player alters the list of cities or base map configurations on the main sheet, the printable layout automatically updates its row labels to match.
