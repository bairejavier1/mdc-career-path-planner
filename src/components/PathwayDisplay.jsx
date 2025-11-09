export default function PathwayDisplay({ pathway }) {
  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Educational Pathway</h2>
      <div className="pathway-container">
        <div className="card">
          <h3>A.A. Degree</h3>
          <p>{pathway.AA}</p>
        </div>
        <div className="card">
          <h3>B.S. Degree</h3>
          <p>{pathway.BS}</p>
        </div>
        <div className="card">
          <h3>M.S. Degree</h3>
          <p>{pathway.MS}</p>
        </div>
      </div>

      <h3>Certifications</h3>
      <div className="pathway-container">
        {pathway.Certifications.map((cert, i) => (
          <div key={i} className="card">{cert}</div>
        ))}
      </div>

      <h3>Exams</h3>
      <div className="pathway-container">
        {pathway.Exams.map((exam, i) => (
          <div key={i} className="card">{exam}</div>
        ))}
      </div>
    </div>
  );
}
