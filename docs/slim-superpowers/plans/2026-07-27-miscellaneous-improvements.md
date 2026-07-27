# Miscellaneous Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement miscellaneous improvements (gold icon, link unification, navigation menu simplification, and cross-linking between items).

**Architecture:** Create reusable `GoldAmount` and `TownLinkList` components, then refactor detail/list pages and calculators to use them, providing real links across the application.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, react-router-dom, react-i18next, Vitest, React Testing Library.

## Global Constraints

* Use `/images/gold.png` for monetary references.
* Use `/images/goods/bricks.png` and `/images/goods/timber.png` for bricks and timber icons respectively in construction costs.
* Change `header.towns` key translation in `src/i18n.ts` to "Città" (IT) and "Towns" (EN).
* Links in calculators navigate directly in the same tab.

---

### Task 1: Create Reusable Components (`GoldAmount` and `TownLinkList`)

**Files:**
* Create: `src/components/GoldAmount.tsx`
* Create: `src/components/GoldAmount.test.tsx`
* Create: `src/components/TownLinkList.tsx`
* Create: `src/components/TownLinkList.test.tsx`

**Interfaces:**
* Consumes: Nothing
* Produces:
  * `GoldAmount`: `React.FC<{ amount: number | string; className?: string; iconSize?: string; }>`
  * `TownLinkList`: `React.FC<{ towns: Town[]; emptyMessage: string; variant?: 'grid' | 'list'; }>`

- [ ] **Step 1: Write tests for `GoldAmount`**

Create `src/components/GoldAmount.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { GoldAmount } from './GoldAmount';

test('renders amount and gold icon', () => {
  render(<GoldAmount amount={150} />);
  expect(screen.getByText('150')).toBeDefined();
  const img = screen.getByRole('img');
  expect(img.getAttribute('src')).toBe('/images/gold.png');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/GoldAmount.test.tsx`
Expected: FAIL due to missing `GoldAmount` component.

- [ ] **Step 3: Implement `GoldAmount`**

Create `src/components/GoldAmount.tsx`:
```tsx
import React from 'react';

interface GoldAmountProps {
  amount: number | string;
  className?: string;
  iconSize?: string;
}

export const GoldAmount: React.FC<GoldAmountProps> = ({
  amount,
  className = "font-mono font-bold text-neutral-dark",
  iconSize = "h-4 w-4"
}) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{amount}</span>
      <img
        src="/images/gold.png"
        alt="oro"
        className={`${iconSize} object-contain inline-block align-middle`}
      />
    </span>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/GoldAmount.test.tsx`
Expected: PASS

- [ ] **Step 5: Write tests for `TownLinkList`**

Create `src/components/TownLinkList.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import { TownLinkList } from './TownLinkList';
import type { Town } from '../types';

const mockTowns: Town[] = [
  { id: 'lubeck', name: 'Lubecca', isRiverTown: false, produces: [] },
  { id: 'stettin', name: 'Stettino', isRiverTown: true, produces: [] }
];

test('renders empty message when no towns', () => {
  render(<TownLinkList towns={[]} emptyMessage="Nessuna città" />);
  expect(screen.getByText('Nessuna città')).toBeDefined();
});

test('renders towns as links with river badge', () => {
  render(
    <MemoryRouter>
      <TownLinkList towns={mockTowns} emptyMessage="Nessuna città" variant="grid" />
    </MemoryRouter>
  );
  const lubeckLink = screen.getByText('Lubecca').closest('a');
  expect(lubeckLink?.getAttribute('href')).toBe('/database/towns/lubeck');

  const stettinLink = screen.getByText('Stettino').closest('a');
  expect(stettinLink?.getAttribute('href')).toBe('/database/towns/stettin');
  expect(screen.getByText('Fluviale')).toBeDefined();
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- src/components/TownLinkList.test.tsx`
Expected: FAIL due to missing `TownLinkList` component.

- [ ] **Step 7: Implement `TownLinkList`**

Create `src/components/TownLinkList.tsx`:
```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Town } from '../types';

interface TownLinkListProps {
  towns: Town[];
  emptyMessage: string;
  variant?: 'grid' | 'list';
}

export const TownLinkList: React.FC<TownLinkListProps> = ({
  towns,
  emptyMessage,
  variant = 'list'
}) => {
  if (towns.length === 0) {
    return <p className="text-xs text-gray-600 italic">{emptyMessage}</p>;
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {towns.map((town) => (
          <Link
            key={town.id}
            to={`/database/towns/${town.id}`}
            className="bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
          >
            <span className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">
              {town.name}
            </span>
            {town.isRiverTown && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {towns.map((town) => (
        <li key={town.id} className="text-sm font-semibold bg-background px-2.5 py-1.5 rounded border border-primary/5 hover:border-primary/25 transition-all">
          <Link
            to={`/database/towns/${town.id}`}
            className="text-neutral-dark hover:text-primary transition-colors flex items-center justify-between"
          >
            <span>{town.name}</span>
            {town.isRiverTown && (
              <span className="text-3xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                Fluviale
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm run test -- src/components/TownLinkList.test.tsx`
Expected: PASS

---

### Task 2: Rename "Database Città" to "Città" in menu

**Files:**
* Modify: `src/i18n.ts:14,52`

**Interfaces:**
* Consumes: Translation resources
* Produces: Updated translations for towns navigation

- [ ] **Step 1: Write failing test in Header**

Modify `src/components/layout/Header.test.tsx` to assert that it contains the text `Città` instead of `Database Città`. (Note: header test currently mocks translation. We can verify translation file contents or simply test the mock if needed. Let's make sure `src/i18n.ts` is updated and existing tests continue to pass).

- [ ] **Step 2: Update `src/i18n.ts`**

Modify `src/i18n.ts` to change:
```diff
-        towns: "Database Città",
+        towns: "Città",
```
and English:
```diff
-        towns: "Town Database",
+        towns: "Towns",
```

- [ ] **Step 3: Run all tests to make sure no breaks**

Run: `npm run test -- --run`
Expected: PASS

---

### Task 3: Refactor Business Detail Page (`BusinessDetail.tsx`)

**Files:**
* Modify: `src/pages/database/BusinessDetail.tsx`

**Interfaces:**
* Consumes: `TownLinkList` component, `/images/gold.png`, `/images/goods/bricks.png`, `/images/goods/timber.png`
* Produces: Updated business details view with prepended icons in construction costs, links in outputs, and unified towns list.

- [ ] **Step 1: Update imports in `BusinessDetail.tsx`**

Add imports:
```typescript
import { Link } from 'react-router-dom';
import { TownLinkList } from '../../components/TownLinkList';
import { GoldAmount } from '../../components/GoldAmount';
```

- [ ] **Step 2: Modify output good representation to be clickable**

Wrap each business output in a `<Link to={\`/database/goods/\${out.goodId}\`}>` instead of just a static `span`:
```tsx
                  {business.outputs.map((out: any) => {
                    const gObj = goodsList.find(g => g.id === out.goodId);
                    const gName = gObj ? gObj.name : out.goodId;
                    return (
                      <Link
                        key={out.goodId}
                        to={`/database/goods/${out.goodId}`}
                        className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded border border-primary/20 flex items-center space-x-1 transition-colors"
                      >
                        <img src={getGoodImagePath(out.goodId)} alt={gName} className="h-3.5 w-3.5 object-contain" />
                        <span>{gName}</span>
                      </Link>
                    );
                  })}
```

- [ ] **Step 3: Modify input good representation to be clickable with standard Link**

Replace `onClick={() => navigate(...)` with `<Link to={\`/database/goods/\${input.goodId}\`}>` block:
```tsx
                    <Link
                      key={input.goodId}
                      to={`/database/goods/${input.goodId}`}
                      className="flex justify-between items-center bg-background px-3 py-2.5 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
                    >
                      <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                        <img
                          src={getGoodImagePath(input.goodId)}
                          alt={inputGoodName}
                          className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                        />
                        <span className="group-hover:text-primary transition-colors">{inputGoodName}</span>
                      </span>
                      <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay} /giorno</span>
                    </Link>
```

- [ ] **Step 4: Use `GoldAmount` for daily maintenance**

```tsx
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <Coins className="h-4 w-4 text-primary mr-1.5" /> Manutenzione
                </span>
                <GoldAmount amount={`${business.dailyMaintenance} /giorno`} className="font-mono font-bold text-danger text-sm" />
              </div>
```

- [ ] **Step 5: Add icons to Construction Cost block**

Update construction costs grid:
```tsx
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Oro</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src="/images/gold.png" alt="Oro" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-primary font-mono">{business.constructionCost.gold}</span>
                </div>
              </div>
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Mattoni</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src={getGoodImagePath('bricks')} alt="Mattoni" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-neutral-dark font-mono">{business.constructionCost.bricks}</span>
                </div>
              </div>
              <div className="bg-background p-3 rounded flex flex-col items-center justify-center border border-primary/10 shadow-xs">
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Legno</p>
                <div className="flex items-center space-x-1.5 mt-1">
                  <img src={getGoodImagePath('timber')} alt="Legno" className="h-5 w-5 object-contain" />
                  <span className="text-lg font-bold text-neutral-dark font-mono">{business.constructionCost.timber}</span>
                </div>
              </div>
            </div>
```

- [ ] **Step 6: Replace producing towns block with `TownLinkList`**

```tsx
          {/* Geografia della Produzione */}
          <div className="bg-white border border-primary/20 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold font-serif text-primary border-b border-primary/20 pb-3 mb-4 flex items-center space-x-2" style={{ fontFamily: "'Cinzel', serif" }}>
              <Landmark className="h-5 w-5 text-primary" />
              <span>Città di Produzione Efficace (Resa 100%)</span>
            </h3>

            <TownLinkList
              towns={producingTowns}
              emptyMessage="Questa risorsa non è una specializzazione di default di alcuna città della Lega Ansea. Verrà prodotta ovunque con penalità di rendimento."
              variant="grid"
            />
          </div>
```

- [ ] **Step 7: Run test to check if it works**

Run: `npm run test -- src/pages/database/BusinessDetail.test.tsx`
Expected: PASS

---

### Task 4: Refactor Good Detail Page (`GoodDetail.tsx`)

**Files:**
* Modify: `src/pages/database/GoodDetail.tsx`

**Interfaces:**
* Consumes: `TownLinkList` component, `GoldAmount` component
* Produces: Updated goods detail page with gold icon in price listings, links in town/business references, and resource icons in construction cost.

- [ ] **Step 1: Import components in `GoodDetail.tsx`**

Add imports:
```typescript
import { TownLinkList } from '../../components/TownLinkList';
import { GoldAmount } from '../../components/GoldAmount';
```

- [ ] **Step 2: Replace price text representations with `GoldAmount`**

For Base Price:
```tsx
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Base di Riferimento</span>
                <GoldAmount amount={good.basePrice} />
              </div>
```
For Buy Max Price:
```tsx
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  Acquisto Consigliato (Max)
                </span>
                <GoldAmount
                  amount={good.buyPriceRange[0] === good.buyPriceRange[1]
                    ? `${good.buyPriceRange[0]}`
                    : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`}
                  className="font-mono font-bold text-success"
                />
              </div>
```
For Sell Min Price:
```tsx
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Vendita Consigliata (Min)</span>
                <GoldAmount
                  amount={`${good.sellPriceRange[0]}-${good.sellPriceRange[1]}`}
                  className="font-mono font-bold text-primary"
                />
              </div>
```
For Satisfaction Price:
```tsx
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span className="text-sm font-semibold text-gray-700">Prezzo Max per Soddisfazione</span>
                {good.maxSatisfactionPrice ? <GoldAmount amount={good.maxSatisfactionPrice} /> : <span className="font-mono font-bold text-neutral-dark">-</span>}
              </div>
```

- [ ] **Step 3: Modify Business Detail reference in `GoodDetail.tsx`**

Wrap business name in a `Link` component:
```tsx
                <div>
                  <Link to={`/database/businesses/${business.id}`} className="hover:underline">
                    <h4 className="text-xl font-bold font-serif text-primary" style={{ fontFamily: "'Cinzel', serif" }}>
                      {business.name}
                    </h4>
                  </Link>
                  <p className="text-gray-700 text-xs">Laboratorio di produzione standard</p>
                </div>
```

- [ ] **Step 4: Update Inputs/Daily Maintenance/Construction Costs in Associated Business**

Update Daily Maintenance with GoldAmount:
```tsx
                  <div className="bg-background border border-primary/10 p-3 rounded text-center">
                    <p className="text-2xs text-gray-600 uppercase tracking-widest font-bold">Manutenzione/Giorno</p>
                    <GoldAmount amount={business.dailyMaintenance} className="text-xl font-bold text-danger font-mono mt-1" />
                  </div>
```
Update Inputs with Link Component:
```tsx
                      {business.inputs.map((input: any) => {
                        const inputGood = goodsList.find(g => g.id === input.goodId);
                        return (
                          <Link
                            key={input.goodId}
                            to={`/database/goods/${input.goodId}`}
                            className="flex justify-between items-center bg-background px-3 py-2 rounded border border-primary/5 hover:border-primary/30 transition-colors group"
                          >
                            <span className="text-sm text-neutral-dark font-semibold flex items-center space-x-2">
                              <img
                                src={getGoodImagePath(input.goodId)}
                                alt={input.goodId}
                                className="h-6 w-6 object-contain border border-primary/10 rounded bg-white p-0.5"
                              />
                              <span className="group-hover:text-primary transition-colors">{inputGood ? inputGood.name : input.goodId}</span>
                            </span>
                            <span className="text-sm font-bold text-danger font-mono">-{input.amountPerDay}</span>
                          </Link>
                        );
                      })}
```
Update construction costs section in `GoodDetail.tsx` with resource icons:
```tsx
                {/* Costi di Costruzione */}
                <div className="border-t border-primary/10 pt-4">
                  <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-3">Requisiti di Edificazione</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src="/images/gold.png" alt="Oro" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-primary font-mono">{business.constructionCost.gold}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('bricks')} alt="Mattoni" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{business.constructionCost.bricks}</span>
                      </div>
                    </div>
                    <div className="bg-background p-2 rounded flex flex-col items-center justify-center border border-primary/10 text-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('timber')} alt="Legno" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{business.constructionCost.timber}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-3xs text-gray-600 mt-2 text-right italic font-medium">
                    Richiede {business.workersNeeded} lavoratori attivi
                  </p>
                </div>
```

- [ ] **Step 5: Replace Geography Producing and Consuming Towns with `TownLinkList`**

```tsx
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città Produttrici (Produzione Efficace)</h4>
                <TownLinkList
                  towns={producingTowns}
                  emptyMessage="Non prodotta in alcuna città dell'Hansa di default."
                  variant="list"
                />
              </div>

              <div>
                <h4 className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2.5">Città che Consumano (Uso Industriale)</h4>
                <TownLinkList
                  towns={consumingTowns}
                  emptyMessage="Nessuna industria anseatica consuma questa merce."
                  variant="list"
                />
              </div>
            </div>
```

- [ ] **Step 6: Run test to check if it works**

Run: `npm run test -- src/pages/database/GoodDetail.test.tsx`
Expected: PASS

---

### Task 5: Refactor Town Detail Page (`TownDetail.tsx`) and Buildings Database (`Buildings.tsx`)

**Files:**
* Modify: `src/pages/database/TownDetail.tsx`
* Modify: `src/pages/database/Buildings.tsx`

**Interfaces:**
* Consumes: `GoldAmount` component, `Link` component
* Produces: Links to goods details from town page, gold icons and resource icons in residential buildings page.

- [ ] **Step 1: Update Town Detail page links to use standard `Link`**

Modify `src/pages/database/TownDetail.tsx` to import `Link` and wrap town specializations:
```tsx
            {town.produces.map((goodId) => {
              const goodObj = goods.find(g => g.id === goodId);
              const goodName = goodObj ? goodObj.name : goodId;
              return (
                <Link
                  key={goodId}
                  to={`/database/goods/${goodId}`}
                  className="bg-background border border-success/20 hover:border-success/50 hover:bg-success/5 rounded p-3 flex items-center space-x-3 transition-colors group"
                >
                  <img
                    src={getGoodImagePath(goodId)}
                    alt={goodName}
                    className="h-8 w-8 object-contain border border-primary/10 rounded bg-white p-0.5 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23643518" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-dark group-hover:text-primary transition-colors">{goodName}</p>
                    <p className="text-[10px] text-success font-bold uppercase">Resa 100%</p>
                  </div>
                </Link>
              );
            })}
```

- [ ] **Step 2: Update Buildings page imports**

Modify `src/pages/database/Buildings.tsx`:
```typescript
import { GoldAmount } from '../../components/GoldAmount';
import { getGoodImagePath } from '../../utils/goodImage';
```

- [ ] **Step 3: Update weekly rent to use `GoldAmount`**

Modify `src/pages/database/Buildings.tsx` weekly rent rendering block:
```tsx
                  <div className="grid grid-cols-3 gap-2 bg-background p-2.5 rounded border border-primary/10 text-center">
                    <div>
                      <p className="text-3xs text-gray-600 font-bold uppercase">Poveri</p>
                      <p className="text-sm font-bold text-success mt-1">
                        {building.weeklyRent.poor > 0 ? (
                          <GoldAmount amount={`+${building.weeklyRent.poor}`} className="text-success" />
                        ) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-600 font-bold uppercase">Benestanti</p>
                      <p className="text-sm font-bold text-success mt-1">
                        {building.weeklyRent.wealthy > 0 ? (
                          <GoldAmount amount={`+${building.weeklyRent.wealthy}`} className="text-success" />
                        ) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xs text-gray-600 font-bold uppercase">Ricchi</p>
                      <p className="text-sm font-bold text-success mt-1">
                        {building.weeklyRent.rich > 0 ? (
                          <GoldAmount amount={`+${building.weeklyRent.rich}`} className="text-success" />
                        ) : '-'}
                      </p>
                    </div>
                  </div>
```

- [ ] **Step 4: Update construction costs with resource icons in `Buildings.tsx`**

Modify building construction costs block:
```tsx
                  <div className="grid grid-cols-3 gap-2 bg-background p-2.5 rounded border border-primary/10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Oro</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src="/images/gold.png" alt="Oro" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-primary font-mono">{building.constructionCost.gold}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Mattoni</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('bricks')} alt="Mattoni" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{building.constructionCost.bricks}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-3xs text-gray-600 font-bold uppercase">Legno</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <img src={getGoodImagePath('timber')} alt="Legno" className="h-4 w-4 object-contain" />
                        <span className="text-xs font-semibold text-neutral-dark font-mono">{building.constructionCost.timber}</span>
                      </div>
                    </div>
                  </div>
```

- [ ] **Step 5: Run all tests to make sure no breaks**

Run: `npm run test -- --run`
Expected: PASS

---

### Task 6: Refactor Database Lists (`GoodsList.tsx`, `BusinessesList.tsx`)

**Files:**
* Modify: `src/pages/database/GoodsList.tsx`
* Modify: `src/pages/database/BusinessesList.tsx`

**Interfaces:**
* Consumes: `GoldAmount` component
* Produces: Prices with gold icon in goods list, and resource icons in business list construction costs and maintenance.

- [ ] **Step 1: Update GoodsList.tsx imports and price cells**

Modify `src/pages/database/GoodsList.tsx` to import `GoldAmount` and update cells:
```tsx
                  {visibleColumns.includes('basePrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount amount={good.basePrice} className="font-mono text-neutral-dark" />
                    </td>
                  )}

                  {visibleColumns.includes('buyPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount
                        amount={good.buyPriceRange[0] === good.buyPriceRange[1]
                          ? `${good.buyPriceRange[0]}`
                          : `${good.buyPriceRange[0]}-${good.buyPriceRange[1]}`}
                        className="font-mono font-semibold text-success"
                      />
                    </td>
                  )}

                  {visibleColumns.includes('sellPrice') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <GoldAmount
                        amount={`${good.sellPriceRange[0]}-${good.sellPriceRange[1]}`}
                        className="font-mono font-bold text-primary"
                      />
                    </td>
                  )}

                  {visibleColumns.includes('maxSatisfaction') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {good.maxSatisfactionPrice ? (
                        <GoldAmount amount={good.maxSatisfactionPrice} className="font-mono" />
                      ) : '-'}
                    </td>
                  )}
```

- [ ] **Step 2: Update BusinessesList.tsx imports and cells**

Modify `src/pages/database/BusinessesList.tsx` to import `GoldAmount` and update maintenance and build cost cells:
```tsx
                    {visibleColumns.includes('maintenance') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <GoldAmount amount={business.dailyMaintenance} className="font-semibold text-danger font-mono" />
                        <span className="text-[10px] font-normal text-gray-500 font-sans ml-0.5">/g</span>
                      </td>
                    )}
```
and build cost cell:
```tsx
                    {visibleColumns.includes('cost') && (
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-center">
                        <span className="inline-flex flex-col text-left space-y-1 bg-background p-1.5 rounded border border-primary/5">
                          <span className="flex items-center text-[10px]">
                            <img src="/images/gold.png" className="h-3 w-3 object-contain mr-1" />
                            {business.constructionCost.gold}
                          </span>
                          <span className="flex items-center text-[10px]">
                            <img src={getGoodImagePath('bricks')} className="h-3 w-3 object-contain mr-1" />
                            {business.constructionCost.bricks}
                          </span>
                          <span className="flex items-center text-[10px]">
                            <img src={getGoodImagePath('timber')} className="h-3 w-3 object-contain mr-1" />
                            {business.constructionCost.timber}
                          </span>
                        </span>
                      </td>
                    )}
```

- [ ] **Step 3: Run all database lists tests**

Run: `npm run test -- src/pages/database/GoodsList.test.tsx` and `npm run test -- src/pages/database/BusinessesList.test.tsx`
Expected: PASS

---

### Task 7: Implement Cross-Linking in Calculators

**Files:**
* Modify: `src/pages/calculators/Production.tsx`
* Modify: `src/pages/calculators/Routes.tsx`
* Modify: `src/pages/calculators/Convoy.tsx`

**Interfaces:**
* Consumes: Link component from react-router-dom.
* Produces: Active navigation links inside the calculators.

- [ ] **Step 1: Update `Production.tsx` to link to towns, businesses, and goods**

Modify `src/pages/calculators/Production.tsx` to import `Link` and wrap:
* Town names in city row headers with a `<Link to={\`/database/towns/\${townId}\`}>`.
* Business names with `<Link to={\`/database/businesses/\${businessId}\`}>`.
* Goods icons/names in reports with `<Link to={\`/database/goods/\${goodId}\`}>`.

- [ ] **Step 2: Update `Routes.tsx` to link to towns and goods**

Modify `src/pages/calculators/Routes.tsx` to import `Link` and wrap:
* Source/Destination towns with `<Link to={\`/database/towns/\${townId}\`}>`.
* Good names in route details with `<Link to={\`/database/goods/\${goodId}\`}>`.

- [ ] **Step 3: Update `Convoy.tsx` to link to goods**

Modify `src/pages/calculators/Convoy.tsx` to import `Link` and wrap:
* Selected goods or ship types (if applicable) with appropriate detail page links.

- [ ] **Step 4: Run all calculator smoke/integration tests and general test suite**

Run: `npm run test -- --run`
Expected: PASS
