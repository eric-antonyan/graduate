import { BrowserRouter, Route, Routes } from "react-router-dom"
import Landing from "./Landing"
import PremiumAdminPanel from "./Admin"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<PremiumAdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App