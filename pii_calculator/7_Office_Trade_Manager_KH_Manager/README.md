# Sheet 7: Office Trade Manager (`7_Office_Trade_Manager_KH_Manager`)

This sheet helps the player configure the **Office Manager** (`Kontorverwalter`) in each city. Specifically, it calculates the minimum stock limits (`Sperrlager`) for raw materials that must be locked in the local warehouse. This prevents local factories from running out of inputs between convoy visits.

---

## 1. Column Structure & Core Output

Columns **C to I** display the recommended minimum reserve quantity (in barrels/lasts) that the Office Manager should protect from sale or export:

| Column | Output Stock Limit | Raw Material | Input Industry |
| :---: | :--- | :--- | :--- |
| **C** | Iron Ore (`Eisenerz`) | Iron Ore | tool Workshops (`Werkstatt`) |
| **D** | Iron Goods (`Eisenwaren`) | Iron Goods | Hunting Lodges (`Jagdhütte`) |
| **E** | Grain (`Getreide`) | Grain | Breweries (`Brauerei`), Cattle Farms (`Viehhof`) |
| **F** | Hemp (`Hanf`) | Hemp | Fisheries (`Fischer/Fisch`) |
| **G** | Wood (`Holz`) | Wood | Sawmills, Saltworks, Brickworks, Potteries, Breweries |
| **H** | Salt (`Salz`) | Salt | Fisheries (`Fischer/Fisch`) |
| **I** | Wool (`Wolle`) | Wool | Weaving Mills (`Weberei`) |

*These columns directly link to columns `R` through `X` where the mathematical rounding occurs (e.g. `C3: =R3`).*

---

## 2. Calculation Logic & Formulas

For each city row (Rows 3 - 42):

### Step 1: Calculate Weekly Raw Material Demand (Columns K - Q)
Pulls the industrial consumption of raw materials directly from the net values of `$6_Verbrauch` (excluding population consumption):
* **Iron Ore (`K`)**: `=[$6_Verbrauch.G5] - [$6_Verbrauch.G90]`
* **Wood (`O`)**: Combined wood requirements of all local active industries (breweries, saltworks, brickworks, potteries, cattle farms, workshops, pitch makers).

### Step 2: Determine Coverage Period in Days (Column Y)
Calculates how many days of production the reserve stock must cover. The sheet supports three modes configured in cell `C44` (`Modus`):
1. **`Fahrtzeit` (Travel Time Mode)**:
   The coverage period equals the convoy's round-trip travel time to the central warehouse (`B3`, linked to `$1_Beiblatt.AL`).
2. **`X-Wochen` (Fixed Weeks Mode)**:
   The coverage period is fixed to $X$ weeks (defined in `F44`, multiplied by 7 days).
3. **Default / Global Week Mode**:
   Uses the global backup setting defined in `$1_Beiblatt.AF` (multiplied by 7).

*Formula (Cell Y3)*:
```excel
=IF(Modus = "Fahrtzeit"; Travel_Time; IF(Modus = "X-Wochen"; X_Weeks * 7; Global_Weeks * 7))
```

### Step 3: Calculate & Round Up protected Stock (Columns R - X)
Multiplies the daily consumption rate by the coverage period and applies a safety reserve percentage buffer (defined in cell `$A$2`, e.g. `0%` or `20%` extra):
```excel
=ROUNDUP(Weekly_Demand / 7 * Coverage_Days * (1 + Safety_Buffer); 0)
```
*Example (Aalborg Iron Ore Stock - cell R3)*:
```excel
=ROUNDUP([.K3]/7*[.$Y3]*(1+[.$A$2]))
```

---

## 3. Practical Usage in Patrician III

To apply this logic in-game:
1. Open the **Office / Kontor** in a city.
2. Open the **Office Manager / Kontorverwalter** menu.
3. Select the raw material (e.g., Wood).
4. Set the action to **"Lock warehouse stock up to" / "Sperrlager bis"** and enter the value calculated in this sheet.
5. This ensures the trade convoy can pick up surplus goods or sell supplies without starving the local industries of wood/grain/hemp.
