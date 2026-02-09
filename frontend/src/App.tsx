import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductPlatformApp from "@/components/ProductPlatformApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<ProductPlatformApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
