import './App.css';
import '@rainbow-me/rainbowkit/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  optimismGoerli, avalancheFuji
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Navbar from './components/Navbar';
import Fuel from './pages/Fuel';
import Dashboard from './pages/Dashboard';

export const polygonMumbai = {
  id: 80_001,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'Polygon',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://rpc-mumbai.maticvigil.com'] },
    default: { http: ['https://rpc-mumbai.maticvigil.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://mumbai.polygonscan.com' },
    default: { name: 'SnowTrace', url: 'https://mumbai.polygonscan.com' },
  },
} 

const { chains, publicClient } = configureChains(
  [optimismGoerli, avalancheFuji, polygonMumbai],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'x-fuel',
  projectId: '61489a11990e81512604b033a758b00a',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

function App() {
  return (
  <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <div className="bg-gradient-to-t from-gray-800 to-black w-screen h-screen">
          <Router>
            <Navbar/>  
            <Routes>
              <Route path='/' exact element={<Fuel/>}/>
              <Route path='/dashboard' exact element={<Dashboard/>}/>
              {/* <Route path='/staking' exact element={<Staking/>}/>
              <Route path='/staking/:chainId' exact element={<Execute/>}/>
              <Route path='/earn' exact element={<Earn/>}/> */}
            </Routes>
          </Router>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
