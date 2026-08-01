# Sheet 6: Consumption & Balances (`6_Consumption_Verbrauch`)

This sheet is the central engine of the calculator's supply chain logic. It computes weekly production, population consumption, and industrial raw material consumption for all 40 cities across all 18 Patrician III commodities. It also calculates net surpluses/shortages (divided by season) and aggregates these balances for regional warehouses (hubs).

---

## 1. Column Structure per Commodity

For each commodity, the sheet defines three variables repeated across columns:
* **`P`** (Production): Weekly output of the commodity in the city.
* **`V`** (Verbrauch / Consumption): Weekly consumption (population + industries).
* **`Ü/M`** (Überschuss/Mangel / Surplus or Shortage): Net balance (`P - V`).

For commodities affected by winter frost, production and balance are split into **Summer (`SO`)** and **Winter (`WI`)** columns.

### Resource Column Layout:
* **Columns B - D**: Beer (`Brauerei`) -> `P`, `V`, `Ü/M`
* **Columns E - H**: Iron Ore (`Erzmine`) -> `P (E)`, `P (I)`, `Cons. by Workshops (V)`, `Net Balance (Ü/M)`
* **Columns I - L**: Fish (`Fischer/Fisch`) -> `P (E)`, `P (I)`, `Cons. (V)`, `Net Balance (Ü/M)`
* **Columns M - O**: Train Oil (`Fischer/Tran`) -> `P (E)`, `Cons. (V)`, `Net Balance (Ü/M)`
* **Columns P - W**: Grain (`Getreide`) -> `P E(SO)`, `P E(WI)`, `P I(SO)`, `P I(WI)`, `Pop. Cons. (V)`, `Ind. Cons. (Brewery/Cattle)`, `Balance (SO)`, `Balance (WI)`
* **Columns X - AC**: Hemp (`Hanfhof`) -> `P E(SO)`, `P E(WI)`, `P I(SO)`, `P I(WI)`, `Pop. Cons. (V)`, `Ind. Cons. (Fisheries)`, `Balance (SO)`, `Balance (WI)`
* ... *This structure repeats up to Column DA (Spices / Gewürze) and DB (Spices Balance).*

---

## 2. Calculation Logic & Formulas

For any city row $r$ (Rows 5 - 44):

### A. Weekly Production (`P`)
Uses nested `IF` statements to look up the exact production coefficient from `5_Produktionszahlen` based on active businesses in `$3_Betriebe` for the city's specific size tier (1-2, 3-5, 6-8, 9+ businesses):
```excel
=IF(Count >= 9; Tier4_Rate * Count; IF(AND(Count > 2; Count < 6); Tier2_Rate * Count; IF(AND(Count > 5; Count < 9); Tier3_Rate * Count; Tier1_Rate * Count))) + Land_Trade_Adjustment
```

### B. Population Consumption (`V_pop`)
Calculates demand based on the city's current social class population from `2_Bevölkerung` multiplied by the weekly consumption rates per 1,000 citizens (defined in columns `DF` to `DH`):
```excel
=((Rich_Pop * Rich_Rate_per_1000) + (Wealthy_Pop * Wealthy_Rate_per_1000) + (Poor_Pop * Poor_Rate_per_1000)) / 1000 + Adjustment
```

### C. Industrial Raw Material Consumption (`V_ind`)
Farms and factories require raw materials (e.g. grain for breweries, wood for saltworks, salt and hemp for fishermen). The sheet computes this demand based on the city's active businesses:
* **Hemp for Fish Fishermen (Column AC)**: Consumed by fish-producing businesses in the city.
* **Grain for Breweries (Column U)**: Consumed by active breweries in the city.
* **Iron for Workshops (Column G)**: Consumed by local tool workshops.

### D. Adjustments (Row 90 & Row 131)
The cell formulas include a city-specific correction term (e.g. `+ [.B90]`). Row 90 dynamically handles:
1. **Land Trade Routes (`Landweg`)**: Adds or subtracts weekly cargo arriving/departing via land connections.
2. **New Settlements (`Niederlassung`)**: Integrates special consumption calculations for newly founded cities (linked from row 131). If the city is marked as a colony under construction, it disables standard calculations (`DC90 = 0`) and swaps to colony growth profiles.

---

## 3. Warehouse Hub Aggregations (Rows 48 - 64)

To support central warehouse logistics (Zentrallager strategy), the sheet aggregates balances for specific regional hubs defined in `1_Beiblatt` (e.g. Göteborg, Lubeck, Stettin):

* **Hub Membership Check**:
  In columns `DK` to `DU`, the sheet maintains binary mapping tables (1 = city is serviced by this hub, 0 = otherwise).
* **Aggregated Hub Balance (Row 66)**:
  Uses `SUMPRODUCT` combined with `INDIRECT` and `ADDRESS` to sum the surpluses and shortages of only the cities that belong to that specific hub's trade district:
  ```excel
  =SUMPRODUCT(Hanse_Balances_Row; INDIRECT(Hub_Boolean_Range_Address))
  ```
  *Example ( Göteborg Beer Balance Hub row 48 )*:
  `=SUMPRODUCT(D5:D44; INDIRECT("col_index_for_goteborg"))`

This lets the player see at a glance whether a regional convoy network has an overall surplus or deficit of goods, facilitating inter-hub transport logistics.
