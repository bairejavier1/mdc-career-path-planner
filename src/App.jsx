import { useState } from "react";
import pathways from "./pathways.json";
import CareerSelector from "./components/CareerSelector";
import PathwayDisplay from "./components/PathwayDisplay";
import GeminiSuggestions from "./components/GeminiSuggestions";
import "./App.css";

function App() {
  const staticCareers = Object.keys(pathways);
  const [selectedCareer, setSelectedCareer] = useState(staticCareers[0]);
  const pathwayData = pathways[selectedCareer] || {
    AA: "No data available",
    BS: "No data available",
    MS: "No data available",
    Certifications: [],
    Exams: [],
  };

  return (
    <div className="app-container">
      <h1>MDC Career Pathway Planner</h1>
      <CareerSelector
        careers={staticCareers}
        selectedCareer={selectedCareer}
        onChange={(e) => setSelectedCareer(e.target.value)}
      />
      <PathwayDisplay pathway={pathwayData} />
      <GeminiSuggestions career={selectedCareer} />
    </div>
  );
}

export default App;
