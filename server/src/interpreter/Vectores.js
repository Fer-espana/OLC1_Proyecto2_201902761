const Entorno = require("./Contexto");

class DECLARACION_VECTOR1 {
  constructor(id, tipoDato, dim, tam) {
    this.id = id;
    this.tipoDato = tipoDato;
    this.dim = dim;
    this.tam = tam;
  }

  interpretar(entorno) {
    entorno.declarar(this.id, "vector:"+this.tipoDato, { dim: this.dim, tam: this.tam });
  }
}

class ACCESO_VECTOR {
  constructor(id, indice, indice2) {
    this.id = id;
    this.indice = indice;
    this.indice2 =  indice2;
  }

    interpretar(entorno) {  
        const vector = entorno.obtener(this.id);
        const valor_indice = this.indice.interpretar(entorno);
        //confirmar si hay un segundo indice
        const valor_indice2 = this.indice2 != null ? this.indice2.interpretar(entorno) : null;

        if (vector && valor_indice !== undefined) {
            if (valor_indice2 !== null) {
                return vector.valor[valor_indice][valor_indice2];
            }
            return vector.valor[valor_indice];
        }

        return null;
    }
}

module.exports = {
    DECLARACION_VECTOR1,
    ACCESO_VECTOR
};