export default function Errores({ data }) {
  const rows = Array.isArray(data) ? [...data] : [];
  rows.sort((a, b) => {
    const al = a?.linea ?? Number.MAX_SAFE_INTEGER;
    const bl = b?.linea ?? Number.MAX_SAFE_INTEGER;
    if (al !== bl) return al - bl;
    const ac = a?.columna ?? Number.MAX_SAFE_INTEGER;
    const bc = b?.columna ?? Number.MAX_SAFE_INTEGER;
    return ac - bc;
  });

  return (
    <div className="seccion">
      <h3>Errores</h3>
      {rows.length === 0 ? (
        <p>Sin errores.</p>
      ) : (
        <>
          <table className="tabla-errores">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Línea</th>
                <th>Columna</th>
                <th>Token</th>
                <th>Esperado</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{e.tipo ?? "-"}</td>
                  <td>{e.linea ?? "-"}</td>
                  <td>{e.columna ?? "-"}</td>
                  <td>{e.token ?? "-"}</td>
                  <td>
                    {Array.isArray(e.esperado) ? e.esperado.join(", ") : "-"}
                  </td>
                  <td>{e.descripcion ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Vista previa contextual*/}
          <div style={{ marginTop: "0.75rem" }}>
            {rows.map(
              (e, i) =>
                e?.cercaDe && (
                  <pre key={i} className="code-line">
                    {e.cercaDe}
                  </pre>
                )
            )}
          </div>
        </>
      )}
    </div>
  );
}