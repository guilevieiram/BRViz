import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Example from "./pages/Example";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="example" element={<Example />} />
        </Route>
      </Routes>
    </BrowserRouter>)
}

export default App
