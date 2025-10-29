const e = require("express");
const Entorno = require("./Contexto");

class DefinirProcedimiento {
    constructor(id, sentencias, parametros) {
        this.id = id;
        this.sentencias = sentencias;
        this.parametros = parametros;
    }

    interpretar(entorno) {
        //console.log("Definir procedimiento:", this.id, this.parametros, this.sentencias);
        entorno.declararProcedimiento(this.id, this.parametros, this.sentencias);
    }
}

class LlamarProcedimiento {
    interpretar(entorno) {
        const procedimiento = entorno.obtener(this.id);  // Cambiar por obtener
        if (!procedimiento || procedimiento.tipo !== "PROCEDIMIENTO") {
            entorno.errores.push({ tipo: "Semántico", descripcion: `Procedimiento ${this.id} no declarado` });
            return;
        }

        const nuevoEntorno = new Entorno();
        nuevoEntorno.entornoPadre = entorno;

        // CORRECCIÓN: Asignar parámetros correctamente
        if (procedimiento.parametros.length > 0) {
            for (let i = 0; i < procedimiento.parametros.length; i++) {
                const param = procedimiento.parametros[i];
                let arg = null;

                if (i < this.argumentos.length) {
                    // CORRECCIÓN: Usar interpretar, no .valor
                    arg = this.argumentos[i].interpretar(entorno);
                } else if (param.valor) {
                    arg = param.valor.interpretar(entorno);
                }

                if (arg !== null) {
                    nuevoEntorno.declarar(param.id, param.tipoDato, arg);
                }
            }
        }

        // Ejecutar sentencias
        for (const instr of procedimiento.sentencias) {
            instr.interpretar(nuevoEntorno);
        }
    }
}

module.exports = { DefinirProcedimiento, LlamarProcedimiento };