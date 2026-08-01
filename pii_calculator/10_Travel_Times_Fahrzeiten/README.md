# Sheet 10: Travel Times (`10_Travel_Times_Fahrzeiten`)

This sheet is a static lookup database containing a symmetric **40x40 travel time matrix** that lists sailing times in days between all city pairs in Patrician III. It is a reference sheet used by both the Kontor Manager (`7_KH _Manager`) and Convoy Manager (`8_K_Manager`) to determine safety stock levels and cargo requirements.

---

## 1. Structure & Transposition Formula

The sheet layout is organized as a grid where both row headers (Rows 2 to 41) and column headers (Columns B to AO) list the 40 cities in the same order (Aalborg, Ahus, Bergen, etc.).

To ensure mathematical symmetry (sailing time from City $A$ to City $B$ must equal the time from $B$ to $A$), the cells in the upper-right triangle use a transposition formula referencing the lower-left data:

```excel
=INDEX($A$1:$AO$41; COLUMN(); ROW())
```

* **Symmetric lookup**:
  For instance, cell `C2` (sailing time from Aalborg to Ahus) matches the row 2 and column 3 coordinates. The formula transposes this to read cell `B3` (Ahus to Aalborg).

---

## 2. Importance in supply chain math

Autoconvoys in Patrician III operate on fixed loops. By looking up the round-trip travel time between the production city and the central warehouse (Zentrallager) from this matrix, the calculator computes:
1. **Convoy rotation frequency**: How often a convoy returns to supply the city.
2. **Buffer Stock sizing**: Daily city consumption multiplied by this travel time determines the minimum reserve of grain/wood/hemp that must remain locked in the Kontor.
