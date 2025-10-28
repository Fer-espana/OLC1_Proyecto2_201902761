const Entorno = require("./Contexto");

class DefinirFuncion {
  constructor(id, tipoRetorno, parametros, sentencias) {
    this.id = id;
    this.tipoRetorno = tipoRetorno;
    this.parametros = parametros;
    this.sentencias = sentencias;
  }

  interpretar(entorno) {
    entorno.declararFuncion(this.id, this.tipoRetorno, this.parametros, this.sentencias);
  }
}

class LlamarFuncion {
  constructor(id, argumentos) {
    this.id = id;
    this.argumentos = argumentos;
  }

  interpretar(entorno) {
    const funcion = entorno.obtenerFuncion(this.id);
    if (!funcion) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Función ${this.id} no declarada` });
      return null;
    }

    const nuevoEntorno = new Entorno();
    nuevoEntorno.entornoPadre = entorno;

    // Asignar parámetros
    for (let i = 0; i < funcion.parametros.length; i++) {
      const param = funcion.parametros[i];
      const arg = this.argumentos[i] ? this.argumentos[i].interpretar(entorno) : 
                  (param.valor ? param.valor.interpretar(entorno) : null);
      nuevoEntorno.declarar(param.id, param.tipoDato, arg);
    }

    // Ejecutar sentencias
    for (const instr of funcion.sentencias) {
      instr.interpretar(nuevoEntorno);
      if (nuevoEntorno.haOcurridoRetorno) {
        return nuevoEntorno.valorRetorno;
      }
    }

    return null;
  }
}

class Retornar {
  constructor(valor) {
    this.valor = valor;
  }

  interpretar(entorno) {
    const valorRetorno = this.valor ? this.valor.interpretar(entorno) : null;
    entorno.haOcurridoRetorno = true;
    entorno.valorRetorno = valorRetorno;
  }
}

module.exports = {
  DefinirFuncion,
  LlamarFuncion,
  Retornar
};