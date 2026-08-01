# Sheet 5: Production Rates (`5_Production_Rates_Produktionszahlen`)

This reference sheet acts as the static database of production and consumption coefficients for all business types in Patrician III. It is used by other sheets to calculate real weekly production volumes, raw material needs, and to normalize Ineffective businesses to their Effective equivalents.

---

## 1. Column Structure & Bonus Tiers

Production output and raw material consumption in Patrician III scale with the total number of active businesses of the same type in a city. This sheet models this behavior using 4 size tiers (Bonus Tiers):
1. **Tier 1 (`1 bis 2`)**: 1 to 2 active businesses (Base rate).
2. **Tier 2 (`3 bis 5`)**: 3 to 5 active businesses (~2.8% bonus).
3. **Tier 3 (`6 bis 8`)**: 6 to 8 active businesses (~5.9% bonus).
4. **Tier 4 (`ab 9`)**: 9 or more active businesses (~10.0% bonus).

The columns are grouped as follows:

| Columns | Category | Description |
| :--- | :--- | :--- |
| **A** | Business Type | Name of the business (e.g. `Brauerei`, `Erzmine`, etc.). |
| **B** | Category | `E` (Effective) or `I` (Ineffective). |
| **C - F** | Summer Production | Weekly production in Summer (divided into the 4 tiers: 1-2, 3-5, 6-8, 9+). |
| **G - J** | Winter Production | Weekly production in Winter (divided into the 4 tiers: 1-2, 3-5, 6-8, 9+). |
| **K - N** | Raw Material 1 Cons. | Weekly consumption of primary raw material (scaled across the 4 tiers). |
| **O - R** | Raw Material 2 Cons. | Weekly consumption of secondary raw material (scaled across the 4 tiers). |

---

## 2. Seasonal Production Modifiers (Winter vs. Summer)

Certain agricultural and weather-dependent businesses suffer production drops during the winter months. The sheet calculates winter rates using static formulas linking back to summer rates:

* **Grain Farm (`Getreidehof`)**:
  Winter production is reduced to **66.6%** ($\frac{2}{3}$) of summer production.
  *Formula (Cell G10)*: `=[.C10]*2/3`
* **Hemp Farm (`Hanfhof`)**:
  Winter production is reduced to **50.0%** of summer production.
  *Formula (Cell G12)*: `=[.C12]*0.5`
* **Beekeeper (`Imkerei` - Honey)**:
  Winter production is reduced to **50.0%** of summer production.
  *Formula (Cell G14)*: `=[.C14]*0.5`
* **Vineyard (`Weingut` - Wine)**:
  Winter production is reduced to **50.0%** of summer production.
  *Formula (Cell G31)*: `=[.C31]*0.5`

*All other businesses (industrial, mining, forestry) maintain constant production rates year-round (Winter = Summer).*

---

## 3. Industrial Consumption Ratios (Raw Materials)

This table defines the input-output ratios for manufacturing businesses:

| Business Type | Output Good | Raw Material 1 (Col K-N) | Raw Material 2 (Col O-R) |
| :--- | :--- | :--- | :--- |
| **Brewery (`Brauerei`)** | Beer | Grain (`Getreide`) | Wood (`Holz`) |
| **Fisher (`Fischer/Fisch`)** | Fish | Salt (`Salz`) | Hemp (`Hanf`) |
| **Fisher (`Fischer/Tr`)** | Train Oil / Whale Oil | *(Included in Fish Fisher)* | *(Included in Fish Fisher)* |
| **Hunting Lodge (`Jagdhütte`)** | Skins/Skins | Iron Goods (`Eisenwaren`) | Wine (`Wein`) |
| **Pitch Maker (`Pechkocher`)** | Pitch | Wood (`Holz`) | |
| **Saltworks (`Siederei`)** | Salt | Wood (`Holz`) | |
| **Pottery (`Töpferei`)** | Pottery | Wood (`Holz`) | |
| **Cattle Farm (`Viehhof`)** | Meat & Leather | Wood (`Holz`) | Grain (`Getreide`) |
| **Weaving Mill (`Weberei`)** | Cloth | Wool (`Wolle`) | |
| **Workshop (`Werkstatt`)** | Iron Goods | Iron (`Eisen`) | Wood (`Holz`) |
| **Brickworks (`Ziegelei`)** | Bricks | Wood (`Holz`) | |
