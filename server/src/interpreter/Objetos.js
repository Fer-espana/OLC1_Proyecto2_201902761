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


module.exports = { DefinirObjeto, IngresarObjeto };