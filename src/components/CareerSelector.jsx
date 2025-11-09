import { useState } from "react";

export default function CareerSelector({ careers, selectedCareer, onChange }) {
  const [filter, setFilter] = useState(selectedCareer || "");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    onChange({ target: { value } });
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ fontSize: "18px" }}>Enter or Select a Career: </label>
      <input
        type="text"
        placeholder="e.g. Software Engineer"
        value={filter}
        onChange={handleInputChange}
        style={{
          marginLeft: "10px",
          fontSize: "16px",
          padding: "5px",
          width: "300px",
        }}
      />
      <select
        value={selectedCareer}
        onChange={onChange}
        style={{ marginLeft: "10px", fontSize: "16px", padding: "5px" }}
      >
        {careers.map((career, i) => (
          <option key={i} value={career}>
            {career}
          </option>
        ))}
      </select>
    </div>
  );
}
