const Entorno = require("./Contexto");

class DefinirObjeto {
    constructor(nombre, atributos) {
        this.nombre = nombre;
        this.atributos = atributos; // Array de {id, valor}
    }

    interpretar(entorno) {
        entorno.declararObjeto(this.nombre, this.atributos);
    }
}

class IngresarObjeto {
    constructor(id, objetoTipo, atributos) {
        this.id = id;
        this.objetoTipo = objetoTipo;
        this.atributos = atributos; // Array de valores
    }

    interpretar(entorno) {
        console.log("Ingresando objeto de tipo:", this.objetoTipo, "con id:", this.id, "y atributos:", this.atributos);
        const objetoDefinido = entorno.diccionarioObjetos.get(this.objetoTipo);
        if (!objetoDefinido) {
            entorno.errores.push({ tipo: "Semántico", descripcion: `Tipo de objeto ${this.objetoTipo} no definido` });
            return;
        }
        const atributosObjeto = {};
        for (let i = 0; i < objetoDefinido.length; i++) {
            const atributoDefinido = objetoDefinido[i];
            const valorAtributo = this.atributos[i].interpretar(entorno);
            if (valorAtributo !== undefined) {
                atributosObjeto[atributoDefinido.id] = { tipo: atributoDefinido.tipo, valor: valorAtributo };
            }
        }
        entorno.declarar(this.id, "OBJETO:"+this.objetoTipo, atributosObjeto);
    }
}

class DefinirMetodoObjeto {
  constructor(objeto, id, parametros, sentencias) {
    this.objeto = objeto;
    this.id = id;
    this.parametros = parametros;
    this.sentencias = sentencias;
  }

  interpretar(entorno) {
    const objDef = entorno.diccionarioObjetos.get(this.objeto);
    if (!objDef) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Objeto ${this.objeto} no definido` });
      return;
    }

    if (!objDef.metodos) objDef.metodos = new Map();
    if (objDef.metodos.has(this.id)) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Método ${this.id} ya existe en objeto ${this.objeto}` });
      return;
    }

    objDef.metodos.set(this.id, {
      parametros: this.parametros,
      sentencias: this.sentencias
    });
  }
}

class AccesoAtributo {
  constructor(objeto, atributo) {
    this.objeto = objeto;
    this.atributo = atributo;
  }

  interpretar(entorno) {
    const instancia = entorno.obtener(this.objeto);
    if (!instancia || !instancia.tipo.startsWith('OBJETO:')) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `${this.objeto} no es una instancia de objeto` });
      return null;
    }

    return instancia.valor[this.atributo]?.valor;
  }
}

class AsignacionAtributo {
  constructor(objeto, atributo, valor) {
    this.objeto = objeto;
    this.atributo = atributo;
    this.valor = valor;
  }

  interpretar(entorno) {
    const instancia = entorno.obtener(this.objeto);
    if (!instancia || !instancia.tipo.startsWith('OBJETO:')) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `${this.objeto} no es una instancia de objeto` });
      return;
    }

    const valorAsignar = this.valor.interpretar(entorno);
    if (instancia.valor[this.atributo]) {
      instancia.valor[this.atributo].valor = valorAsignar;
    } else {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Atributo ${this.atributo} no existe en objeto ${this.objeto}` });
    }
  }
}

class LlamarMetodo {
  constructor(objeto, metodo, argumentos) {
    this.objeto = objeto;
    this.metodo = metodo;
    this.argumentos = argumentos;
  }

  interpretar(entorno) {
    const instancia = entorno.obtener(this.objeto);
    if (!instancia || !instancia.tipo.startsWith('OBJETO:')) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `${this.objeto} no es una instancia de objeto` });
      return null;
    }

    const tipoObjeto = instancia.tipo.split(':')[1];
    const objDef = entorno.diccionarioObjetos.get(tipoObjeto);
    const metodoDef = objDef?.metodos?.get(this.metodo);

    if (!metodoDef) {
      entorno.errores.push({ tipo: "Semántico", descripcion: `Método ${this.metodo} no existe en objeto ${tipoObjeto}` });
      return null;
    }

    const nuevoEntorno = new Entorno();
    nuevoEntorno.entornoPadre = entorno;

    // Pasar atributos del objeto como variables
    for (const [atributo, valor] of Object.entries(instancia.valor)) {
      nuevoEntorno.declarar(atributo, valor.tipo, valor.valor);
    }

    // Pasar parámetros
    for (let i = 0; i < metodoDef.parametros.length; i++) {
      const param = metodoDef.parametros[i];
      const arg = this.argumentos[i] ? this.argumentos[i].interpretar(entorno) : 
                  (param.valor ? param.valor.interpretar(entorno) : null);
      nuevoEntorno.declarar(param.id, param.tipoDato, arg);
    }

    // Ejecutar método
    for (const instr of metodoDef.sentencias) {
      instr.interpretar(nuevoEntorno);
      if (nuevoEntorno.haOcurridoRetorno) {
        return nuevoEntorno.valorRetorno;
      }
    }

    return null;
  }
}


module.exports = { 
DefinirObjeto, 
IngresarObjeto,
DefinirMetodoObjeto,
AccesoAtributo,
AsignacionAtributo,
LlamarMetodo
};