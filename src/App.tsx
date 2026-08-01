import { RouterProvider } from 'react-router-dom';
import { ServicesProvider } from './servicesContext';
import { GameProvider } from './contexts/GameContext';
import { router } from './router';
import './i18n';

function App() {
  return (
    <ServicesProvider>
      <GameProvider>
        <RouterProvider router={router} />
      </GameProvider>
    </ServicesProvider>
  );
}

export default App;
