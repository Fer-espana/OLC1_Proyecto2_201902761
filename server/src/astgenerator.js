let contador = 0;

function generarAST(instrucciones) {
  contador = 0;
  let dot = 'digraph AST {\nnode [shape=box];\n';
  const conexiones = [];
  const nodos = [];

  const raizId = nuevoNodo("PROGRAMA", nodos);

  for (const instr of instrucciones || []) {
    const sub = procesarNodo(instr, nodos, conexiones);
    if (sub) {
      conexiones.push(`${raizId} -> ${sub};`);
    }
  }

  dot += nodos.join("\n") + "\n" + conexiones.join("\n") + "\n}";
  return dot;
}

function nuevoNodo(label, nodos) {
  const id = `n${contador++}`;
  const safeLabel = String(label).replace(/"/g, '\\"');
  nodos.push(`${id} [label="${safeLabel}"]`);
  return id;
}

function procesarNodo(nodo, nodos, conexiones) {
  if (!nodo || typeof nodo !== "object") {
    return nuevoNodo("null", nodos);
  }

  switch (nodo.tipo) {
    // INSTRUCCIONES BÁSICAS
    case "DECLARACION": {
      const raiz = nuevoNodo("DECLARACION", nodos);
      const idNode = nuevoNodo(`ID: ${nodo.id}`, nodos);
      const tipoNode = nuevoNodo(`TIPO: ${nodo.tipoDato}`, nodos);
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${idNode}`);
      conexiones.push(`${raiz} -> ${tipoNode}`);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    case "ASIGNACION": {
      const raiz = nuevoNodo("ASIGNACION", nodos);
      const idNode = nuevoNodo(`ID: ${nodo.id}`, nodos);
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${idNode}`);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    case "IMPRIMIR": {
      const raiz = nuevoNodo("IMPRIMIR", nodos);
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    case "IMPRIMIR_NL": {
      const raiz = nuevoNodo("IMPRIMIR_NL", nodos);
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    case "INCREMENTO":
      return nuevoNodo(`INCREMENTO: ${nodo.id}`, nodos);

    case "DECREMENTO":
      return nuevoNodo(`DECREMENTO: ${nodo.id}`, nodos);

    case "DETENER":
      return nuevoNodo("DETENER", nodos);

    case "CONTINUAR":
      return nuevoNodo("CONTINUAR", nodos);

    case "RETORNAR": {
      const raiz = nuevoNodo("RETORNAR", nodos);
      if (nodo.valor) {
        const valNode = procesarNodo(nodo.valor, nodos, conexiones);
        conexiones.push(`${raiz} -> ${valNode}`);
      }
      return raiz;
    }

    // SENTENCIAS DE CONTROL
    case "SI": {
      const raiz = nuevoNodo("SI", nodos);
      const cond = procesarNodo(nodo.condicion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${cond}`);
      
      const cuerpoSi = nuevoNodo("CUERPO_SI", nodos);
      conexiones.push(`${raiz} -> ${cuerpoSi}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpoSi} -> ${sub}`);
      }

      // Manejar "o si"
      if (nodo.oSi && nodo.oSi.length > 0) {
        for (const oSi of nodo.oSi) {
          const oSiNode = nuevoNodo("O_SI", nodos);
          conexiones.push(`${raiz} -> ${oSiNode}`);
          const oSiCond = procesarNodo(oSi.condicion, nodos, conexiones);
          conexiones.push(`${oSiNode} -> ${oSiCond}`);
          const oSiCuerpo = nuevoNodo("CUERPO_O_SI", nodos);
          conexiones.push(`${oSiNode} -> ${oSiCuerpo}`);
          for (const instr of oSi.sentencias || []) {
            const sub = procesarNodo(instr, nodos, conexiones);
            conexiones.push(`${oSiCuerpo} -> ${sub}`);
          }
        }
      }

      // Manejar "de lo contrario"
      if (nodo.contrario) {
        const contrarioNode = nuevoNodo("DE_LO_CONTRARIO", nodos);
        conexiones.push(`${raiz} -> ${contrarioNode}`);
        for (const instr of nodo.contrario || []) {
          const sub = procesarNodo(instr, nodos, conexiones);
          conexiones.push(`${contrarioNode} -> ${sub}`);
        }
      }

      return raiz;
    }

    case "PARA": {
      const raiz = nuevoNodo("PARA", nodos);
      const inicio = procesarNodo(nodo.inicio, nodos, conexiones);
      const cond = procesarNodo(nodo.condicion, nodos, conexiones);
      const actualizacion = procesarNodo(nodo.actualizacion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${inicio}`);
      conexiones.push(`${raiz} -> ${cond}`);
      conexiones.push(`${raiz} -> ${actualizacion}`);
      
      const cuerpo = nuevoNodo("CUERPO_PARA", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      return raiz;
    }

    case "MIENTRAS": {
      const raiz = nuevoNodo("MIENTRAS", nodos);
      const cond = procesarNodo(nodo.condicion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${cond}`);
      
      const cuerpo = nuevoNodo("CUERPO_MIENTRAS", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      return raiz;
    }

    case "HACER_HASTA_QUE": {
      const raiz = nuevoNodo("HACER_HASTA_QUE", nodos);
      
      const cuerpo = nuevoNodo("CUERPO_HACER", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      
      const cond = procesarNodo(nodo.condicion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${cond}`);
      return raiz;
    }

    // EXPRESIONES BÁSICAS
    case "NUMERO":
      return nuevoNodo(`NUM: ${nodo.valor}`, nodos);

    case "CADENA":
      return nuevoNodo(`CAD: "${nodo.valor}"`, nodos);

    case "CARACTER":
      return nuevoNodo(`CHAR: '${nodo.valor}'`, nodos);

    case "BOOLEANO":
      return nuevoNodo(`BOOL: ${nodo.valor}`, nodos);

    case "ID":
      return nuevoNodo(`ID: ${nodo.nombre}`, nodos);

    // OPERACIONES ARITMÉTICAS
    case "SUMA":
    case "RESTA":
    case "MULTIPLICACION":
    case "DIVISION":
    case "MODULO":
    case "POTENCIA":
    case "IGUALDAD":
    case "DESIGUALDAD":
    case "MENOR":
    case "MENOR_IGUAL":
    case "MAYOR":
    case "MAYOR_IGUAL":
    case "AND":
    case "OR": {
      const raiz = nuevoNodo(nodo.tipo, nodos);
      const izq = procesarNodo(nodo.izquierda, nodos, conexiones);
      const der = procesarNodo(nodo.derecha, nodos, conexiones);
      conexiones.push(`${raiz} -> ${izq}`);
      conexiones.push(`${raiz} -> ${der}`);
      return raiz;
    }

    // OPERACIONES UNARIAS
    case "NOT":
    case "NEGACION_UNARIA": {
      const raiz = nuevoNodo(nodo.tipo, nodos);
      const expr = procesarNodo(nodo.expresion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${expr}`);
      return raiz;
    }

    // EXPRESIONES ESPECIALES
    case "TERNARIO": {
      const raiz = nuevoNodo("TERNARIO", nodos);
      const cond = procesarNodo(nodo.condicion, nodos, conexiones);
      const verdadero = procesarNodo(nodo.verdadero, nodos, conexiones);
      const falso = procesarNodo(nodo.falso, nodos, conexiones);
      conexiones.push(`${raiz} -> ${cond}`);
      conexiones.push(`${raiz} -> ${verdadero}`);
      conexiones.push(`${raiz} -> ${falso}`);
      return raiz;
    }

    case "CASTEO": {
      const raiz = nuevoNodo(`CASTEO: ${nodo.tipoDato}`, nodos);
      const expr = procesarNodo(nodo.expresion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${expr}`);
      return raiz;
    }

    case "TOLOWER":
    case "TOUPPER": {
      const raiz = nuevoNodo(nodo.tipo, nodos);
      const expr = procesarNodo(nodo.expresion, nodos, conexiones);
      conexiones.push(`${raiz} -> ${expr}`);
      return raiz;
    }

    // PROCEDIMIENTOS Y FUNCIONES
    case "DEF_PROCEDIMIENTO": {
      const raiz = nuevoNodo(`PROCEDIMIENTO: ${nodo.id}`, nodos);
      
      // Parámetros
      if (nodo.parametros && nodo.parametros.length > 0) {
        const paramsNode = nuevoNodo("PARAMETROS", nodos);
        conexiones.push(`${raiz} -> ${paramsNode}`);
        for (const param of nodo.parametros) {
          const paramNode = nuevoNodo(`PARAM: ${param.id} (${param.tipoDato})`, nodos);
          conexiones.push(`${paramsNode} -> ${paramNode}`);
        }
      }
      
      // Cuerpo
      const cuerpo = nuevoNodo("CUERPO_PROC", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      return raiz;
    }

    case "DEF_FUNCION": {
      const raiz = nuevoNodo(`FUNCION: ${nodo.id} -> ${nodo.tipoRetorno}`, nodos);
      
      // Parámetros
      if (nodo.parametros && nodo.parametros.length > 0) {
        const paramsNode = nuevoNodo("PARAMETROS", nodos);
        conexiones.push(`${raiz} -> ${paramsNode}`);
        for (const param of nodo.parametros) {
          const paramNode = nuevoNodo(`PARAM: ${param.id} (${param.tipoDato})`, nodos);
          conexiones.push(`${paramsNode} -> ${paramNode}`);
        }
      }
      
      // Cuerpo
      const cuerpo = nuevoNodo("CUERPO_FUNC", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      return raiz;
    }

    case "LLAMAR_PROCEDIMIENTO":
    case "LLAMAR_FUNCION": {
      const raiz = nuevoNodo(`LLAMAR: ${nodo.id}`, nodos);
      
      // Argumentos
      if (nodo.argumentos && nodo.argumentos.length > 0) {
        const argsNode = nuevoNodo("ARGUMENTOS", nodos);
        conexiones.push(`${raiz} -> ${argsNode}`);
        for (const arg of nodo.argumentos) {
          const argNode = procesarNodo(arg, nodos, conexiones);
          conexiones.push(`${argsNode} -> ${argNode}`);
        }
      }
      return raiz;
    }

    // VECTORES
    case "DECLARACION_VECTOR1": {
      const raiz = nuevoNodo(`VECTOR1: ${nodo.id}[${nodo.tipoDato}]`, nodos);
      if (nodo.dimensiones === 1) {
        const tamNode = procesarNodo(nodo.tamaño1, nodos, conexiones);
        conexiones.push(`${raiz} -> ${tamNode}`);
      } else {
        const tam1Node = procesarNodo(nodo.tamaño1, nodos, conexiones);
        const tam2Node = procesarNodo(nodo.tamaño2, nodos, conexiones);
        conexiones.push(`${raiz} -> ${tam1Node}`);
        conexiones.push(`${raiz} -> ${tam2Node}`);
      }
      return raiz;
    }

    case "DECLARACION_VECTOR2": {
      const raiz = nuevoNodo(`VECTOR2: ${nodo.id}[${nodo.tipoDato}]`, nodos);
      const valoresNode = nuevoNodo("VALORES", nodos);
      conexiones.push(`${raiz} -> ${valoresNode}`);
      
      if (nodo.dimensiones === 1) {
        for (const valor of nodo.valores || []) {
          const valNode = procesarNodo(valor, nodos, conexiones);
          conexiones.push(`${valoresNode} -> ${valNode}`);
        }
      } else {
        for (const fila of nodo.valores || []) {
          const filaNode = nuevoNodo("FILA", nodos);
          conexiones.push(`${valoresNode} -> ${filaNode}`);
          for (const valor of fila) {
            const valNode = procesarNodo(valor, nodos, conexiones);
            conexiones.push(`${filaNode} -> ${valNode}`);
          }
        }
      }
      return raiz;
    }

    case "ACCESO_VECTOR": {
      const raiz = nuevoNodo(`ACCESO_VECTOR: ${nodo.id}`, nodos);
      for (const indice of nodo.indices || []) {
        const idxNode = procesarNodo(indice, nodos, conexiones);
        conexiones.push(`${raiz} -> ${idxNode}`);
      }
      return raiz;
    }

    case "ASIGNACION_VECTOR": {
      const raiz = nuevoNodo(`ASIGNACION_VECTOR: ${nodo.vector}`, nodos);
      
      // Índices
      const indicesNode = nuevoNodo("INDICES", nodos);
      conexiones.push(`${raiz} -> ${indicesNode}`);
      for (const indice of nodo.indices || []) {
        const idxNode = procesarNodo(indice, nodos, conexiones);
        conexiones.push(`${indicesNode} -> ${idxNode}`);
      }
      
      // Valor
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    // OBJETOS
    case "DEF_OBJETO": {
      const raiz = nuevoNodo(`OBJETO: ${nodo.id}`, nodos);
      const atributosNode = nuevoNodo("ATRIBUTOS", nodos);
      conexiones.push(`${raiz} -> ${atributosNode}`);
      
      for (const atributo of nodo.atributos || []) {
        const attrNode = nuevoNodo(`${atributo.id}: ${atributo.tipo}`, nodos);
        conexiones.push(`${atributosNode} -> ${attrNode}`);
      }
      return raiz;
    }

    case "INGRESAR_OBJETO": {
      const raiz = nuevoNodo(`INSTANCIA: ${nodo.id} -> ${nodo.tipoObjeto}`, nodos);
      const valoresNode = nuevoNodo("VALORES", nodos);
      conexiones.push(`${raiz} -> ${valoresNode}`);
      
      for (const valor of nodo.valores || []) {
        const valNode = procesarNodo(valor, nodos, conexiones);
        conexiones.push(`${valoresNode} -> ${valNode}`);
      }
      return raiz;
    }

    case "DEF_METODO_OBJETO": {
      const raiz = nuevoNodo(`METODO: ${nodo.objeto}.${nodo.id}`, nodos);
      
      // Parámetros
      if (nodo.parametros && nodo.parametros.length > 0) {
        const paramsNode = nuevoNodo("PARAMETROS", nodos);
        conexiones.push(`${raiz} -> ${paramsNode}`);
        for (const param of nodo.parametros) {
          const paramNode = nuevoNodo(`PARAM: ${param.id} (${param.tipoDato})`, nodos);
          conexiones.push(`${paramsNode} -> ${paramNode}`);
        }
      }
      
      // Cuerpo
      const cuerpo = nuevoNodo("CUERPO_METODO", nodos);
      conexiones.push(`${raiz} -> ${cuerpo}`);
      for (const instr of nodo.sentencias || []) {
        const sub = procesarNodo(instr, nodos, conexiones);
        conexiones.push(`${cuerpo} -> ${sub}`);
      }
      return raiz;
    }

    case "ACCESO_ATRIBUTO":
      return nuevoNodo(`ATRIBUTO: ${nodo.objeto}.${nodo.atributo}`, nodos);

    case "ASIGNACION_ATRIBUTO": {
      const raiz = nuevoNodo(`ASIGN_ATTR: ${nodo.objeto}.${nodo.atributo}`, nodos);
      const valNode = procesarNodo(nodo.valor, nodos, conexiones);
      conexiones.push(`${raiz} -> ${valNode}`);
      return raiz;
    }

    case "LLAMAR_METODO": {
      const raiz = nuevoNodo(`LLAMAR_METODO: ${nodo.objeto}.${nodo.metodo}`, nodos);
      
      // Argumentos
      if (nodo.argumentos && nodo.argumentos.length > 0) {
        const argsNode = nuevoNodo("ARGUMENTOS", nodos);
        conexiones.push(`${raiz} -> ${argsNode}`);
        for (const arg of nodo.argumentos) {
          const argNode = procesarNodo(arg, nodos, conexiones);
          conexiones.push(`${argsNode} -> ${argNode}`);
        }
      }
      return raiz;
    }

    default:
      console.warn(`Nodo AST no reconocido: ${nodo.tipo}`, nodo);
      return nuevoNodo(`???: ${nodo.tipo}`, nodos);
  }
}

module.exports = generarAST;