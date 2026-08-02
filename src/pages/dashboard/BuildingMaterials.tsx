import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import { useTranslation } from 'react-i18next';
import { Hammer, Users, Home, Info, Plus, Minus, RefreshCw } from 'lucide-react';

const BuildingMaterials: React.FC = () => {
  const { game } = useGame();
  const { townService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');
  
  // Custom occupancy rate
  const [targetOccupancy, setTargetOccupancy] = useState<number>(90); // default 90%
  
  // Planned quantities state
  const [planned, setPlanned] = useState<Record<string, number>>({});

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  useEffect(() => {
    townService.getTowns().then(setTowns);
  }, [townService]);

  if (!game) {
    return <UninitializedWarning />;
  }

  const activeTowns = towns.filter(town => {
    const townState = game.state.towns[town.id];
    return townState && townState.isActive;
  });

  // Auto-select first active town
  if (activeTowns.length > 0 && !selectedTownId) {
    setSelectedTownId(activeTowns[0].id);
  }

  // Cost reference database from ODS Sheet 11
  const buildingCosts: Record<string, { bricks: number; timber: number; tools: number; hemp: number; gold: number }> = {
    brewery: { bricks: 40, timber: 5, tools: 5, hemp: 0, gold: 5000 },
    iron_smelter: { bricks: 0, timber: 10, tools: 10, hemp: 0, gold: 10000 },
    fishery: { bricks: 40, timber: 5, tools: 5, hemp: 10, gold: 3000 },
    whale_fishery: { bricks: 40, timber: 5, tools: 5, hemp: 20, gold: 5000 },
    grain_farm: { bricks: 25, timber: 2, tools: 2, hemp: 0, gold: 3000 },
    hemp_farm: { bricks: 25, timber: 2, tools: 2, hemp: 0, gold: 3000 },
    apiary: { bricks: 40, timber: 10, tools: 5, hemp: 0, gold: 3000 },
    hunting_lodge: { bricks: 40, timber: 10, tools: 10, hemp: 10, gold: 8000 },
    pitchmaker: { bricks: 10, timber: 1, tools: 1, hemp: 0, gold: 1000 },
    sawmill: { bricks: 25, timber: 2, tools: 2, hemp: 0, gold: 3000 },
    sheep_farm: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 8000 },
    saltworks: { bricks: 25, timber: 2, tools: 2, hemp: 0, gold: 3000 },
    pottery_workshop: { bricks: 40, timber: 10, tools: 10, hemp: 0, gold: 5000 },
    cattle_farm: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 5000 },
    weaving_mill: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 8000 },
    vineyard: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 8000 },
    workshop: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 8000 },
    brickworks: { bricks: 10, timber: 1, tools: 1, hemp: 0, gold: 1000 },
    
    // Houses
    wooden_house: { bricks: 25, timber: 2, tools: 2, hemp: 0, gold: 5000 },
    brick_house: { bricks: 40, timber: 10, tools: 10, hemp: 0, gold: 8000 },
    mansion: { bricks: 50, timber: 20, tools: 20, hemp: 0, gold: 8000 }
  };

  const updateQuantity = (id: string, delta: number) => {
    setPlanned(prev => {
      const val = Math.max(0, (prev[id] || 0) + delta);
      return {
        ...prev,
        [id]: val
      };
    });
  };

  const handleReset = () => {
    setPlanned({});
  };

  const selectedTownState = selectedTownId ? game.state.towns[selectedTownId] : null;

  // 1. Calculate Required Materials
  let totalBricks = 0;
  let totalTimber = 0;
  let totalTools = 0;
  let totalHemp = 0;
  let totalGold = 0;

  Object.entries(planned).forEach(([bId, qty]) => {
    if (qty > 0 && buildingCosts[bId]) {
      const cost = buildingCosts[bId];
      totalBricks += cost.bricks * qty;
      totalTimber += cost.timber * qty;
      totalTools += cost.tools * qty;
      totalHemp += cost.hemp * qty;
      totalGold += cost.gold * qty;
    }
  });

  // 2. Calculate Demographic Impact
  let poorIncrease = 0;
  Object.entries(planned).forEach(([bId, qty]) => {
    if (qty > 0 && bId !== 'wooden_house' && bId !== 'brick_house' && bId !== 'mansion') {
      const workers = (bId === 'pitchmaker' || bId === 'brickworks') ? 15 : 30;
      poorIncrease += qty * workers * 4; // 4 family size multiplier
    }
  });

  let wealthyIncrease = 0;
  let richIncrease = 0;

  if (selectedTownState && poorIncrease > 0) {
    const totalPop = selectedTownState.population.rich + selectedTownState.population.wealthy + selectedTownState.population.poor;
    if (totalPop > 0 && selectedTownState.population.poor > 0) {
      wealthyIncrease = Math.ceil((selectedTownState.population.wealthy / selectedTownState.population.poor) * poorIncrease);
      richIncrease = Math.ceil((selectedTownState.population.rich / selectedTownState.population.poor) * poorIncrease);
    }
  }

  const totalPopIncrease = poorIncrease + wealthyIncrease + richIncrease;

  // 3. Housing limits projection
  let fwhNeeded = 0;
  let ghNeeded = 0;
  let kmhNeeded = 0;

  if (selectedTownState) {
    const targetMultiplier = 1 / (targetOccupancy / 100);

    const futurePoor = selectedTownState.population.poor + poorIncrease;
    const futureWealthy = selectedTownState.population.wealthy + wealthyIncrease;
    const futureRich = selectedTownState.population.rich + richIncrease;

    // Planned houses built
    const plannedFwh = planned['wooden_house'] || 0;
    const plannedGh = planned['brick_house'] || 0;
    const plannedKmh = planned['mansion'] || 0;

    const currentFwh = selectedTownState.houses.fachwerk + plannedFwh;
    const currentGh = selectedTownState.houses.giebel + plannedGh;
    const currentKmh = selectedTownState.houses.kaufmann + plannedKmh;

    const targetFwh = Math.ceil(futurePoor * targetMultiplier / 280);
    const targetGh = Math.ceil(futureWealthy * targetMultiplier / 140);
    const targetKmh = Math.ceil(futureRich * targetMultiplier / 80);

    fwhNeeded = Math.max(0, targetFwh - currentFwh);
    ghNeeded = Math.max(0, targetGh - currentGh);
    kmhNeeded = Math.max(0, targetKmh - currentKmh);
  }

  // Lists of building definitions
  const businessDefs = [
    { id: 'brewery', name: lang === 'it' ? 'Birreria' : 'Brewery' },
    { id: 'iron_smelter', name: lang === 'it' ? 'Fonderia Minerale' : 'Iron Smelter' },
    { id: 'fishery', name: lang === 'it' ? 'Pescatore (Pesce)' : 'Fishery (Fish)' },
    { id: 'whale_fishery', name: lang === 'it' ? 'Pescatore (Tran)' : 'Whale Fishery' },
    { id: 'grain_farm', name: lang === 'it' ? 'Fattoria (Grano)' : 'Grain Farm' },
    { id: 'hemp_farm', name: lang === 'it' ? 'Hanfhof (Canapa)' : 'Hemp Farm' },
    { id: 'apiary', name: lang === 'it' ? 'Apicoltore (Miele)' : 'Beekeeper (Honey)' },
    { id: 'hunting_lodge', name: lang === 'it' ? 'Guardiacaccia (Felle)' : 'Hunting Lodge' },
    { id: 'pitchmaker', name: lang === 'it' ? 'Fornace di Pece' : 'Pitch Maker' },
    { id: 'sawmill', name: lang === 'it' ? 'Segheria (Legno)' : 'Sawmill' },
    { id: 'sheep_farm', name: lang === 'it' ? 'Allevamento Pecore' : 'Sheep Farm' },
    { id: 'saltworks', name: lang === 'it' ? 'Salina (Sale)' : 'Saltworks' },
    { id: 'pottery_workshop', name: lang === 'it' ? 'Töpferei (Ceramica)' : 'Pottery Workshop' },
    { id: 'cattle_farm', name: lang === 'it' ? 'Allevamento Mucche' : 'Cattle Farm' },
    { id: 'weaving_mill', name: lang === 'it' ? 'Tessitura (Tessuto)' : 'Weaving Mill' },
    { id: 'vineyard', name: lang === 'it' ? 'Vigneto (Vino)' : 'Vineyard' },
    { id: 'workshop', name: lang === 'it' ? 'Officina (Utensili)' : 'Workshop' },
    { id: 'brickworks', name: lang === 'it' ? 'Ziegelei (Mattoni)' : 'Brickworks' }
  ];

  const houseDefs = [
    { id: 'wooden_house', name: lang === 'it' ? 'Casa in Legno (FWH)' : 'Timber-framed House (FWH)' },
    { id: 'brick_house', name: lang === 'it' ? 'Casa in Pietra (GH)' : 'Gable House (GH)' },
    { id: 'mansion', name: lang === 'it' ? 'Casa Padronale (KMH)' : 'Merchant House (KMH)' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            {lang === 'it' ? 'Pianificatore Materiali Edili' : 'Building Materials Planner'}
          </h1>
          <p className="text-sm text-neutral-medium mt-1">
            {lang === 'it' 
              ? 'Calcola le materie prime e i costi per i tuoi progetti di espansione e stima l\'afflusso demografico indotto.'
              : 'Calculate material counts and gold costs for your city expansion projects and project induced population growth.'}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold bg-neutral-light hover:bg-neutral-medium/30 border border-neutral-medium text-neutral-dark transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{lang === 'it' ? 'Resetta' : 'Reset'}</span>
        </button>
      </div>

      {activeTowns.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
          {t('dashboard.no_towns_added')}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* COLUMN 1: BUILDING INPUT PLANNER */}
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-light">
              <div className="flex items-center space-x-2 font-bold text-neutral-dark text-sm">
                <Hammer className="h-5 w-5 text-primary" />
                <span>{lang === 'it' ? 'Pianifica Espansione' : 'Expansion Planner'}</span>
              </div>

              {/* Town Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-medium font-semibold">{lang === 'it' ? 'Città:' : 'Town:'}</span>
                <select
                  value={selectedTownId}
                  onChange={(e) => setSelectedTownId(e.target.value)}
                  className="p-1 border border-neutral-medium rounded text-xs bg-white font-bold text-neutral-dark"
                >
                  {activeTowns.map(town => (
                    <option key={town.id} value={town.id}>{town.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Businesses Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-neutral-medium tracking-wider">
                {lang === 'it' ? 'Imprese e Manifatture (30 o 15 Lavoratori)' : 'Businesses & Industries (30 or 15 Workers)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessDefs.map(biz => {
                  const qty = planned[biz.id] || 0;
                  const is15 = biz.id === 'pitchmaker' || biz.id === 'brickworks';
                  return (
                    <div key={biz.id} className="flex items-center justify-between p-2 rounded bg-neutral-light/10 border border-neutral-light/50 hover:bg-neutral-light/20">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-neutral-dark">{biz.name}</span>
                        <span className="block text-[10px] text-neutral-medium font-semibold">
                          {is15 ? '15 workers' : '30 workers'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(biz.id, -1)}
                          className="p-1 rounded bg-neutral-light border border-neutral-medium/50 hover:bg-neutral-medium/30 transition-colors cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5 text-neutral-dark" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-primary">{qty}</span>
                        <button
                          onClick={() => updateQuantity(biz.id, 1)}
                          className="p-1 rounded bg-neutral-light border border-neutral-medium/50 hover:bg-neutral-medium/30 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 text-neutral-dark" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Houses Section */}
            <div className="space-y-3 pt-3 border-t border-neutral-light">
              <h3 className="text-xs font-black uppercase text-neutral-medium tracking-wider">
                {lang === 'it' ? 'Case per Abitanti' : 'Civilian Houses'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {houseDefs.map(h => {
                  const qty = planned[h.id] || 0;
                  return (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded bg-neutral-light/10 border border-neutral-light/50 hover:bg-neutral-light/20">
                      <span className="text-xs font-bold text-neutral-dark">{h.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(h.id, -1)}
                          className="p-1 rounded bg-neutral-light border border-neutral-medium/50 hover:bg-neutral-medium/30 transition-colors cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5 text-neutral-dark" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-primary">{qty}</span>
                        <button
                          onClick={() => updateQuantity(h.id, 1)}
                          className="p-1 rounded bg-neutral-light border border-neutral-medium/50 hover:bg-neutral-medium/30 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 text-neutral-dark" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: ESTIMATES PANEL */}
          <div className="space-y-6">
            {/* Materials Required Card */}
            <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                <Hammer className="h-4.5 w-4.5 text-primary" />
                <span>{lang === 'it' ? 'Materiali di Costruzione Richiesti' : 'Materials Needed'}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-neutral-light/20 p-3 rounded border border-neutral-light text-center">
                  <div className="text-[10px] text-neutral-medium uppercase font-bold">{lang === 'it' ? 'Mattoni' : 'Bricks'}</div>
                  <div className="text-lg font-black text-neutral-dark mt-1">{totalBricks}</div>
                </div>

                <div className="bg-neutral-light/20 p-3 rounded border border-neutral-light text-center">
                  <div className="text-[10px] text-neutral-medium uppercase font-bold">{lang === 'it' ? 'Legno' : 'Timber'}</div>
                  <div className="text-lg font-black text-neutral-dark mt-1">{totalTimber}</div>
                </div>

                <div className="bg-neutral-light/20 p-3 rounded border border-neutral-light text-center">
                  <div className="text-[10px] text-neutral-medium uppercase font-bold">{lang === 'it' ? 'Utensili' : 'Tools'}</div>
                  <div className="text-lg font-black text-neutral-dark mt-1">{totalTools}</div>
                </div>

                <div className="bg-neutral-light/20 p-3 rounded border border-neutral-light text-center">
                  <div className="text-[10px] text-neutral-medium uppercase font-bold">{lang === 'it' ? 'Canapa' : 'Hemp'}</div>
                  <div className="text-lg font-black text-neutral-dark mt-1">{totalHemp}</div>
                </div>

                <div className="bg-primary/5 p-3 rounded border border-primary/10 text-center col-span-2 md:col-span-1">
                  <div className="text-[10px] text-primary uppercase font-bold">{lang === 'it' ? 'Oro' : 'Gold'}</div>
                  <div className="text-lg font-black text-primary mt-1">{totalGold.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Demographics Projection Card */}
            <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                <Users className="h-4.5 w-4.5 text-primary" />
                <span>{lang === 'it' ? 'Crescita Demografica Prevista' : 'Demographic Projection'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-neutral-light/10 border p-3 rounded text-center">
                  <div className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Poveri' : 'Poor'}</div>
                  <div className="text-xl font-bold text-neutral-dark mt-1">+{poorIncrease}</div>
                </div>
                <div className="bg-neutral-light/10 border p-3 rounded text-center">
                  <div className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Benestanti' : 'Wealthy'}</div>
                  <div className="text-xl font-bold text-neutral-dark mt-1">+{wealthyIncrease}</div>
                </div>
                <div className="bg-neutral-light/10 border p-3 rounded text-center">
                  <div className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Ricchi' : 'Rich'}</div>
                  <div className="text-xl font-bold text-neutral-dark mt-1">+{richIncrease}</div>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded text-center">
                  <div className="text-[10px] text-primary font-bold uppercase">{lang === 'it' ? 'Totale' : 'Total'}</div>
                  <div className="text-xl font-black text-primary mt-1">+{totalPopIncrease}</div>
                </div>
              </div>
            </div>

            {/* Housing Requirements Card */}
            <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-light">
                <div className="flex items-center space-x-2 font-bold text-neutral-dark text-sm">
                  <Home className="h-4.5 w-4.5 text-primary" />
                  <span>{lang === 'it' ? 'Fabbisogno Abitativo Aggiuntivo' : 'Additional Houses Needed'}</span>
                </div>

                {/* Target Occupancy rate setting */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-neutral-medium font-semibold">{lang === 'it' ? 'Saturazione:' : 'Occupancy:'}</span>
                  <select
                    value={targetOccupancy}
                    onChange={(e) => setTargetOccupancy(parseInt(e.target.value))}
                    className="p-0.5 border border-neutral-medium rounded text-xs bg-white font-bold text-neutral-dark w-16"
                  >
                    {[70, 80, 85, 90, 95, 100].map(pct => (
                      <option key={pct} value={pct}>{pct}%</option>
                    ))}
                  </select>
                </div>
              </div>

              {fwhNeeded === 0 && ghNeeded === 0 && kmhNeeded === 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded text-center font-semibold">
                  {lang === 'it' 
                    ? 'Le case attuali (più quelle eventualmente pianificate) sono sufficienti per coprire l\'afflusso demografico!'
                    : 'Current housing supply (plus any planned ones) is sufficient for this growth target!'}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50/50 border border-amber-200/50 text-xs font-bold text-amber-800">
                    <span>{lang === 'it' ? 'Case Popolari (FWH - Graticcio) Necessarie:' : 'Timber-framed Houses (FWH) Needed:'}</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-sm font-black">{fwhNeeded}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50/50 border border-amber-200/50 text-xs font-bold text-amber-800">
                    <span>{lang === 'it' ? 'Case Medie (GH - Timpano) Necessarie:' : 'Gable Houses (GH) Needed:'}</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-sm font-black">{ghNeeded}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50/50 border border-amber-200/50 text-xs font-bold text-amber-800">
                    <span>{lang === 'it' ? 'Case Signorili (KMH - Kaufmann) Necessarie:' : 'Merchant Houses (KMH) Needed:'}</span>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-sm font-black">{kmhNeeded}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Guidelines */}
            <div className="p-4 bg-neutral-light/20 text-xs text-neutral-medium flex items-start space-x-2 border border-neutral-light rounded-lg">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>
                  {lang === 'it' 
                    ? 'Inserisci il piano edilizio per calcolare all\'istante di quali scorte commerciali avrai bisogno nel tuo ufficio o convoglio per completare la costruzione.'
                    : 'Enter your construction targets to immediately estimate the building supplies you need to route to the town.'}
                </p>
                <p className="font-semibold text-neutral-dark">
                  {lang === 'it' 
                    ? '* Nota: I calcoli demografici stimano una popolazione stanziale di 4 componenti per lavoratore indotto (sia per laboratori standard che ridotti).'
                    : '* Note: Demographic formulas estimate a family size of 4 people per hired worker (applicable to both standard and 15-worker workshops).'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingMaterials;
