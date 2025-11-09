import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import MyPathway from "./pages/MyPathway";
import PathwayResults from "./pages/PathwayResults";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mypathways" element={<MyPathway />} />
          <Route path="/pathwayresults" element={<PathwayResults />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
