import { createBrowserRouter, Navigate } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';

// Database routes
import GoodsList from './pages/database/GoodsList';
import GoodDetail from './pages/database/GoodDetail';
import TownsList from './pages/database/TownsList';
import TownDetail from './pages/database/TownDetail';
import BusinessesList from './pages/database/BusinessesList';
import BusinessDetail from './pages/database/BusinessDetail';
import Buildings from './pages/database/Buildings';

// Dashboard pages
import InputSheet from './pages/dashboard/InputSheet';
import Population from './pages/dashboard/Population';
import Businesses from './pages/dashboard/Businesses';
import Housing from './pages/dashboard/Housing';
import Consumption from './pages/dashboard/Consumption';
import OfficeManager from './pages/dashboard/OfficeManager';
import ConvoyManager from './pages/dashboard/ConvoyManager';
import BuildingMaterials from './pages/dashboard/BuildingMaterials';
import AllInOne from './pages/dashboard/AllInOne';
import SchedulePlanner from './pages/dashboard/SchedulePlanner';
import Snapshots from './pages/dashboard/Snapshots';
import TravelTimes from './pages/dashboard/TravelTimes';



export const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'database/goods',
        element: <GoodsList />
      },
      {
        path: 'database/goods/:id',
        element: <GoodDetail />
      },
      {
        path: 'database/towns',
        element: <TownsList />
      },
      {
        path: 'database/towns/:id',
        element: <TownDetail />
      },
      {
        path: 'database/businesses',
        element: <BusinessesList />
      },
      {
        path: 'database/businesses/:id',
        element: <BusinessDetail />
      },
      {
        path: 'database/buildings',
        element: <Buildings />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="input" replace />
      },
      {
        path: 'input',
        element: <InputSheet />
      },
      {
        path: 'population',
        element: <Population />
      },
      {
        path: 'businesses',
        element: <Businesses />
      },
      {
        path: 'housing',
        element: <Housing />
      },
      {
        path: 'consumption',
        element: <Consumption />
      },
      {
        path: 'office-manager',
        element: <OfficeManager />
      },
      {
        path: 'convoy-manager',
        element: <ConvoyManager />
      },
      {
        path: 'travel-times',
        element: <TravelTimes />
      },
      {
        path: 'all-in-one',
        element: <AllInOne />
      },
      {
        path: 'building-materials',
        element: <BuildingMaterials />
      },
      {
        path: 'schedule',
        element: <SchedulePlanner />
      },
      {
        path: 'snapshots',
        element: <Snapshots />
      }
    ]
  }
]);
