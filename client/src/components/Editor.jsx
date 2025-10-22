import { useState } from "react";
import axios from "axios";
import Consola from "./Consola";
import Simbolos from "./Simbolos";
import Errores from "./Errores";
import AST from "./AST";

export default function Editor() {
  const [astDot, setAstDot] = useState("");
  const [codigo, setCodigo] = useState("");
  const [consola, setConsola] = useState("");
  const [errores, setErrores] = useState([]);
  const [simbolos, setSimbolos] = useState([]);

  const ejecutar = async () => {
    try {
      const res = await axios.post("/api/interpretar", { codigo }); // <= proxy
      setConsola(res.data.consola ?? "");
      setErrores(res.data.errores ?? []);
      setSimbolos(res.data.simbolos ?? []);
      setAstDot(res.data.ast ?? "");
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.errores?.[0]?.descripcion ||
        error?.message ||
        "Error al interpretar.";
      setConsola("");
      setErrores([{ tipo: "Cliente", descripcion: msg }]);
      setSimbolos([]);
      setAstDot("");
    }
  };

  return (
    <div className="app">
      <h2>SimpliCode Editor</h2>

      <textarea
        rows={12}
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Escribe tu código aquí..."
      />

      <button onClick={ejecutar}>Ejecutar</button>

      <div className="seccion">
        <Consola texto={consola} />
      </div>

      <div className="seccion">
        <Simbolos data={simbolos} />
      </div>

      <div className="seccion">
        <Errores data={errores} />
      </div>

      <div className="seccion">
        <AST dot={astDot} />
      </div>
    </div>
  );
}