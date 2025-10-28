const Entorno = require("./Contexto");
const {
  Declaracion, 
  Asignacion, 
  Incremento, 
  Decremento, 
  Imprimir, 
  ImprimirNL,
  Si, 
  Para, 
  Mientras, 
  HacerHastaQue, 
  Detener, 
  Continuar
} = require("./Instrucciones");

const {
  Numero, 
  Cadena, 
  aracter, 
  Booleano, 
  Identificador,
  Suma,
  Resta, 
  Multiplicacion, 
  Division, 
  Modulo, 
  Potencia,
  Igualdad, 
  Desigualdad, 
  Menor, 
  MenorIgual, 
  Mayor, 
  MayorIgual,
  And, 
  Or, 
  Not, 
  NegacionUnaria, 
  Ternario, 
  Casteo,
  ToLower, 
  ToUpper
} = require("./Expresiones");

const { 
  DECLARACION_VECTOR1, DECLARACION_VECTOR2, ACCESO_VECTOR, AsignacionVector 
} = require("./Vectores");

const { DefinirProcedimiento, LlamarProcedimiento } = require("./Procedimiento");
const { DefinirFuncion, LlamarFuncion, Retornar } = require("./Funciones");
const { 
  DefinirObjeto, 
  IngresarObjeto, 
  DefinirMetodoObjeto, 
  AccesoAtributo, 
  AsignacionAtributo, 
  LlamarMetodo 
} = require("./Objetos");

function convertirNodo(nodo) {
  if (!nodo || typeof nodo !== "object") return null;

  switch (nodo.tipo) {
    // INSTRUCCIONES BÁSICAS
    case "DECLARACION":
      return new Declaracion(nodo.id, nodo.tipoDato, convertirNodo(nodo.valor));
    case "ASIGNACION":
      return new Asignacion(nodo.id, convertirNodo(nodo.valor));
    case "IMPRIMIR":
      return new Imprimir(convertirNodo(nodo.valor));
    case "IMPRIMIR_NL":
      return new ImprimirNL(convertirNodo(nodo.valor));
    case "INCREMENTO":
      return new Incremento(nodo.id);
    case "DECREMENTO":
      return new Decremento(nodo.id);
    case "DETENER":
      return new Detener();
    case "CONTINUAR":
      return new Continuar();
    case "RETORNAR":
      return new Retornar(nodo.valor ? convertirNodo(nodo.valor) : null);

    // SENTENCIAS DE CONTROL
    case "SI":
      const si = new Si(
        convertirNodo(nodo.condicion), 
        nodo.sentencias.map(convertirNodo)
      );
      if (nodo.oSi && nodo.oSi.length > 0) {
        si.oSi = nodo.oSi.map(oSiItem => ({
          condicion: convertirNodo(oSiItem.condicion),
          sentencias: oSiItem.sentencias.map(convertirNodo)
        }));
      }
      if (nodo.contrario) {
        si.contrario = nodo.contrario.map(convertirNodo);
      }
      return si;

    case "PARA":
      return new Para(
        convertirNodo(nodo.inicio),
        convertirNodo(nodo.condicion),
        convertirNodo(nodo.actualizacion),
        nodo.sentencias.map(convertirNodo)
      );

    case "MIENTRAS":
      return new Mientras(
        convertirNodo(nodo.condicion),
        nodo.sentencias.map(convertirNodo)
      );

    case "HACER_HASTA_QUE":
      return new HacerHastaQue(
        nodo.sentencias.map(convertirNodo),
        convertirNodo(nodo.condicion)
      );

    // EXPRESIONES
    case "NUMERO": return new Numero(nodo.valor);
    case "CADENA": return new Cadena(nodo.valor);
    case "CARACTER": return new Caracter(nodo.valor);
    case "BOOLEANO": return new Booleano(nodo.valor);
    case "ID": return new Identificador(nodo.nombre);

    // OPERACIONES ARITMÉTICAS
    case "SUMA": return new Suma(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "RESTA": return new Resta(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MULTIPLICACION": return new Multiplicacion(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "DIVISION": return new Division(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MODULO": return new Modulo(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "POTENCIA": return new Potencia(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));

    // OPERACIONES RELACIONALES
    case "IGUALDAD": return new Igualdad(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "DESIGUALDAD": return new Desigualdad(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MENOR": return new Menor(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MENOR_IGUAL": return new MenorIgual(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MAYOR": return new Mayor(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "MAYOR_IGUAL": return new MayorIgual(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));

    // OPERACIONES LÓGICAS
    case "AND": return new And(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "OR": return new Or(convertirNodo(nodo.izquierda), convertirNodo(nodo.derecha));
    case "NOT": return new Not(convertirNodo(nodo.expresion));

    // EXPRESIONES UNARIAS Y ESPECIALES
    case "NEGACION_UNARIA": return new NegacionUnaria(convertirNodo(nodo.expresion));
    case "TERNARIO": return new Ternario(convertirNodo(nodo.condicion), convertirNodo(nodo.verdadero), convertirNodo(nodo.falso));
    case "CASTEO": return new Casteo(nodo.tipoDato, convertirNodo(nodo.expresion));
    case "TOLOWER": return new ToLower(convertirNodo(nodo.expresion));
    case "TOUPPER": return new ToUpper(convertirNodo(nodo.expresion));

    // PROCEDIMIENTOS Y FUNCIONES
    case "DEF_PROCEDIMIENTO": return new DefinirProcedimiento(nodo.id, nodo.sentencias.map(convertirNodo), nodo.parametros);
    case "LLAMAR_PROCEDIMIENTO": return new LlamarProcedimiento(nodo.id, nodo.argumentos.map(convertirNodo));
    case "DEF_FUNCION": return new DefinirFuncion(nodo.id, nodo.tipoRetorno, nodo.parametros, nodo.sentencias.map(convertirNodo));
    case "LLAMAR_FUNCION": return new LlamarFuncion(nodo.id, nodo.argumentos.map(convertirNodo));

    // VECTORES
    case "DECLARACION_VECTOR1": 
      if (nodo.dimensiones === 1) {
        return new DECLARACION_VECTOR1(nodo.id, nodo.tipoDato, 1, convertirNodo(nodo.tamaño));
      } else {
        return new DECLARACION_VECTOR1(nodo.id, nodo.tipoDato, 2, convertirNodo(nodo.tamaño1), convertirNodo(nodo.tamaño2));
      }

    case "DECLARACION_VECTOR2": 
      return new DECLARACION_VECTOR2(nodo.id, nodo.tipoDato, nodo.dimensiones, nodo.valores);

    case "ACCESO_VECTOR": 
      return new ACCESO_VECTOR(nodo.id, nodo.indices.map(convertirNodo));

    case "ASIGNACION_VECTOR":
      return new AsignacionVector(nodo.vector, nodo.indices.map(convertirNodo), convertirNodo(nodo.valor));

    // OBJETOS
    case "DEF_OBJETO": return new DefinirObjeto(nodo.id, nodo.atributos);
    case "INGRESAR_OBJETO": return new IngresarObjeto(nodo.id, nodo.tipoObjeto, nodo.valores.map(convertirNodo));
    case "DEF_METODO_OBJETO": return new DefinirMetodoObjeto(nodo.objeto, nodo.id, nodo.parametros, nodo.sentencias.map(convertirNodo));
    case "ACCESO_ATRIBUTO": return new AccesoAtributo(nodo.objeto, nodo.atributo);
    case "ASIGNACION_ATRIBUTO": return new AsignacionAtributo(nodo.objeto, nodo.atributo, convertirNodo(nodo.valor));
    case "LLAMAR_METODO": return new LlamarMetodo(nodo.objeto, nodo.metodo, nodo.argumentos.map(convertirNodo));

    default:
      console.warn(`Nodo no reconocido: ${nodo.tipo}`, nodo);
      return null;
  }
}


function interpretar(nodosAST) {
  const entorno = new Entorno();

  for (const nodo of nodosAST || []) {
    const instruccion = convertirNodo(nodo);
    if (instruccion) {
      instruccion.interpretar(entorno);
      
      // Si hay un error crítico, detener la ejecución
      if (entorno.errores.some(e => e.tipo === "Crítico")) break;
    } else {
      entorno.errores.push({ 
        tipo: "Sintáctico", 
        descripcion: `Nodo inválido: ${nodo ? nodo.tipo : 'undefined'}` 
      });
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