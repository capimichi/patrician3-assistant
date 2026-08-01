# Sheet 4: Housing (`4_Housing_Häuser`)

This sheet tracks the housing supply and capacity for each of the 40 cities in Patrician III. It calculates current housing surpluses or shortages per social class, provides a detailed breakdown for a selected city, and includes a **Target Growth Planner** to project future housing needs during city expansion.

---

## 1. Patrician III Housing System

The game has three residential building types, each dedicated to a specific social class. The sheet calculates requirements based on the maximum capacity of each house type:

* **Timber-framed house (`Fachwerkhaus` / FWH)**:
  * Targets the **Poor** (`Arme`).
  * Capacity: **280** residents per house.
* **Gable house (`Giebelhaus` / GH)**:
  * Targets the **Wealthy** (`Wohlhabende`).
  * Capacity: **140** residents per house.
* **Merchant house (`Kaufmannshaus` / KMH)**:
  * Targets the **Rich** (`Reiche`).
  * Capacity: **80** residents per house.

---

## 2. Sheet Structure & Columns (Rows 3 - 42)

The main table lists all 40 cities (rows 3 to 42) and calculates target vs. actual houses for the three classes:

| Columns | House Type | Social Class | Variable | Formula / Source |
| :--- | :--- | :--- | :--- | :--- |
| **B** | Fachwerk (FWH) | Poor | `Soll` (Target) | `=ROUNDUP(Poor_Population / 280; 0)` |
| **C** | Fachwerk (FWH) | Poor | `Ist` (Actual) | Linked from `$1_Beiblatt.W` |
| **D** | Fachwerk (FWH) | Poor | `Total` (Balance) | `=Actual - Target` (Negative indicates shortage) |
| **E** | Giebel (GH) | Wealthy | `Soll` (Target) | `=ROUNDUP(Wealthy_Population / 140; 0)` |
| **F** | Giebel (GH) | Wealthy | `Ist` (Actual) | Linked from `$1_Beiblatt.X` |
| **G** | Giebel (GH) | Wealthy | `Total` (Balance) | `=Actual - Target` |
| **H** | Kaufmann (KMH) | Rich | `Soll` (Target) | `=ROUNDUP(Rich_Population / 80; 0)` |
| **I** | Kaufmann (KMH) | Rich | `Ist` (Actual) | Linked from `$1_Beiblatt.Y` |
| **J** | Kaufmann (KMH) | Rich | `Total` (Balance) | `=Actual - Target` |

*Example (Aalborg FWH Soll - cell B3)*:
```excel
=ROUNDUP([$2_Bevölkerung.D2]/280; 0)
```

---

## 3. Builder Calculator & Selected City Demographics (Rows 46 - 56)

Allows the user to select a single city (entered in cell `A47` / `A53`) to inspect its detailed demographics and housing requirements:

1. **Social Class Proportions (Rows 47 - 50)**:
   Extracts populations for the selected city from sheet `2_Bevölkerung` using `MATCH` on the city name, and computes class percentage shares:
   * **Rich (`Reiche`)**: `Rich_Pop * 100 / Total_Pop`
   * **Wealthy (`Wohlis`)**: `Wealthy_Pop * 100 / Total_Pop`
   * **Poor (`Arme`)**: `Poor_Pop * 100 / Total_Pop`

2. **Selected City Housing Balance (Rows 53 - 56)**:
   Pulls target, actual, and balance numbers for the selected city from the main table above:
   * **FWH**: Target `=ROUNDUP(Poor_Pop / 280; 0)`, Actual `=INDEX(..., 2)` (Column C), Balance `=Actual - Target`
   * **GH**: Target `=ROUNDUP(Wealthy_Pop / 140; 0)`, Actual `=INDEX(..., 5)` (Column F), Balance `=Actual - Target`
   * **KMH**: Target `=ROUNDUP(Rich_Pop / 80; 0)`, Actual `=INDEX(..., 8)` (Column I), Balance `=Actual - Target`

---

## 4. Target Growth Planner (Rows 59 - 62)

Predicts housing needs if the selected city grows to a future target population, assuming the current class distribution ratios remain constant.

* **User Input (`B59`)**: Target city population (e.g. `30,000` residents).
* **Projected Populations (Column C)**:
  * `Target_Class_Pop = Target_Total_Pop * Current_Class_Percentage / 100`
* **Projected Houses Needed (Column E)**:
  * **KMH**: `=ROUNDUP(Projected_Rich_Pop / 80; 0)`
  * **GH**: `=ROUNDUP(Projected_Wealthy_Pop / 140; 0)`
  * **FWH**: `=ROUNDUP(Projected_Poor_Pop / 280; 0)`
* **Current Supply (Column G)**:
  * Links to the actual current houses of the selected city.
* **Construction Requirement (Column H)**:
  * `=Current_Supply - Projected_Houses_Needed`
  * A negative value shows exactly how many additional houses of each type must be constructed to sustain the target population.
