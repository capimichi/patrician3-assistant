# Sheet 3: Businesses (`3_Businesses_Betriebe`)

This sheet calculates the active number of businesses for each resource in each city, distinguishing between **Effective (E)** and **Ineffective (I)** production types. It also computes the total equivalent productive capacity across the Hanseatic League and the theoretical business requirements to meet league-wide consumption.

---

## 1. Column Structure & Resource Mapping

The columns `B` to `AE` correspond to 30 resource-efficiency combinations.
* **Row 1 (`Resource Name`)**: Original German resource names (e.g., `Brauerei`, `Erzmine`, `Fischer/Fisch`, etc.).
* **Row 2 (`Category`)**: `E` for Effective production, `I` for Ineffective production.

| Column | Resource | Category |
| :--- | :--- | :---: |
| **B** | Brewery (`Brauerei`) | E |
| **C** | Iron Mine (`Erzmine`) | E |
| **D** | Iron Mine (`Erzmine`) | I |
| **E** | Fisher/Fish (`Fischer/Fisch`) | E |
| **F** | Fisher/Fish (`Fischer/Fisch`) | I |
| **G** | Fisher/Train Oil (`Fischer/Tr`) | E |
| **H** | Grain Farm (`Getreidehof`) | E |
| **I** | Grain Farm (`Getreidehof`) | I |
| **J** | Hemp Farm (`Hanfhof`) | E |
| **K** | Hemp Farm (`Hanfhof`) | I |
| **L** | Beekeeper (`Imkerei` - Honey) | E |
| **M** | Beekeeper (`Imkerei` - Honey) | I |
| **N** | Hunting Lodge (`Jagdhütte` - Skins) | E |
| **O** | Hunting Lodge (`Jagdhütte` - Skins) | I |
| **P** | Pitch Maker (`Pechkocher`) | E |
| **Q** | Sawmill (`Sägewerk`) | E |
| **R** | Sawmill (`Sägewerk`) | I |
| **S** | Sheep Farm (`Schafshof` - Wool) | E |
| **T** | Sheep Farm (`Schafshof` - Wool) | I |
| **U** | Saltworks (`Siederei`) | E |
| **V** | Pottery (`Töpferei`) | E |
| **W** | Pottery (`Töpferei`) | I |
| **X** | Cattle Farm (`Viehhof` - Meat/Leather) | E |
| **Y** | Cattle Farm (`Viehhof` - Meat/Leather) | I |
| **Z** | Weaving Mill (`Weberei` - Cloth) | E |
| **AA** | Vineyard (`Weingut` - Wine) | E |
| **AB** | Vineyard (`Weingut` - Wine) | I |
| **AC** | Workshop (`Werkstatt` - Iron Goods) | E |
| **AD** | Brickworks (`Ziegelei`) | E |
| **AE** | Brickworks (`Ziegelei`) | I |

### Helper Mapping Rows:
* **Row 67 (`Production Type Indicator`)**: Defines expected hidden state code from the Beiblatt sheet.
  * `2` = Green / Effective
  * `1` = Red / Ineffective
* **Row 68 (`Source Column Mapping`)**: Maps the 30 columns of this sheet back to the 18 simplified input columns in `1_Beiblatt` (`$1_Beiblatt.$E$2:.$V$41`).

---

## 2. Row Layout

* **Rows 3 - 42**: The 40 cities of Patrician 3 (linked from `1_Beiblatt.A2:A41`).
* **Rows 73 - 112**: City production status lookup table (hidden).
* **Rows 115 - 154**: City raw business count lookup table (hidden).
* **Rows 157 - 196**: City business state indicator table (`Anzeige` - hidden).
* **Row 45**: Sum of active Effective businesses (`Betriebe E`).
* **Row 46**: Sum of active Ineffective businesses (`Betriebe I`).
* **Row 47**: Ineffective businesses converted to Effective equivalents (`Betriebe I in E`).
* **Row 48**: Total effective equivalent businesses (`Betriebe Ges.`).
* **Rows 50 - 52**: Theoretical businesses required to cover consumption.

---

## 3. Calculation Logic & Formulas

### A. City Production Status Lookup (Rows 73 - 112)
Retrieves the color-coded production status (0 = Inactive, 1 = Ineffective, 2 = Effective) from the hidden Beiblatt matrix:
```excel
=INDEX($1_Beiblatt.$E$51:.$V$90; ROW() - formatzeile; COLUMN_MAP_ROW_68)
```
*(where `formatzeile = 70`)*

### B. Raw Business Count Lookup (Rows 115 - 154)
Retrieves the raw count of businesses entered by the user in `1_Beiblatt`:
```excel
=INDEX($1_Beiblatt.$E$2:.$V$41; ROW() - anzahlzeile; COLUMN_MAP_ROW_68)
```
*(where `anzahlzeile = 112`)*

### C. State Indicator `Anzeige` (Rows 157 - 196)
Determines the business status and if the production bonus is active (which requires at least 9 of the same business type in a city).
For standard columns:
```excel
=IF(EXPECTED_TYPE_ROW_67 <> STATUS_ROW_73; 0; IF(AND(COUNT_ROW_115 > 0; COUNT_ROW_115 < 9); 3; IF(STATUS_ROW_73 = 1; 1; 2)))
```
* **`0`**: Inactive (or belongs to the other efficiency category column).
* **`1`**: Active Ineffective (and $\ge$ 9 businesses, full bonus).
* **`2`**: Active Effective (and $\ge$ 9 businesses, full bonus).
* **`3`**: Under Capacity (1 to 8 businesses, production bonus not fully reached).

#### Special Fishery Fish Ineffective Rule (Column F):
Fishermen produce both fish and train oil. In cities where they produce Train Oil (always Effective), they produce Fish ineffectively. Thus, Column F (`Fischer/Fisch I`) indicator checks if Train Oil status is active (`F73 = 2`) and links to the Train Oil fisherman count (`G115`):
```excel
=IF(2 <> F73; 0; IF(AND(G115 > 0; G115 < 9); 3; 1))
```

### D. Active Businesses Output (Rows 3 - 42)
For each city and column, prints the active count if the indicator is non-zero:
```excel
=IF(INDICATOR_ROW_157 <> 0; COUNT_ROW_115; 0)
```

### E. Total Equivalency Conversion (Row 47)
Ineffective businesses produce fewer goods per week than effective ones. To sum overall capacity, ineffective businesses are normalized to effective equivalents using coefficients from `5_Produktionszahlen`:
```excel
=INEFFECTIVE_SUM_ROW_46 * INEFFECTIVE_RATE / EFFECTIVE_RATE
```
*Example for Iron Mine (Column C/D)*:
```excel
=D46 * $5_Produktionszahlen.F6 / $5_Produktionszahlen.F5
```
*Total Equivalent Businesses (`Betriebe Ges.`, Row 48)*:
```excel
=EFFECTIVE_SUM_ROW_45 + EQUIVALENT_SUM_ROW_47
```

### F. Required Businesses (Rows 50 - 52)
Computes how many effective businesses would be needed to satisfy the total consumption of the Hanseatic League:
* **Summer Demand (`Betriebe Ü/M SO`, Row 50)**:
  ```excel
  =ROUNDUP(SUMMER_WEEKLY_CONSUMPTION / EFFECTIVE_WEEKLY_PRODUCTION_PER_BUSINESS)
  ```
  *Example (Brewery)*: `=ROUNDUP($6_Verbrauch.D45 / $5_Produktionszahlen.F4)`
* **Winter Demand (`Betriebe Ü/M WI`, Row 51)**:
  Only calculated for seasonal items (Grain, Hemp, Honey, Wine, etc.):
  ```excel
  =ROUNDUP(WINTER_WEEKLY_CONSUMPTION / EFFECTIVE_WEEKLY_PRODUCTION_PER_BUSINESS)
  ```
* **Weighted Annual Demand (`Betriebe Ü/M ges`, Row 52)**:
  Ponders summer (9 months, $\frac{3}{4}$) and winter (3 months, $\frac{1}{4}$) requirements:
  ```excel
  =(SUMMER_DEMAND * 3 + WINTER_DEMAND) / 4
  ```
  *(For non-seasonal resources, this is equal to summer demand).*
