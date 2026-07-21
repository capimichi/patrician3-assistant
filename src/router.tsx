import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import GoodsAndBusinesses from './pages/database/GoodsAndBusinesses';
import Towns from './pages/database/Towns';
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
        element: <GoodsAndBusinesses />
      },
      {
        path: 'database/towns',
        element: <Towns />
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
