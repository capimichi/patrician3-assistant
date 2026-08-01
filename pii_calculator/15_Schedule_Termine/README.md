# Sheet 15: Schedule Planner (`15_Schedule_Termine`)

This sheet helps the player track recurring annual events and one-time deadlines in Patrician III. In Patrician III, timing is crucial: municipal mayoral elections (`Bürgermeisterwahl`), Hanseatic Alderman elections (`Eldermannwahl`), loan expiries, and city wall expansions (`Mauerbau`) occur on fixed dates. Missing these dates can severely penalize the player's political career.

---

## 1. Setup & Controls

* **Current Game Date (`$O$1`)**: The player inputs the current date in-game (e.g. `10.05.00` representing May 10th, 1300).
* **Alert Window (`$P$1`)**: Sizing parameter in days (e.g. `42` days, or 6 weeks). The sheet filters and highlights only events occurring within this window.

---

## 2. Row Calculations (Rows 2 - 100)

Each row documents a specific scheduled event:

* **Event Label (Column D)**: Concatenates city names with event types (e.g. `Bergen-BM-Wahl` for the Bergen Mayoral Election).
* **Annual Recurrence (`Jaehrlich`, Column C)**: Set to `"J"` if the event repeats every year on the same date (like elections), or blank if it is a single-time event.
* **Month (`I`) & Day (`J`)**: Extracted from the date string.
* **Adjusted Target Date (`K` & `M`)**:
  Calculates the next upcoming occurrence date. If the event is annual (`C = "J"`) and the date has already passed in the current game year, it increments the year counter to project the next occurrence:
  ```excel
  DATE(Projected_Year; Event_Month; Event_Day)
  ```
* **Days Remaining (`Abstand`, Column B)**:
  Estimates the exact number of days left until the event by comparing the target date with `$O$1`:
  ```excel
  =ROUND((Analysis.getYearfrac(Event_Date; Current_Date) - ROUNDDOWN(Analysis.getYearfrac(Event_Date; Current_Date))) * 365)
  ```
* **Visibility Filter (`Show`, Column L)**:
  Checks if the event target is within the alert window:
  ```excel
  =IF(AND(Event_Date >= Current_Date; Days_Remaining <= Alert_Window); 1; 0)
  ```

---

## 3. Tactical Importance

Knowing exactly when mayoral elections take place allows the player to schedule public donations, church expansions, and town feasts in the targeted city just before the vote to maximize their political approval ratings.
