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
    constructor(id, argumentos) {
        this.id = id;
        this.argumentos = argumentos;
    }

    interpretar(entorno) {
        const procedimiento = entorno.obtenerProcedimiento(this.id); //{sentencias: [], parametros: []}
        if (!procedimiento || procedimiento.tipo !== "PROCEDIMIENTO") {            
            entorno.errores.push({ tipo: "Semántico", descripcion: `Procedimiento ${this.id} no declarado` });
            return;
        }
        //Crear nuevo entorno para el procedimiento
        const nuevoEntorno =  new Entorno();
        nuevoEntorno.entornoPadre = entorno;
        // Si tiene parametros, asignar los argumentos a los parámetros
        if (procedimiento.parametros.length > 0 ){
            
            for (let i = 0; i < procedimiento.parametros.length; i++) {
                const param = procedimiento.parametros[i];
                
                let arg = null;
                if (this.argumentos[i]){
                    arg = this.argumentos[i].valor;
                } else {
                    
                    arg = param.valor.valor; // Valor por defecto si no se proporciona argumento
                }
                
                nuevoEntorno.declarar(param.id, param.tipo, arg);
            }
        }
        //Ejecutar las sentencias del procedimiento 
        for (const instr of procedimiento.sentencias) {
            instr.interpretar(nuevoEntorno);
        }
    }
}

module.exports = { DefinirProcedimiento, LlamarProcedimiento };