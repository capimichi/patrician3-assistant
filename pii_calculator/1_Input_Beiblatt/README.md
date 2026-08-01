# Sheet 1: Companion / Input Sheet (`1_Input_Beiblatt`)

This sheet serves as the central data entry point for the entire Patrician III assistant. The parameters entered here propagate automatically throughout all other sheets to drive city demand, local factory capacity, warehouse safety stocks, and trade convoy logistics.

---

## 1. Main Grid Columns (Columns A - AF)

| Column | German Header | English Translation | Description |
| :--- | :--- | :--- | :--- |
| **A** | `Stadt` | City | Name of the Hanseatic city (Rows 2 to 41 list the 40 standard cities). |
| **B** | `Reiche` | Rich | User Input: Count of rich citizens (patricians). |
| **C** | `Wohlis` | Wealthy | User Input: Count of wealthy citizens (merchants). |
| **D** | `Arme` | Poor | User Input: Count of poor citizens (laborers). |
| **E - V** | *Businesses* | *Production Buildings* | Status of the 18 local industries. Set by background color (see section 3). |
| **W** | `FWH` | Fachwerkhaus | User Input: Count of Fachwerk houses (housing for the poor). |
| **X** | `GH` | Giebelhaus | User Input: Count of Gabel houses (housing for the wealthy). |
| **Y** | `KMH` | Kaufmannshaus | User Input: Count of Kaufmann houses (housing for the rich). |
| **Z** | `ZL/RL` | Central Hub | Name of the city designated as the Central or Regional Warehouse hub for this city's route. |
| **AA** | `Langsamstes konvoischiff` | Slowest Convoy Ship | Dropdown specifying slowest ship type in the convoy (Schnigge, Kraier, Holk, Kogge). |
| **AB** | `Stadttyp` | City Type | Designation (e.g., Hansestadt, Niederlassung/Colony, Hansekontor, Faktorei). |
| **AC** | `Zwischenlager` | Transit Warehouse | Intermediate transit hub city, if any (defaults to "Kein Zwischenlager"). |
| **AD** | `Konvoigröße` | Convoy Size | Total cargo space of the convoy in barrels (Faß). |
| **AE** | `Konvoistopps` | Convoy Stops | Number of stops along the convoy route. |
| **AF** | `Wochen- verbrauch vorhaltemenge`| Stock Coverage (Weeks) | How many weeks of safety buffer supply to store in the local office (e.g. 2 weeks). |

---

## 2. Hidden Logistics Calculations (Columns AG - AT)

A series of hidden columns to the right calculates trade route times and modifiers:

1. **ZL Flag (`AG`)**:
   Checks if the city is its own central hub. If it is the hub itself, convoy transit to it is unnecessary (flag set to `0`, otherwise `1`):
   ```excel
   =IF(ROW()-1=Hub_Row_Index; 0; 1)
   ```
   *(where Hub_Row_Index is looked up in Column AS)*

2. **Ship Speed Modifier (`AH`)**:
   Looks up the speed penalty of the chosen slowest ship type (`AA`) from the speed reference table:
   * **Kraier**: `1.00`
   * **Schnigge**: `1.09`
   * **Holk**: `1.19`
   * **Kogge**: `1.32` (Slowest ship, adds a 32% travel time penalty)
   ```excel
   =INDEX($B$51:$B$60; MATCH(Slowest_Ship; $A$51:$A$54; 0); 1)
   ```

3. **Base Round-Trip Sailing Time (`AJ`)**:
   Retrieves the base one-way sailing time (in days) from the matrix in sheet `10_Fahrzeiten` between the city and its designated ZL hub, then doubles it:
   ```excel
   =2 * INDEX(10_Fahrzeiten.$B$2:$AO$41; Hub_Row_Index; ROW()-1)
   ```

4. **Slowest Ship Travel Duration (`AK`)**:
   Multiplies the base round-trip sailing time by the ship speed modifier:
   ```excel
   =Speed_Modifier * Base_Round_Trip_Sailing_Time
   ```

5. **Total Convoy Duration in Days (`AL`)**:
   Calculates the final convoy rotation time. It applies the ZL Flag, multiplies by the ship speed duration, and adds a **fixed loading penalty of 0.25 days (6 hours) per stop** (`AE`) along the trade route:
   ```excel
   =ZL_Flag * (Slowest_Ship_Duration + 0.25 * Convoy_Stops)
   ```

---

## 3. Cell-Color Production Bonus Mapping & Macros

To make data entry visual, the player inputs whether a city can produce an item efficiently by formatting the cell background color in columns `E - V`:
* **Green (or custom color in B44)**: `0` (No production possible / *Kein Betrieb möglich*)
* **Yellow (or custom color in B45)**: `1` (Normal / Inefficient production / *Ineffektiv*)
* **White (or custom color in B46)**: `2` (Efficient / Bonus production / *Effektiv*)

### Macro: `config` (Triggered by the "Generieren" Button)
When the player clicks the generation button, a LibreOffice Basic macro executes:
1. **Color to Value Translation**: It loops through rows 2-41 and columns E-V (the 18 businesses), inspects the background color of each cell, translates it into its corresponding numerical value (`0`, `1`, or `2`), and writes this value to a hidden matrix below (rows 51-90, columns E-V).
2. **Row Hiding Propagation**: It checks which city rows have `1` or `0` in Column `AR` (`Eingeblendet` / Active Row). The macro then loops through the entire workbook (`2_Bevölkerung`, `3_Betriebe`, `4_Häuser`, `6_Verbrauch`, etc.) and automatically hides any rows for cities that are disabled in the current custom map. This keeps the tables clean and synchronized.
