const Entorno = require("./Contexto");

class DECLARACION_VECTOR1 {
  constructor(id, tipoDato, dimensiones, tamaño1, tamaño2 = null) {
    this.id = id;
    this.tipoDato = tipoDato;
    this.dimensiones = dimensiones;
    this.tamaño1 = tamaño1;
    this.tamaño2 = tamaño2;
  }

  interpretar(entorno) {
    let vector;
    if (this.dimensiones === 1) {
      vector = new Array(this.tamaño1.interpretar(entorno));
    } else {
      const filas = this.tamaño1.interpretar(entorno);
      const columnas = this.tamaño2.interpretar(entorno);
      vector = Array.from({ length: filas }, () => new Array(columnas));
    }
    entorno.declarar(this.id, `vector:${this.tipoDato}`, { 
      dimensiones: this.dimensiones, 
      valores: vector 
    });
  }
}

// NUEVA DECLARACIÓN VECTOR TIPO 2
class DECLARACION_VECTOR2 {
  constructor(id, tipoDato, dimensiones, valores) {
    this.id = id;
    this.tipoDato = tipoDato;
    this.dimensiones = dimensiones;
    this.valores = valores;
  }

  interpretar(entorno) {
    let valoresInterpretados = [];
    
    if (this.dimensiones === 1) {
      for (const expr of this.valores) {
        valoresInterpretados.push(expr.interpretar(entorno));
      }
    } else {
      for (const fila of this.valores) {
        let filaInterpretada = [];
        for (const expr of fila) {
          filaInterpretada.push(expr.interpretar(entorno));
        }
        valoresInterpretados.push(filaInterpretada);
      }
    }
    
    entorno.declarar(this.id, `vector:${this.tipoDato}`, {
      dimensiones: this.dimensiones,
      valores: valoresInterpretados
    });
  }
}


class ACCESO_VECTOR {
  constructor(id, indices) {
    this.id = id;
    this.indices = indices; // Array de expresiones para índices
  }

  interpretar(entorno) {
    const vector = entorno.obtener(this.id);
    if (!vector) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Vector ${this.id} no declarado` });
      return null;
    }

    const indicesCalculados = this.indices.map(idx => idx.interpretar(entorno));
    
    try {
      let valor = vector.valores;
      for (const idx of indicesCalculados) {
        valor = valor[idx];
      }
      return valor;
    } catch (e) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Índice fuera de rango en vector ${this.id}` });
      return null;
    }
  }
}

// ASIGNACIÓN A VECTOR
class AsignacionVector {
  constructor(vector, indices, valor) {
    this.vector = vector;
    this.indices = indices;
    this.valor = valor;
  }

  interpretar(entorno) {
    const vectorData = entorno.obtener(this.vector);
    if (!vectorData) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Vector ${this.vector} no declarado` });
      return;
    }

    const indicesCalculados = this.indices.map(idx => idx.interpretar(entorno));
    const valorAsignar = this.valor.interpretar(entorno);

    try {
      let ref = vectorData.valores;
      for (let i = 0; i < indicesCalculados.length - 1; i++) {
        ref = ref[indicesCalculados[i]];
      }
      ref[indicesCalculados[indicesCalculados.length - 1]] = valorAsignar;
    } catch (e) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Índice fuera de rango en asignación a vector ${this.vector}` });
    }
  }
}

module.exports = {
  DECLARACION_VECTOR1,
  DECLARACION_VECTOR2,
  ACCESO_VECTOR,
  AsignacionVector
};