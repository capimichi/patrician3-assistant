import React, { createContext, useContext, useMemo } from 'react';
import GoodClient from './clients/GoodClient';
import TownClient from './clients/TownClient';
import BusinessClient from './clients/BusinessClient';
import ShipClient from './clients/ShipClient';
import BuildingClient from './clients/BuildingClient';

import GoodService from './services/GoodService';
import TownService from './services/TownService';
import BusinessService from './services/BusinessService';
import ShipService from './services/ShipService';
import BuildingService from './services/BuildingService';

interface ServicesContextProps {
  goodService: GoodService;
  townService: TownService;
  businessService: BusinessService;
  shipService: ShipService;
  buildingService: BuildingService;
}

const ServicesContext = createContext<ServicesContextProps | null>(null);

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const services = useMemo(() => {
    const goodClient = new GoodClient();
    const townClient = new TownClient();
    const businessClient = new BusinessClient();
    const shipClient = new ShipClient();
    const buildingClient = new BuildingClient();

    return {
      goodService: new GoodService(goodClient),
      townService: new TownService(townClient),
      businessService: new BusinessService(businessClient),
      shipService: new ShipService(shipClient),
      buildingService: new BuildingService(buildingClient),
    };
  }, []);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};
