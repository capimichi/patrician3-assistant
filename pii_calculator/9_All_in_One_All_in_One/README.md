# Sheet 9: All in One Dashboard (`9_All_in_One_All_in_One`)

This sheet is an interactive, unified dashboard designed to diagnose the economy, demographics, and supply chains of any single city in the Hanseatic League. By selecting a city (e.g. `London`, entered in cell `A2` or via a dropdown), the player gets a complete view of its logistics.

---

## 1. City Status Summary (Row 2)

Generates a natural language summary explaining the selected city's type, supply status, and its designated logistics warehouse (hub):

* **Formula (Cell C2)**:
  ```excel
  =CONCATENATE(City_Name; " ist eine "; City_Type; " und "; IF(Is_Zentrallager; "ist Zentrallager "; CONCATENATE("wird von "; Central_Warehouse; " aus (über "; Intermediate_Warehouse; ") versorgt")))
  ```
  *Example Output*: `"London ist eine Hansestadt und wird von Göteborg aus versorgt"`

---

## 2. Demographic Breakdown (Rows 10 - 13)

Retrieves the population counts and social structure of the selected city from sheet `2_Bevölkerung`:
* **Rich (`Reiche`)**: Links to the city's rich population count (cell `C11`).
* **Wealthy (`Wohlhabende`)**: Links to the city's wealthy population count (cell `C12`).
* **Poor (`Arme`)**: Links to the city's poor population count (cell `C13`).
* **Total Residents**: Sum of the three classes (cell `E12`).

---

## 3. Industrial Diagnostic Matrix (Rows 17 - 37)

Provides a detailed line-by-line report for each of the game's production buildings. For the selected city, it displays:

1. **Building Status (Column D)**: Shows if the building cannot be built (`Kein Bau`), produces standard (`Ineffektiv`), or produces with a bonus (`Effektiv`).
2. **Weekly Output (Column F & H)**: Shows the current weekly output (e.g., of Beer or Iron Ore) by query-matching the city row inside `$6_Verbrauch`.
3. **Primary Material Input (Column N & P)**: Shows which primary raw material is consumed (e.g. Grain for Beer) and the weekly volume required to sustain local factories.
4. **Secondary Material Input (Column Q & R)**: Shows which secondary raw material is consumed (e.g. Wood for Beer) and the weekly volume required.

#### Example Rows:
* **Brewery (`Brauerei`, Row 18)**:
  Shows Beer weekly production, Grain weekly consumption (primary input), and Wood weekly consumption (secondary input).
* **Fisher (`Fischer/Fish`, Row 20)**:
  Shows Fish weekly production, Hemp weekly consumption (primary input), and Salt weekly consumption (secondary input).
* **Cattle Farm (`Viehhof`, Row 31)**:
  Shows Meat & Leather weekly production, Wood weekly consumption, and Grain weekly consumption.

---

## 4. Indirect Lookup Mechanism

To keep the dashboard fully dynamic, the sheet uses indirect formulas to retrieve data.
* **Row Index Identifier (`AO5`)**:
  Finds the row index of the selected city in the master list:
  ```excel
  =MATCH(Selected_City; $1_Beiblatt.$A$2:.$A$43; 0)
  ```
* **Dynamic Row Fetching**:
  All demographic and production lookups on the sheet reference this index (`$AO$2` or `$AO$5`) to fetch the correct row in `$6_Verbrauch`, `$2_Bevölkerung`, or `$1_Beiblatt` dynamically.
