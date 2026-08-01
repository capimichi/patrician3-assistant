# Sheet 11: Building Materials (`11_Building_Materials_Baustoffe`)

This sheet helps the player plan city expansion projects. It calculates the exact quantity of building materials (Bricks, Timber, Tools, Hemp) and gold required to build a planned number of businesses and houses, and forecasts the resulting population growth.

---

## 1. Cost Reference Database (Rows 46 - 50)

The sheet embeds the exact material costs for constructing every building type in Patrician III:

* **Row 46 (`Ziegel` - Bricks)**: Brick cost per building (e.g. Brewery: 40, FWH: 25, GH: 40, KMH: 50).
* **Row 47 (`Holz` - Timber)**: Timber cost per building (e.g. Brewery: 5, FWH: 2, GH: 10, KMH: 20).
* **Row 48 (`EW` / `Eisenwaren` - Iron Goods/Tools)**: Tools cost per building (e.g. Brewery: 5, FWH: 2, GH: 10, KMH: 20).
* **Row 49 (`Hanf` - Hemp)**: Hemp cost (only required for Fishermen's nets: Fish Fisher: 10, Train Oil Fisher: 20).
* **Row 50 (`Kosten` - Gold Cost)**: Construction gold cost per building.

---

## 2. Calculation Logic & Formulas

For each city row (Rows 3 - 42):

### A. Induced Population Growth (Columns B - D)
When new businesses are built, they attract workers. Each worker has a family, which induces demand for middle and upper-class services, shifting the overall demographics.
1. **Poor Population Increase (`Arme`, Column D)**:
   Calculates how many poor workers will move to the city. Standard businesses employ 30 workers, while Pitch makers and Brickworks employ only 15. Each worker is assumed to attract a family of 4:
   ```excel
   = (Sum_of_Standard_New_Businesses * 30 * 4) + (Sum_of_15_Worker_New_Businesses * 15 * 4)
   ```
   *Formula (Cell D3)*:
   ```excel
   =SUM(E3:V3)*30*4 - 15*4*(M3+V3)
   ```
   *(where M3 is Pitch Maker and V3 is Brickworks)*
2. **Induced Rich (`Reiche`, Column B) & Wealthy (`Wohlis`, Column C) Increase**:
   Estimates upper-class growth by multiplying the poor workforce growth by the city's current social class ratios from `1_Beiblatt`:
   ```excel
   Rich_Increase = ROUNDUP((Current_Rich / Current_Poor) * Poor_Increase)
   ```
   *Formula (Cell B3)*: `=ROUNDUP(IF(D2_Beiblatt>0; B2_Beiblatt/D2_Beiblatt; 0) * D3)`

### B. Required Houses to Build (Columns W - Y & BB - BD)
Based on the incoming population, the sheet calculates how many houses of each category (FWH, GH, KMH) must be built to accommodate them, targeting a specific occupancy rate (defined in cell `$BB$100`, e.g. 90%):
* **FWH needed (Column BB)**:
  ```excel
  =ROUNDUP((New_Poor_Pop + Current_Poor_Pop) * (1 / Target_Occupancy) / 280) - Current_FWH_Houses
  ```
  *(where 280 is the capacity of one Fachwerkhaus)*
* Columns **W, X, Y** display these targets (if negative, it formats them with parentheses to denote shortages).

### C. Total Building Materials Required (Columns Z - AD)
Uses `SUMPRODUCT` to multiply the array of planned buildings (Businesses in `E:V` + Houses in `W:Y`) by the material costs defined in rows 46-49:
* **Bricks (`Ziegel`, Column Z)**: `=SUMPRODUCT(Planned_Buildings; Bricks_Cost_Row_46)`
* **Timber (`Holz`, Column AA)**: `=SUMPRODUCT(Planned_Buildings; Timber_Cost_Row_47)`
* **Tools (`Eisenwaren`, Column AB)**: `=SUMPRODUCT(Planned_Buildings; Tools_Cost_Row_48)`
* **Gold Cost (`Kosten`, Column AD)**: `=SUMPRODUCT(Planned_Buildings; Gold_Cost_Row_50) / Construction_Weeks`
