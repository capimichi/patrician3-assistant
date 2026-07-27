# UI Tables and Business Detail Page Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor TownsList badge, update row hover styling in database tables, simplify empty raw materials display, and move yield details to a dedicated right-hand box in BusinessDetail.

**Architecture:** Edit existing database components (`TownsList`, `GoodsList`, `BusinessesList`, `BusinessDetail`) to align styling, column headers, and details layouts.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Vitest.

## Global Constraints

- Maintain documentation integrity. Preserve all existing comments and docstrings.
- Test each change with Vitest ensuring clean build output and passing test suites.

---

### Task 1: TownsList Fluviale Badge Removal & Row Hover Update

**Files:**
- Modify: `src/pages/database/TownsList.tsx:167-182`
- Test: `src/pages/database/TownsList.test.tsx`

**Interfaces:**
- Consumes: Existing Town data format from TownService.
- Produces: Updated Town list table without inline River badges and with enhanced hover styling.

- [ ] **Step 1: Edit TownsList component**
  Remove the conditional `isRiverTown` badge in the town name cell and update the row `className` to have stronger hover styling:
  ```typescript
  // Find this section in TownsList.tsx:
  filteredTowns.map((town) => (
    <tr
      key={town.id}
      onClick={() => navigate(`/database/towns/${town.id}`)}
      className="cursor-pointer transition-all duration-150 hover:bg-primary/10 bg-background border-l-4 border-transparent hover:border-primary/40 hover:shadow-xs active:bg-primary/15"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <Compass className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="text-sm font-semibold text-neutral-dark">{town.name}</div>
        </div>
      </td>
  ```

- [ ] **Step 2: Run test suite to verify no regressions**
  Run: `npx vitest run src/pages/database/TownsList.test.tsx`
  Expected output: PASS

---

### Task 2: GoodsList Row Hover Update

**Files:**
- Modify: `src/pages/database/GoodsList.tsx:169-175`
- Test: `src/pages/database/GoodsList.test.tsx`

**Interfaces:**
- Consumes: Existing Goods list.
- Produces: Enhanced hover styling on Goods table rows.

- [ ] **Step 1: Edit GoodsList component row class**
  Update the row `className` in `src/pages/database/GoodsList.tsx`:
  ```typescript
  // Find this section in GoodsList.tsx:
  filteredGoods.map((good) => (
    <tr
      key={good.id}
      onClick={() => navigate(`/database/goods/${good.id}`)}
      className="cursor-pointer transition-all duration-150 hover:bg-primary/10 bg-background border-l-4 border-transparent hover:border-primary/40 hover:shadow-xs active:bg-primary/15"
    >
  ```

- [ ] **Step 2: Run test suite to verify no regressions**
  Run: `npx vitest run src/pages/database/GoodsList.test.tsx`
  Expected output: PASS

---

### Task 3: BusinessesList Row Hover, Column Labels & Empty Inputs Semplification

**Files:**
- Modify: `src/pages/database/BusinessesList.tsx:12-19`, `src/pages/database/BusinessesList.tsx:173-179`, `src/pages/database/BusinessesList.tsx:262-267`
- Test: `src/pages/database/BusinessesList.test.tsx`

**Interfaces:**
- Consumes: Existing Business lists.
- Produces: Updated businesses list with correct column configuration, center-aligned dash for empty inputs, and new hover styles.

- [ ] **Step 1: Edit column config in BusinessesList.tsx**
  Change the column key `product` label:
  ```typescript
  const ALL_COLUMNS = [
    { id: 'product', labelIt: 'Prodotti in Uscita', labelEn: 'Produced Goods' },
    { id: 'production', labelIt: 'Produzione', labelEn: 'Production' },
    { id: 'maintenance', labelIt: 'Manutenzione', labelEn: 'Maintenance' },
    { id: 'inputs', labelIt: 'Materie Prime', labelEn: 'Raw Materials' },
    { id: 'workers', labelIt: 'Lavoratori', labelEn: 'Workers' },
    { id: 'cost', labelIt: 'Costi Edificazione', labelEn: 'Build Cost' }
  ];
  ```

- [ ] **Step 2: Update row hover style class in BusinessesList.tsx**
  Update the table row className:
  ```typescript
  filteredBusinesses.map((business) => {
    return (
      <tr
        key={business.id}
        onClick={() => navigate(`/database/businesses/${business.id}`)}
        className="cursor-pointer transition-all duration-150 hover:bg-primary/10 bg-background border-l-4 border-transparent hover:border-primary/40 hover:shadow-xs active:bg-primary/15"
      >
  ```

- [ ] **Step 3: Update empty raw materials display in BusinessesList.tsx**
  Replace the empty inputs text badge with a clean dash:
  ```typescript
  // Find the conditional in BusinessesList.tsx:
  ) : (
    <span className="text-gray-400 font-mono text-center block w-full select-none" title={t('database_businesses.no_raw_needed')}>
      —
    </span>
  )}
  ```

- [ ] **Step 4: Run test suite to verify no regressions**
  Run: `npx vitest run src/pages/database/BusinessesList.test.tsx`
  Expected output: PASS

---

### Task 4: BusinessDetail Production Yield Refactoring

**Files:**
- Modify: `src/pages/database/BusinessDetail.tsx:122-161`, `src/pages/database/BusinessDetail.tsx:170-176`
- Test: `src/pages/database/BusinessDetail.test.tsx`

**Interfaces:**
- Consumes: Business details with inputs and outputs.
- Produces: Streamlined left card (without yield details) and a new right card displaying output production details with the same look and feel as inputs.

- [ ] **Step 1: Remove detailed production yield section from left card**
  In `src/pages/database/BusinessDetail.tsx`, remove:
  ```typescript
  <div className="flex flex-col border-b border-primary/5 pb-2">
    <span className="text-sm font-semibold text-gray-700 flex items-center mb-1.5">
      <Sparkles className="h-4 w-4 text-success mr-1.5" /> {t('database_businesses.production_yield')}
    </span>
    <div className="space-y-1 pl-5">
      {business.outputs.map((out: any) => {
        const gObj = goodsList.find(g => g.id === out.goodId);
        const gName = gObj ? gObj.name : out.goodId;
        return (
          <div key={out.goodId} className="flex justify-between items-center text-xs font-mono font-bold text-success">
            <span>{gName}:</span>
            <span className="inline-flex items-center">
              <GameIcon type="hourglass" className="h-3.5 w-3.5 mr-1" />
              +{out.amountPerDay} /{t('production.day')}
            </span>
          </div>
        );
      })}
    </div>
  </div>
  ```
  Ensure maintenance cost and workers needed remain.

- [ ] **Step 2: Add the new "Resa di Produzione" card in the right column**
  Immediately above the raw materials section in the right column (`lg:col-span-2 space-y-6`), insert the outputs card:
  ```typescript
  {/* Resa di Produzione (Output) */}
  <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
    <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
      <Sparkles className="h-5 w-5 text-primary" />
      <span>{t('database_businesses.production_yield')}</span>
    </h3>

    <div className="space-y-2">
      {business.outputs.map((out: any) => {
        const outGood = goodsList.find(g => g.id === out.goodId);
        const outGoodName = outGood ? outGood.name : out.goodId;
        return (
          <Link
            key={out.goodId}
            to={`/database/goods/${out.goodId}`}
            className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
          >
            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
              <img
                src={getGoodImagePath(out.goodId)}
                alt={outGoodName}
                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
              />
              <span className="group-hover:text-primary transition-colors">{outGoodName}</span>
            </span>
            <span className="text-sm font-bold text-success font-mono inline-flex items-center">
              <GameIcon type="load" className="h-3.5 w-3.5 mr-1" />
              +{out.amountPerDay} /
              <GameIcon type="hourglass" className="h-3.5 w-3.5 mx-1" />
              {t('production.day')}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
  ```
  Ensure to import `Sparkles` at the top of the file if not already imported (it's already imported at line 5).

- [ ] **Step 3: Run test suite to verify correctness**
  Run: `npx vitest run src/pages/database/BusinessDetail.test.tsx`
  Expected output: PASS

---

### Task 5: Run Production Build and Smoke Tests

- [ ] **Step 1: Check build**
  Run: `npm run build`
  Expected: Successful compilation with no TS/Vite errors.

- [ ] **Step 2: Run all tests**
  Run: `npm run test`
  Expected: All tests pass.
