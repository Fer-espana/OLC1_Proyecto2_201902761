const Entorno = require("./Contexto");

class Declaracion {
  constructor(id, tipoDato, valor) {
    this.id = id;
    this.tipoDato = tipoDato;
    this.valor = valor;
  }

  interpretar(entorno) {
    const val = this.valor.interpretar(entorno);
    entorno.declarar(this.id, this.tipoDato, val);
  }
}

class Asignacion {
  constructor(id, valor) {
    this.id = id;
    this.valor = valor;
  }

  interpretar(entorno) {
    const val = this.valor.interpretar(entorno);
    entorno.asignar(this.id, val);
  }
}

class Incremento {
  constructor(id) {
    this.id = id;
  }

  interpretar(entorno) {
    const val = entorno.obtener(this.id);
    entorno.asignar(this.id, val + 1);
  }
}

class Imprimir {
  constructor(valor) {
    this.valor = valor;
  }

  interpretar(entorno) {
    const val = this.valor.interpretar(entorno);
    entorno.agregarSalida(val);
  }
}

class Si {
  constructor(condicion, sentencias) {
    this.condicion = condicion;
    this.sentencias = sentencias;
  }

  interpretar(entorno) {
    //console.log("Condición SI:",  this.condicion);
    const cond = this.condicion.interpretar(entorno);
    if (cond) {
      for (const instr of this.sentencias) {
        instr.interpretar(entorno);
      }
    } 
    // else if (this.else_if) {

    // } else if (this.else) {
    //   for (const instr of this.else) {
    //     instr.interpretar(entorno);
    //   }
    // }
  }
}

class Para {
  constructor(inicio, condicion, actualizacion, sentencias) {
    this.inicio = inicio;
    this.condicion = condicion;
    this.actualizacion = actualizacion;
    this.sentencias = sentencias;
  }

  interpretar(entorno) {
    const nuevoEntorno =  new Entorno();
    nuevoEntorno.entornoPadre = entorno;
    this.inicio.interpretar(nuevoEntorno);
    //console.log("Condición PARA:",  this.condicion);
    var condicionVal = this.condicion.interpretar(nuevoEntorno);
    //console.log("Valor condición PARA:",  condicionVal);
    while (condicionVal) {
      for (const instr of this.sentencias) {
        instr.interpretar(nuevoEntorno);
      }
      this.actualizacion.interpretar(nuevoEntorno);
      condicionVal = this.condicion.interpretar(nuevoEntorno);
      //console.log("Valor condición PARA:",  condicionVal);
    } 
  }
}

class Decremento {
  constructor(id) { this.id = id;}
  interpretar(entorno) {
    const val = entorno.obtener(this.id);
    entorno.asignar(this.id, val - 1);
  }
}

class Mientras {
  constructor(condicion, sentencias) {
    this.condicion = condicion;
    this.sentencias = sentencias;
  }
  interpretar(entorno) {
    while (this.condicion.interpretar(entorno)) {
      for (const instr of this.sentencias) {
        instr.interpretar(entorno);
        // Manejar break/continue
        if (entorno.haOcurridoDetener) {
          entorno.haOcurridoDetener = false;
          return;
        }
        if (entorno.haOcurridoContinuar) {
          entorno.haOcurridoContinuar = false;
          break;
        }
      }
    }
  }
}

class HacerHastaQue {
  constructor(sentencias, condicion) {
    this.sentencias = sentencias;
    this.condicion = condicion;
  }
  interpretar(entorno) {
    do {
      for (const instr of this.sentencias) {
        instr.interpretar(entorno);
        if (entorno.haOcurridoDetener) {
          entorno.haOcurridoDetener = false;
          return;
        }
        if (entorno.haOcurridoContinuar) {
          entorno.haOcurridoContinuar = false;
          break;
        }
      }
    } while (!this.condicion.interpretar(entorno));
  }
}

class Detener {
  interpretar(entorno) {
    entorno.haOcurridoDetener = true;
  }
}

class Continuar {
  interpretar(entorno) {
    entorno.haOcurridoContinuar = true;
  }
}

class ImprimirNL {
  constructor(valor) { this.valor = valor; }
  interpretar(entorno) {
    const val = this.valor.interpretar(entorno);
    entorno.agregarSalida(val + '\n');
  }
}

module.exports = {
  Declaracion,
  Asignacion,
  Incremento,
  Imprimir,
  Si,
  Para,
  Decremento, 
  Mientras,
  HacerHastaQue,
  Detener,
  Continuar,
  ImprimirNL
};