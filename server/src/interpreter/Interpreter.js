const Entorno = require("./Contexto");
const {
  Declaracion,
  Asignacion,
  Incremento,
  Imprimir,
  Si,
  Para
} = require("./Instrucciones");

const { DECLARACION_VECTOR1, ACCESO_VECTOR } = require("./Vectores");

const {
  Numero,
  Cadena,
  Booleano,
  Identificador,
  Suma,
  Resta,
  Multiplicacion,
  Division,
  Modulo,
  Potencia,
  Igualdad,
  Desigualdad
} = require("./Expresiones");

const { DefinirProcedimiento, LlamarProcedimiento } = require("./Procedimiento");

const { DefinirObjeto, IngresarObjeto } = require("./Objetos");

function convertirNodo(nodo) {
  if (!nodo || typeof nodo !== "object") return null;

  switch (nodo.tipo) {
    case "DECLARACION":
      return new Declaracion(nodo.id, nodo.tipoDato, convertirNodo(nodo.valor));
    case "ASIGNACION":
      return new Asignacion(nodo.id, convertirNodo(nodo.valor));
    case "IMPRIMIR":
      return new Imprimir(convertirNodo(nodo.valor));
    case "INCREMENTO":
      return new Incremento(nodo.id);

    //Convertir expresiones a Nodos
    case "NUMERO":
      return new Numero(nodo.valor);
    case "CADENA":
      return new Cadena(nodo.valor);
    case "ID":
      return new Identificador(nodo.nombre);
    case "BOOLEANO":
      return new Booleano(nodo.valor);

    case "IGUALDAD":
      return new Igualdad(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "DESIGUALDAD":
      return new Desigualdad(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));

    // case "OR": --- IGNORE ---
    //   return new Or(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha)); --- IGNORE ---
    case "SUMA":
      return new Suma(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "RESTA":
      return new Resta(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MULTIPLICACION":
      return new Multiplicacion(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "DIVISION":
      return new Division(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MODULO": 
      return new Modulo(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "POTENCIA": 
      return new Potencia(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
      case "SI":
      return new Si(convertirNodo(nodo.condicion), nodo.sentencias.map(convertirNodo));
    case "PARA":
      return new Para(convertirNodo(nodo.inicio), convertirNodo(nodo.condicion), convertirNodo(nodo.actualizacion), nodo.sentencias.map(convertirNodo));


    case "DEF_PROCEDIMIENTO":
      return new DefinirProcedimiento(nodo.id, nodo.sentencias.map(convertirNodo), nodo.parametros);
    case "LLAMAR_PROCEDIMIENTO":
      return new LlamarProcedimiento(nodo.id, nodo.argumentos.map(convertirNodo));

    case "DECLARACION_VECTOR1":
      return new DECLARACION_VECTOR1(nodo.id, nodo.tipoDato, nodo.dim, nodo.tam);
    case "ACCESO_VECTOR":
      return new ACCESO_VECTOR(nodo.id, convertirNodo(nodo.indice), nodo.indice2 ? convertirNodo(nodo.indice2) : null);

    case "DEF_OBJETO":
      return new DefinirObjeto(nodo.id, nodo.atributos);
    case "INGRESAR_OBJETO":
      return new IngresarObjeto(nodo.id, nodo.objetoTipo, nodo.atributos.map(convertirNodo));
    default:
      return null;
  }
}

function interpretar(nodosAST) {
  const entorno = new Entorno();

  for (const nodo of nodosAST || []) {
    const instruccion = convertirNodo(nodo);
    if (instruccion) {
      instruccion.interpretar(entorno);
    } else {
      entorno.errores.push({ tipo: "Sintáctico", descripcion: "Nodo inválido" });
    }
  }

  return {
    consola: entorno.salida,
    errores: entorno.errores,
    simbolos: [...entorno.variables.entries()].map(([id, val]) => ({
      id,
      tipo: val.tipo,
      valor: val.valor
    }))
  };
}

module.exports = interpretar;