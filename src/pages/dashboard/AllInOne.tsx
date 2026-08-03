import React, { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useServices } from '../../servicesContext';
import UninitializedWarning from '../../components/UninitializedWarning';
import type { Town } from '../../types';
import type { LocalizedGood } from '../../services/GoodService';
import { useTranslation } from 'react-i18next';
import { getGoodImagePath } from '../../utils/goodImage';
import { 
  Building2, 
  MapPin, 
  Users, 
  Home, 
  Navigation, 
  ShieldCheck, 
  Gauge 
} from 'lucide-react';

const AllInOne: React.FC = () => {
  const { game } = useGame();
  const { townService, goodService } = useServices();
  const { t, i18n } = useTranslation();

  const [towns, setTowns] = useState<Town[]>([]);
  const [goods, setGoods] = useState<LocalizedGood[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('');

  const lang = (i18n.language === 'it' ? 'it' : 'en') as 'it' | 'en';

  useEffect(() => {
    townService.getTowns().then(setTowns);
    goodService.getGoods(lang).then(setGoods);
  }, [townService, goodService, lang]);

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

  const selectedTownState = selectedTownId ? game.state.towns[selectedTownId] : null;
  const staticTownInfo = towns.find(tData => tData.id === selectedTownId);

  // Business detail mapping for industrial diagnostic matrix
  const businessDetails = [
    { id: 'brewery', name: lang === 'it' ? 'Birreria' : 'Brewery', outGood: 'beer', rm1: 'grain', rm2: 'timber' },
    { id: 'iron_smelter', name: lang === 'it' ? 'Fonderia Minerale' : 'Iron Smelter', outGood: 'pig_iron', rm1: 'timber', rm2: null },
    { id: 'fishery', name: lang === 'it' ? 'Pescatore (Pesce)' : 'Fishery (Fish)', outGood: 'fish', rm1: 'salt', rm2: 'hemp' },
    { id: 'whale_fishery', name: lang === 'it' ? 'Pescatore (Tran)' : 'Whale Fishery', outGood: 'whale_oil', rm1: null, rm2: null },
    { id: 'grain_farm', name: lang === 'it' ? 'Fattoria (Grano)' : 'Grain Farm', outGood: 'grain', rm1: null, rm2: null },
    { id: 'hemp_farm', name: lang === 'it' ? 'Hanfhof (Canapa)' : 'Hemp Farm', outGood: 'hemp', rm1: null, rm2: null },
    { id: 'apiary', name: lang === 'it' ? 'Apicoltore (Miele)' : 'Beekeeper (Honey)', outGood: 'honey', rm1: null, rm2: null },
    { id: 'hunting_lodge', name: lang === 'it' ? 'Guardiacaccia (Felle)' : 'Hunting Lodge', outGood: 'skins', rm1: 'iron_goods', rm2: 'wine' },
    { id: 'pitchmaker', name: lang === 'it' ? 'Fornace di Pece' : 'Pitch Maker', outGood: 'pitch', rm1: 'timber', rm2: null },
    { id: 'sawmill', name: lang === 'it' ? 'Segheria (Legno)' : 'Sawmill', outGood: 'timber', rm1: null, rm2: null },
    { id: 'sheep_farm', name: lang === 'it' ? 'Allevamento Pecore' : 'Sheep Farm', outGood: 'wool', rm1: null, rm2: null },
    { id: 'saltworks', name: lang === 'it' ? 'Salina (Sale)' : 'Saltworks', outGood: 'salt', rm1: 'timber', rm2: null },
    { id: 'pottery_workshop', name: lang === 'it' ? 'Töpferei (Ceramica)' : 'Pottery Workshop', outGood: 'pottery', rm1: 'timber', rm2: null },
    { id: 'cattle_farm', name: lang === 'it' ? 'Allevamento Mucche' : 'Cattle Farm', outGood: 'meat', rm1: 'timber', rm2: 'grain' },
    { id: 'weaving_mill', name: lang === 'it' ? 'Tessitura (Tessuto)' : 'Weaving Mill', outGood: 'cloth', rm1: 'wool', rm2: null },
    { id: 'vineyard', name: lang === 'it' ? 'Vigneto (Vino)' : 'Vineyard', outGood: 'wine', rm1: null, rm2: null },
    { id: 'workshop', name: lang === 'it' ? 'Officina (Utensili)' : 'Workshop', outGood: 'iron_goods', rm1: 'pig_iron', rm2: 'timber' },
    { id: 'brickworks', name: lang === 'it' ? 'Ziegelei (Mattoni)' : 'Brickworks', outGood: 'bricks', rm1: 'timber', rm2: null }
  ];

  // Logistics & Reserve items to check
  const rawMaterials = [
    { id: 'pig_iron', name: lang === 'it' ? 'Ferro Grezzo' : 'Iron Ore' },
    { id: 'iron_goods', name: lang === 'it' ? 'Utensili' : 'Iron Goods' },
    { id: 'grain', name: lang === 'it' ? 'Grano' : 'Grain' },
    { id: 'hemp', name: lang === 'it' ? 'Canapa' : 'Hemp' },
    { id: 'timber', name: lang === 'it' ? 'Legno' : 'Wood' },
    { id: 'salt', name: lang === 'it' ? 'Sale' : 'Salt' },
    { id: 'wool', name: lang === 'it' ? 'Lana' : 'Wool' }
  ];

  // Calculations for current town
  const populationSummary = selectedTownState ? {
    rich: selectedTownState.population.rich,
    wealthy: selectedTownState.population.wealthy,
    poor: selectedTownState.population.poor,
    total: selectedTownState.population.rich + selectedTownState.population.wealthy + selectedTownState.population.poor
  } : null;

  const housingSummary = selectedTownId ? game.getTownHousingSummary(selectedTownId) : null;
  const convoySummary = selectedTownId ? game.getTownConvoyCapacitySummary(selectedTownId, 0.35, 0.10) : null;
  const isHubOrNoRoute = !selectedTownState || 
    !selectedTownState.logistics.centralHubId || 
    selectedTownState.logistics.centralHubId === 'none' || 
    selectedTownState.logistics.centralHubId === selectedTownId;
  // Natural language status summary
  const getCityStatusSummary = () => {
    if (!selectedTownState || !staticTownInfo) return '';
    const name = staticTownInfo.name;
    const typeStr = staticTownInfo.isRiverTown 
      ? (lang === 'it' ? 'città fluviale' : 'river town')
      : (lang === 'it' ? 'città marittima' : 'seaport town');
      
    const hubId = selectedTownState.logistics.centralHubId;
    if (!hubId || hubId === 'none' || hubId === selectedTownId) {
      return lang === 'it'
        ? `${name} è una ${typeStr} ed è configurata come Magazzino Centrale (ZL).`
        : `${name} is a ${typeStr} and is configured as a Central Warehouse (ZL).`;
    } else {
      const hubName = towns.find(tData => tData.id === hubId)?.name || hubId;
      return lang === 'it'
        ? `${name} è una ${typeStr} e viene rifornita da ${hubName} (ZL) tramite convogli.`
        : `${name} is a ${typeStr} and is supplied from ${hubName} (ZL) via convoys.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            {lang === 'it' ? 'Cruscotto Unificato Città' : 'Unified Town Dashboard'}
          </h1>
          <p className="text-sm text-neutral-medium mt-1">
            {lang === 'it' 
              ? 'Diagnostica integrata dell\'economia, demografia e rotte logistiche di una singola città.'
              : 'Integrated diagnostic overview of the economy, demographics, and shipping routes of a single town.'}
          </p>
        </div>

        {/* Town Selector */}
        <div className="flex items-center space-x-2 shrink-0">
          <MapPin className="h-5 w-5 text-primary shrink-0" />
          <span className="font-bold text-neutral-dark text-sm">{lang === 'it' ? 'Città Cockpit:' : 'Cockpit Town:'}</span>
          <select
            value={selectedTownId}
            onChange={(e) => setSelectedTownId(e.target.value)}
            className="p-2 border border-neutral-medium rounded text-sm bg-white font-bold text-neutral-dark w-48 shadow-sm"
          >
            {activeTowns.map(town => (
              <option key={town.id} value={town.id}>{town.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTowns.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-neutral-light shadow-sm text-center text-neutral-medium text-sm">
          {t('dashboard.no_towns_added')}
        </div>
      ) : (
        selectedTownState && (
          <div className="space-y-6">
            {/* Natural language summary alert */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-center space-x-3 text-sm font-bold text-primary shadow-xs">
              <Gauge className="h-5 w-5 text-primary shrink-0" />
              <span>{getCityStatusSummary()}</span>
            </div>

            {/* Grid for demography + housing & logistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demography & Housing */}
              <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                  <Users className="h-4.5 w-4.5 text-primary" />
                  <span>{lang === 'it' ? 'Struttura Sociale e Abitazioni' : 'Social Structure & Housing'}</span>
                </div>

                {/* Pop breakdown */}
                {populationSummary && (
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-neutral-light/10 p-2.5 rounded border border-neutral-light">
                      <span className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Poveri' : 'Poor'}</span>
                      <span className="block text-base font-black text-neutral-dark mt-0.5">{populationSummary.poor}</span>
                      <span className="text-[9px] font-semibold text-neutral-medium">({((populationSummary.poor / populationSummary.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="bg-neutral-light/10 p-2.5 rounded border border-neutral-light">
                      <span className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Benestanti' : 'Wealthy'}</span>
                      <span className="block text-base font-black text-neutral-dark mt-0.5">{populationSummary.wealthy}</span>
                      <span className="text-[9px] font-semibold text-neutral-medium">({((populationSummary.wealthy / populationSummary.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="bg-neutral-light/10 p-2.5 rounded border border-neutral-light">
                      <span className="text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Ricchi' : 'Rich'}</span>
                      <span className="block text-base font-black text-neutral-dark mt-0.5">{populationSummary.rich}</span>
                      <span className="text-[9px] font-semibold text-neutral-medium">({((populationSummary.rich / populationSummary.total) * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                )}

                {/* Housing limits table */}
                {housingSummary && (
                  <div className="overflow-x-auto pt-2">
                    <table className="min-w-full text-left text-xs border-collapse">
                      <thead className="bg-neutral-light text-neutral-dark font-bold border-b border-neutral-light uppercase tracking-wider text-[9px]">
                        <tr>
                          <th className="p-2">{lang === 'it' ? 'Classe Immobile' : 'House Category'}</th>
                          <th className="p-2 text-right">{lang === 'it' ? 'Richieste (Soll)' : 'Target'}</th>
                          <th className="p-2 text-right">{lang === 'it' ? 'Attuali (Ist)' : 'Actual'}</th>
                          <th className="p-2 text-right">{lang === 'it' ? 'Bilancio' : 'Balance'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-light/50 font-medium">
                          <td className="p-2 flex items-center space-x-1.5">
                            <Home className="h-3.5 w-3.5 text-neutral-medium" />
                            <span>{lang === 'it' ? 'Graticcio / Popolari' : 'Timber-framed (FWH)'}</span>
                          </td>
                          <td className="p-2 text-right text-neutral-medium">{housingSummary.fachwerk.target}</td>
                          <td className="p-2 text-right font-semibold">{housingSummary.fachwerk.actual}</td>
                          <td className={`p-2 text-right font-bold ${housingSummary.fachwerk.balance < 0 ? 'text-red-700 font-extrabold' : 'text-green-700'}`}>
                            {housingSummary.fachwerk.balance}
                          </td>
                        </tr>
                        <tr className="border-b border-neutral-light/50 font-medium">
                          <td className="p-2 flex items-center space-x-1.5">
                            <Home className="h-3.5 w-3.5 text-neutral-medium" />
                            <span>{lang === 'it' ? 'Timpano / Medie' : 'Gable House (GH)'}</span>
                          </td>
                          <td className="p-2 text-right text-neutral-medium">{housingSummary.giebel.target}</td>
                          <td className="p-2 text-right font-semibold">{housingSummary.giebel.actual}</td>
                          <td className={`p-2 text-right font-bold ${housingSummary.giebel.balance < 0 ? 'text-red-700 font-extrabold' : 'text-green-700'}`}>
                            {housingSummary.giebel.balance}
                          </td>
                        </tr>
                        <tr className="font-medium">
                          <td className="p-2 flex items-center space-x-1.5">
                            <Home className="h-3.5 w-3.5 text-neutral-medium" />
                            <span>{lang === 'it' ? 'Kaufmann / Signorili' : 'Merchant House (KMH)'}</span>
                          </td>
                          <td className="p-2 text-right text-neutral-medium">{housingSummary.kaufmann.target}</td>
                          <td className="p-2 text-right font-semibold">{housingSummary.kaufmann.actual}</td>
                          <td className={`p-2 text-right font-bold ${housingSummary.kaufmann.balance < 0 ? 'text-red-700 font-extrabold' : 'text-green-700'}`}>
                            {housingSummary.kaufmann.balance}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Logistics & Reserves cockpit */}
              <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-neutral-light font-bold text-neutral-dark text-sm">
                  <Navigation className="h-4.5 w-4.5 text-primary" />
                  <span>{lang === 'it' ? 'Logistica e Ufficio di Scorta' : 'Logistics & Reserves'}</span>
                </div>

                {isHubOrNoRoute ? (
                  <div className="p-6 text-center text-neutral-medium text-xs italic bg-neutral-light/10 border rounded">
                    {lang === 'it' 
                      ? 'Nessun convoglio necessario (Città Hub o rotta disattivata).'
                      : 'No supply convoy active (Hub City or convoy route disabled).'}
                  </div>
                ) : (
                  convoySummary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Convoy brief */}
                      <div className="space-y-2 border border-neutral-light p-3 rounded bg-neutral-light/5">
                        <span className="block text-[10px] text-neutral-medium font-bold uppercase">{lang === 'it' ? 'Rotte Convoglio' : 'Convoy Rotation'}</span>
                        <div className="flex justify-between text-xs font-semibold text-neutral-dark">
                          <span>{lang === 'it' ? 'Giro Completo:' : 'Round Trip:'}</span>
                          <span className="font-extrabold text-primary">{convoySummary.roundTripDays.toFixed(2)} {lang === 'it' ? 'giorni' : 'days'}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-neutral-dark">
                          <span>{lang === 'it' ? 'Importazioni ZL:' : 'Imports Vol:'}</span>
                          <span className="font-bold">{convoySummary.importsFass} Faß</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-neutral-dark">
                          <span>{lang === 'it' ? 'Esportazioni ZL:' : 'Exports Vol:'}</span>
                          <span className="font-bold">{convoySummary.exportsFass} Faß</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold border-t pt-1.5 mt-1 text-primary">
                          <span>{lang === 'it' ? 'Stazza Minima:' : 'Min Convoy:'}</span>
                          <span className="font-black">{convoySummary.minConvoySize} Faß</span>
                        </div>
                      </div>

                      {/* Sperrlager summary */}
                      <div className="space-y-2 border border-neutral-light p-3 rounded bg-neutral-light/5 flex flex-col justify-between">
                        <div>
                          <span className="block text-[10px] text-neutral-medium font-bold uppercase flex items-center space-x-1">
                            <ShieldCheck className="h-3 w-3 text-green-700" />
                            <span>{lang === 'it' ? 'Scorte Minime (Sperrlager)' : 'Sperrlager Reserves'}</span>
                          </span>
                          <div className="space-y-1 mt-1.5">
                            {rawMaterials.map(rm => {
                              const reserve = game.getTownOfficeReserve(selectedTownId, rm.id, 0.10); // 10% safety margin
                              if (reserve <= 0) return null;
                              return (
                                <div key={rm.id} className="flex justify-between text-[11px] font-semibold text-neutral-dark">
                                  <span>{rm.name}:</span>
                                  <span className="font-extrabold text-green-800 bg-green-50 px-1.5 py-0.2 rounded border border-green-200/50">{reserve}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Industrial diagnostic matrix */}
            <div className="bg-white rounded-lg border border-neutral-light shadow-sm overflow-hidden">
              <div className="p-4 bg-neutral-light/20 border-b border-neutral-light font-bold text-neutral-dark text-sm flex items-center space-x-2">
                <Building2 className="h-4.5 w-4.5 text-primary" />
                <span>{lang === 'it' ? 'Matrice di Diagnostica Industriale' : 'Industrial Diagnostic Matrix'}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead className="bg-neutral-light/50 text-neutral-dark font-semibold border-b border-neutral-light uppercase tracking-wider text-[9px]">
                    <tr>
                      <th className="p-3">{lang === 'it' ? 'Laboratorio / Stabilimento' : 'Business'}</th>
                      <th className="p-3 text-center">{lang === 'it' ? 'Efficienza' : 'Efficiency'}</th>
                      <th className="p-3 text-center">{lang === 'it' ? 'Attivi' : 'Active'}</th>
                      <th className="p-3 text-right">{lang === 'it' ? 'Produzione (Estate / Inverno)' : 'Output (Summer / Winter)'}</th>
                      <th className="p-3 text-right">{lang === 'it' ? 'Materie Prime Consumate (Settimana)' : 'Raw Materials Consumption (Weekly)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessDetails.map(biz => {
                      const bState = selectedTownState.businesses[biz.id];
                      const hasBuilt = bState && bState.count > 0;
                      
                      const prodSummer = game.getTownGoodProduction(selectedTownId, biz.outGood, 'summer');
                      const prodWinter = game.getTownGoodProduction(selectedTownId, biz.outGood, 'winter');
                      
                      // Pull input consumption sizes
                      let mat1Cons = 0;
                      let mat2Cons = 0;
                      
                      if (hasBuilt) {
                        const cons1 = biz.rm1 ? game.getTownGoodConsumption(selectedTownId, biz.rm1).industrial : 0;
                        const cons2 = biz.rm2 ? game.getTownGoodConsumption(selectedTownId, biz.rm2).industrial : 0;
                        // Note: game.getTownGoodConsumption returns total industrial consumption for that town and good.
                        // To get exactly what THIS business consumes, we could scale, but showing the overall town's industrial demand for this raw material is extremely helpful!
                        mat1Cons = cons1;
                        mat2Cons = cons2;
                      }

                      return (
                        <tr key={biz.id} className={`border-b border-neutral-light hover:bg-neutral-light/5 ${hasBuilt ? 'font-semibold text-neutral-dark bg-primary/2.5' : 'text-neutral-medium/60'}`}>
                          <td className="p-3 flex items-center space-x-2 font-bold">
                            <img
                              src={getGoodImagePath(biz.outGood)}
                              alt={biz.name}
                              className="w-5 h-5 object-contain shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <span>{biz.name}</span>
                          </td>
                          <td className="p-3 text-center">
                            {hasBuilt ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                bState.efficiency === 2
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                              }`}>
                                {bState.efficiency === 2 
                                  ? (lang === 'it' ? 'Efficace' : 'Effective')
                                  : (lang === 'it' ? 'Poco Efficace' : 'Ineffective')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-medium font-semibold italic">{lang === 'it' ? 'Non attivo' : 'Not active'}</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-sm">
                            {hasBuilt ? bState.count : '-'}
                          </td>
                          <td className="p-3 text-right">
                            {hasBuilt ? (
                              <span>
                                {prodSummer.toFixed(2)} / {prodWinter.toFixed(2)} <span className="text-[10px] text-neutral-medium font-semibold">Faß</span>
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="p-3 text-right text-xs">
                            {hasBuilt && (biz.rm1 || biz.rm2) ? (
                              <div className="space-y-1 inline-block text-left">
                                {biz.rm1 && mat1Cons > 0 && (
                                  <div className="flex items-center space-x-2 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    <span>{goods.find(g => g.id === biz.rm1)?.name || biz.rm1}:</span>
                                    <span className="text-red-700 font-bold">-{mat1Cons.toFixed(2)}</span>
                                  </div>
                                )}
                                {biz.rm2 && mat2Cons > 0 && (
                                  <div className="flex items-center space-x-2 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    <span>{goods.find(g => g.id === biz.rm2)?.name || biz.rm2}:</span>
                                    <span className="text-red-700 font-bold">-{mat2Cons.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AllInOne;
