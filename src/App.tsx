import { RouterProvider } from 'react-router-dom';
import { ServicesProvider } from './servicesContext';
import { router } from './router';
import './i18n';

function App() {
  return (
    <ServicesProvider>
      <RouterProvider router={router} />
    </ServicesProvider>
  );
}

export default App;
