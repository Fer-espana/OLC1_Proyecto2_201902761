export default function Simbolos({ data }) {
  const simbolos = Array.isArray(data) ? data : [];
  
  return (
    <div className="seccion">
      <h3>Tabla de Símbolos</h3>
      {simbolos.length === 0 ? (
        <p>No hay símbolos declarados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {simbolos.map((s, i) => (
              <tr key={i}>
                <td>{s.id}</td>
                <td>{s.tipo}</td>
                <td>{JSON.stringify(s.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}