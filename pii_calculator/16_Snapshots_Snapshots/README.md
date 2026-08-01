# Sheet 16: Progress Snapshots (`16_Snapshots_Snapshots`)

This sheet is marked as under construction (`BAUSTELLE`). It acts as a historical database that tracks the player's economic progress and population growth over time across all 40 cities, offering richer statistical charts than the game's default built-in ledger.

---

## 1. Grid Layout and Matrix Structure

To bypass the old spreadsheet column limit (256 columns in legacy formats), the snapshots database is structured vertically:
* **Rows (1,000+)**: Represents every combination of the **40 cities** and their **25+ metrics**.
* **Columns (250+)**: Represents distinct time intervals (dates in-game).

### vertical metric partitioning (Blocks of 40 rows):
* **Rows 2 - 41**: Rich population (`Reiche`) count for each of the 40 cities.
* **Rows 42 - 81**: Wealthy population (`Wohlis`) count.
* **Rows 82 - 121**: Poor population (`Arme`) count.
* **Rows 122 - 161**: Brewery count (`Brauerei`) per city.
* **Rows 162 - 201**: Iron Mine count (`Erzmine`).
* ...and so on for all remaining production buildings and housing categories.

---

## 2. Calculation Logic & Formula Mechanics

* **Current Value Lookup (`Aktuell`, Column E)**:
  This column dynamically pulls the *current* state of the city metric from `1_Beiblatt` or `2_Bevölkerung` using row-index division math:
  ```excel
  =INDEX(1_Beiblatt.$B$2:$Y$41; ABRUNDEN(REST(ZEILE()-2;40))+1; ABRUNDEN((ZEILE()-2)/40)+1)
  ```
  * `ZEILE()` (Row index) determines which city (1 to 40) and which metric column to extract, translating the flat 1000-row list back into coordinates.

* **Historical Columns (Columns F, G, H...)**:
  To log a snapshot, the player enters the in-game date at the top of a new column (e.g. cell `F1`) and copies the dynamic values of Column E (`Aktuell`), pasting them into the target date column as static values (using OpenOffice **Paste Special -> Values Only**).

This enables long-term historical tracking of the Hanseatic expansion, showing how demographic classes grow and industries evolve city-by-city over years of gameplay.
