import { useEffect, useState } from "react";
import { instance } from "@viz-js/viz";

export default function AST({ dot }) {
  const [svg, setSvg] = useState("");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    async function render() {
      if (!dot) return setSvg("<p>No se generó ningún AST.</p>");
      try {
        const viz = await instance();
        const output = viz.renderString(dot, { format: "svg", engine: "dot" });
        setSvg(output);
      } catch (err) {
        setSvg("<p>Error al generar AST.</p>");
      }
    }
    render();
  }, [dot]);

  return (
    <div className="seccion">
      <h3>Árbol de Sintaxis (AST)</h3>
      <div className="zoom-controls">  {/* ✅ CAMBIO AQUÍ: clase CSS en lugar de style */}
        <button onClick={() => setScale(scale * 1.2)}>🔍+</button>
        <button onClick={() => setScale(scale / 1.2)}>🔍-</button>
        <button onClick={() => setScale(1)}>Reset</button>
      </div>
      <div className="ast-container">  {/* ✅ CAMBIO AQUÍ: clase CSS en lugar de style */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            display: "inline-block"
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}