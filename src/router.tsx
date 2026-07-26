import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import GoodsList from './pages/database/GoodsList';
import GoodDetail from './pages/database/GoodDetail';
import TownsList from './pages/database/TownsList';
import TownDetail from './pages/database/TownDetail';
import BusinessesList from './pages/database/BusinessesList';
import BusinessDetail from './pages/database/BusinessDetail';
import Buildings from './pages/database/Buildings';
import Production from './pages/calculators/Production';
import Routes from './pages/calculators/Routes';
import Convoy from './pages/calculators/Convoy';

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
      },
      {
        path: 'calculators/production',
        element: <Production />
      },
      {
        path: 'calculators/routes',
        element: <Routes />
      },
      {
        path: 'calculators/convoy',
        element: <Convoy />
      }
    ]
  }
]);
