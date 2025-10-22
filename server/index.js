const express = require("express");
const cors = require("cors");
const parser = require("./parser/parser");
const interpretar = require("./src/interpreter/interpreter");
const generarAST = require("./src/astgenerator");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Helper global
function extraerContexto(source, loc) {
  try {
    const lineas = String(source).split(/\r?\n/);
    const idx = (loc.first_line || 1) - 1;
    const linea = lineas[idx] ?? "";
    const caretPos = Math.max(0, loc.first_column || 0);
    const marcador = " ".repeat(caretPos) + "^";
    return linea + "\n" + marcador;
  } catch {
    return null;
  }
}

// (opcional) healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/interpretar", (req, res) => {
  const codigo = req.body?.codigo ?? "";

  try {
    // 1) Parse → AST
    const ast = parser.parse(codigo);

    // 2) Interpretar
    const resultado = interpretar(ast);

    // 3) AST → DOT (si falla no bloquea respuesta)
    let astDot = "";
    try {
      astDot = generarAST(ast);
    } catch {
      astDot = "";
    }

    // 4) Normalizar/ordenar errores del intérprete
    const errores = (resultado.errores || []).map(e => ({
      tipo: e.tipo || "Semántico",
      descripcion: e.descripcion || String(e),
      linea: e.linea ?? null,
      columna: e.columna ?? null,
      token: e.token ?? null,
      esperado: e.esperado ?? null,
      cercaDe: e.cercaDe ?? null
    }));

    errores.sort((a, b) => {
      if (a.linea == null && b.linea == null) return 0;
      if (a.linea == null) return 1;
      if (b.linea == null) return -1;
      return a.linea - b.linea || (a.columna ?? 0) - (b.columna ?? 0);
    });

    res.json({
      consola: resultado.consola,
      errores,
      simbolos: resultado.simbolos,
      ast: astDot
    });

  } catch (err) {
    // Error de Jison (léxico/sintáctico)
    const detalle = {
      tipo: "Léxico/Sintáctico",
      descripcion: err?.message || "Error de análisis",
      linea: null,
      columna: null,
      token: null,
      esperado: null,
      cercaDe: null
    };

    if (err && err.hash) {
      const { token, expected, loc } = err.hash;
      detalle.tipo = "Sintáctico";
      detalle.token = token || null;
      detalle.esperado = Array.isArray(expected) ? expected : null;
      if (loc) {
        detalle.linea = loc.first_line ?? null;
        detalle.columna = loc.first_column ?? null;
        detalle.cercaDe = extraerContexto(codigo, loc);
      }
    } else if (/Carácter no reconocido/.test(String(err.message))) {
      detalle.tipo = "Léxico";
    }

    // Se responde 200 para que el front muestre la tabla de errores
    res.status(200).json({
      consola: "",
      errores: [detalle],
      simbolos: [],
      ast: ""
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});