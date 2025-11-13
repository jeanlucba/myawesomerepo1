import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Providers } from './Providers'
import { StakePage } from '../pages/Stake'

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <Routes>
            <Route path="/" element={<Navigate to="/stake" replace />} />
            <Route path="/stake" element={<StakePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Providers>
  )
}

export default App
