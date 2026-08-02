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

const PlaceholderPage = ({ name }: { name: string }) => {
  return (
    <div className="p-12 bg-white rounded border border-dashed border-neutral-medium text-center text-neutral-medium">
      Foglio <strong>{name}</strong> - Prossimamente in implementazione.
    </div>
  );
};

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
        element: <PlaceholderPage name="Housing" />
      },
      {
        path: 'consumption',
        element: <PlaceholderPage name="Consumption" />
      },
      {
        path: 'office-manager',
        element: <PlaceholderPage name="Office Trade Manager" />
      },
      {
        path: 'convoy-manager',
        element: <PlaceholderPage name="Convoy Manager" />
      },
      {
        path: 'all-in-one',
        element: <PlaceholderPage name="All-in-One Dashboard" />
      },
      {
        path: 'building-materials',
        element: <PlaceholderPage name="Building Materials" />
      },
      {
        path: 'schedule',
        element: <PlaceholderPage name="Schedule" />
      },
      {
        path: 'snapshots',
        element: <PlaceholderPage name="Snapshots" />
      }
    ]
  }
]);
