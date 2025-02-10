import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sentiment from './pages/Sentiment';
import Prices from './pages/Prices';
import PriceCandlestick from './pages/PriceCandlestick';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sentiment" element={<Sentiment />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/candlestick" element={<PriceCandlestick />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
