import { LandingPage } from './components/LandingPage';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <LandingPage />
      <SpeedInsights />
    </>
  );
}

export default App;
