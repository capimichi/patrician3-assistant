# Sheet 12: Reference Tables (`12_Table_Collection_Tabellensammlung`)

This sheet is an encyclopedic database compiling mechanics, parameters, and optimal trading rules for Patrician III, sourced from historical player forums (e.g. the German *Tippsammlung*). It serves as a static knowledge library that feeds other sheets.

---

## 1. Key Reference Datasets

### A. Immigration and Beggar Spawn Rates (`Zuwanderungstabelle`, Rows 5 - 19)
Tracks how many new immigrants (beggars / `Bettler`) arrive in a city per day based on the total municipal population and the presence of a School (`Schule`):
* **Population < 2,000**: 9 beggars/day (12 with school).
* **Population > 5,000**: 18 beggars/day (24 with school).
* **Population > 30,000**: 38 beggars/day (50 with school).
* *Note*: Beggars only convert into poor citizens (`Arme`) when both a job (business) and housing space (Fachwerkhaus) are available.
* *Note*: Every day, a maximum of 3 poor citizens can rise to wealthy, and 3 wealthy to rich, provided housing and quality of life criteria are met.

### B. Production Chain Ratios (`Produktionsketten`, Rows 24 - 36)
Lists the exact ratios between raw material producers (extractive industries) and processing plants:
* **Timber (Sägewerk)**:
  * $1 \text{ Sawmill} = 4 \text{ Saltworks}$
  * $1 \text{ Sawmill} = 20 \text{ Pitch Makers}$
  * $1 \text{ Sawmill} = 4 \text{ Brickworks}$
  * $1 \text{ Sawmill} = 20 \text{ Potteries}$
* **Wool (Schafzucht)**: $3 \text{ Sheep Farms} = 5 \text{ Weaving Mills}$
* **Iron Ore (Eisenschmelze)**: $1 \text{ Sawmill} + 3 \text{ Smelters} = 5 \text{ Workshops (Tools)}$
* **Grain (Getreidehof)**: $1 \text{ Sawmill} + 5 \text{ Grain Farms} = 28 \text{ Breweries}$
* **Hemp (Hanfhof)**: $1 \text{ Hemp Farm} + 1 \text{ Tool Workshop} = 50 \text{ Hunting Cabins (Skins)}$

### C. Merchant Ranking Requirements (`Aufstieg`, Rows 41 - 50)
Lists company net worth (`Unternehmenswert`), social status (`Soziales Ansehen`), and political reputation thresholds needed to rank up:
* **Händler (Trader)**: 100,000 Gold, 5 Social, 2 Political reputation.
* **Fernkaufmann (Merchant)**: 300,000 Gold, 5 Social, 10 Political reputation.
* **Patrizier (Patrician)**: 900,000 Gold, 50 Social, 50 Political reputation.

---

## 2. Advanced Trading & Arbitrage Price Tables (Rows 147 - 240)

Contains detailed purchasing and selling limits for the 20 commodities, designed by legendary forum strategists (**Gesil** and **Ugh!**). These bounds balance profit margins with public happiness (selling essential goods like grain, beer, or salt too high triggers citizen anger, whereas luxury items like skins or spices can be marked up aggressively).

* **Pricing Strategies**: Divided into *Moderate*, *Offensive*, and *Rabiat* (aggressive) price ceilings.
* **Weekly Profit Estimate (`Gewinn`, Row 218)**:
  Uses the selected pricing strategy to project weekly income under 100% market fulfillment (`Vollversorgung`):
  ```excel
  =SUMPRODUCT(Selling_Price_List; Weekly_City_Consumption)
  ```
