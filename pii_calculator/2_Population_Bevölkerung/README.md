# Sheet 2: Population calculations (`2_Population_Bevölkerung`)

This sheet computes the population structure of each individual city and calculates aggregate demographics for the entire Hanseatic League. It splits residents into the three economic classes defined in Patrician III (Rich, Wealthy, Poor) and calculates their relative percentages.

---

## 1. City Demographic Formulas (Rows 2 - 41)

All base demographic numbers are dynamically bound to the companion entry sheet (`1_Input_Beiblatt`):

* **City Name (Column A)**: `=[$1_Beiblatt.A2]`
* **Rich Residents (`Reiche`, Column B)**: `=[$1_Beiblatt.B2]`
* **Wealthy Residents (`Wohlis`, Column C)**: `=[$1_Beiblatt.C2]`
* **Poor Residents (`Arme`, Column D)**: `=[$1_Beiblatt.D2]`
* **Total City Population (`Gesamt`, Column E)**:
  Sums the three classes (Beggars are excluded):
  ```excel
  =SUM(B2:D2)
  ```
* **Class Share Percentages (Columns G - I)**:
  Calculates the local share of each class. To prevent division-by-zero errors in unpopulated or newly-founded cities, it wraps the division in a conditional check:
  * **Rich % (Column G)**: `=IF(SUM($B2:$D2)>0; B2/SUM($B2:$D2); 0)`
  * **Wealthy % (Column H)**: `=IF(SUM($B2:$D2)>0; C2/SUM($B2:$D2); 0)`
  * **Poor % (Column I)**: `=IF(SUM($B2:$D2)>0; D2/SUM($B2:$D2); 0)`

---

## 2. League-Wide Aggregations (Rows 43 - 46)

At the bottom of the table, the sheet calculates the combined indicators for the whole league:

* **League Class Sums (Row 43)**:
  * **Total Rich (`B43`)**: `=SUM(B2:B42)`
  * **Total Wealthy (`C43`)**: `=SUM(C2:C42)`
  * **Total Poor (`D43`)**: `=SUM(D2:D42)`
* **Total Hanseatic Population (`B46`)**:
  Calculates the sum of all classes league-wide (excluding beggars):
  ```excel
  =B43 + C43 + D43
  ```
* **Hanseatic Class Ratios (Row 44)**:
  Computes the percentage share of each social class across the entire league:
  * **Rich % (`B44`)**: `=B43 * 100 / B46`
  * **Wealthy % (`C44`)**: `=C43 * 100 / B46`
  * **Poor % (`D44`)**: `=D43 * 100 / B46`

---

## 3. Game Mechanics Note on Beggars (`Bettler`)

In Patrician III, beggars wander around the city marketplace and do not occupy houses or buy goods. Consequently, **beggars are intentionally excluded** from these population calculations. 
Because of this exclusion, the total population shown in this calculator will always be slightly lower than the total population displayed in the game's city hall ledger, but it is 100% mathematically accurate for consumption and supply-chain planning since beggars consume exactly zero resources.
