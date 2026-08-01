# Sheet 8: Convoy Manager (`8_Convoy_Manager_K_Manager`)

This sheet calculates the optimal cargo sizes and logistics capacity required for automatic convoys (`Autokonvoi`) traveling between the Central Warehouse (Zentrallager - ZL) and individual Hanseatic cities. It helps the player size their ships and plan trade routes to prevent shortages while minimizing wasted cargo space.

---

## 1. Convoy Capacity Calculations (Columns W - Y)

For each city, the manager estimates how much cargo space is needed:

* **Imports from ZL (`Von ZL`, Column W)**:
  Total volume in barrels (Faß) required to transport goods *to* the city.
* **Exports to ZL (`Zum ZL`, Column X)**:
  Total volume in barrels (Faß) required to bring locally produced goods *from* the city back to the ZL.
* **Minimum Convoy Size (`Konvoi in Fass`, Column Y)**:
  The minimum ship capacity (in barrels) required to handle the route:
  ```excel
  =MAX(Imports_ZL; Exports_ZL * (1 + Convoy_Buffer))
  ```
  *(where `Convoy_Buffer` is defined in cell `B43`, e.g. 10% safety margin)*

### Volumetric Unit Conversion:
In Patrician III, cargo is measured in either **Barrels (Faß)** or **Lasts** (heavy goods like wood, grain, bricks, salt).
* **`1 Last = 10 Barrels (Faß)`**.
To calculate the total convoy capacity (which is in Barrels), the formula converts Last-based goods into Barrels by multiplying by 10, while leaving Barrel-based goods (beer, wine, iron goods) unchanged:
```excel
Total_Barrels = 10 * (Sum_of_Last_Goods) + Sum_of_Barrel_Goods
```

---

## 2. Cargo Load per Good (Columns C - V)

For each of the 20 commodities (Beer, Iron Ore, Tools, Grain, Wood, etc.), the sheet calculates the exact number of goods to load when the convoy visits:

```excel
=ROUND(Daily_Balance) / 7 * Travel_Time * (1 + Safety_Buffer)
```
* **`Daily_Balance` (Column AG - AZ)**: Net daily surplus or deficit of the good in the city (weekly balance / 7).
  * **Imports (Deficits, value < 0)**: The convoy must supply enough goods for the entire trip duration plus a safety buffer (defined in `$A$2`, e.g. `35%` extra) to ensure the city does not starve.
  * **Exports (Surpluses, value > 0)**: The convoy must clear out all locally produced surplus that accumulated since the last visit. (No safety buffer needed).
* **`Travel_Time` (Column B)**: Convoy round-trip duration in days (linked from `$1_Beiblatt.AL`).

---

## 3. Seasonal Weather Adjustments (Columns AG - AZ)

For goods that suffer winter production drops (Grano, Canapa, Miele, Vino), the daily balance formula in row 3 onwards (e.g. cell `AG3`) weights the summer and winter balances to find a year-round average:
* Summer represents **9 months (75%)** of the year.
* Winter represents **3 months (25%)** of the year.

```excel
Weighted_Balance = 0.75 * Summer_Balance + 0.25 * Winter_Balance
```
*Formula (Cell AG3)*:
```excel
=IF((0.75 * Summer_Rate + 0.25 * Winter_Rate) >= 0; (Weighted_Rate + Beiblatt_Offset) / 7 * Travel_Time; (Weighted_Rate + Beiblatt_Offset))
```
This ensures convoys are sized appropriately to handle peak summer harvests without running short in winter.
