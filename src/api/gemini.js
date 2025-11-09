import axios from "axios";

export async function getCareerData(query) {
  if (!query) return [];

  try {
    const response = await axios.post("http://localhost:3001/api/gemini", { query });
    console.log("Gemini response:", response.data);

    const output = response.data?.text || "";
    if (!output.trim()) return [];

    // Split each suggestion by newline
    return output
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => ({ name: line.trim() }));
  } catch (error) {
    console.error("Gemini API error:", error);
    return [];
  }
}
