class Entorno {
  constructor() {

    //Propiedades para de control de flujo
    this.variables = new Map();
    this.errores = [];
    this.salida = "";
    this.entornoPadre = null;
    this.diccionarioObjetos = new Map();
    this.haOcurridoDetener = false;
    this.haOcurridoContinuar = false;
    this.haOcurridoRetorno = false;
    this.valorRetorno = null;
  }

  declarar(id, tipo, valor) {
    //Declraramos en el Entorno/COntexto actual
    if (this.variables.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} ya declarada` });
      return;
    }
    this.variables.set(id, { tipo, valor });
  }

  declararProcedimiento(id, parametros, sentencias) {    
    this.variables.set(id, { tipo: "PROCEDIMIENTO", sentencias: sentencias, parametros: parametros });
  }

  asignar(id, valor) {
    //Primero busca el simbolo en la tabla actual
    if (!this.variables.has(id)) {
      //Si no esta en el entorno actual y no hay entorno padre hay error
      if(this.entornoPadre == null){
        this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} no declarada` });
        return;
      }else{
        //Busca en el paddre y recupera sus erroes
        this.entornoPadre.asignar(id, valor);
        this.errores.push(...this.entornoPadre.errores);
      }
    }
    this.variables.get(id).valor = valor;
  }

  obtener(id) {
    //Busca la variable en entorno actual
    if (!this.variables.has(id)) {
      //busca en el entorno padre
      if (this.entornoPadre == null){
        this.errores.push({ tipo: "Semántico", descripcion: `Variable ${id} no declarada` });
        return;
      }
      else {        
        let valor = this.entornoPadre.obtener(id).valor;
        this.errores.push(...this.entornoPadre.errores);
        return valor;
      }
    }
    return this.variables.get(id).valor;
  }

  obtenerProcedimiento(id) {
    //Busca la variable en entorno actual
    if (!this.variables.has(id)) {
      //busca en el entorno padre
      if (this.entornoPadre == null){
        this.errores.push({ tipo: "Semántico", descripcion: `Procedimiento, Funcion o Metodo ${id} no declarado` });
        return;
      }
      else {        
        let valor = this.entornoPadre.obtener(id);
        return valor;
      }
    }
    return this.variables.get(id);
  }

  agregarSalida(val){
    if(this.entornoPadre == null){
      this.salida += (val !== undefined && val !== null ? val : "null") + "\n";      
    }else{
      this.entornoPadre.agregarSalida(val);
    }
  }

  declararObjeto(id, atributos){
    if (this.diccionarioObjetos.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Objeto ${id} ya declarado` });
      return;
    }
    this.diccionarioObjetos.set(id, atributos);
  }

  /*guardarMetodoObjeto(objetoId, metodoId, parametros, sentencias){
    const objeto = this.diccionarioObjetos.get(objetoId);
    if(!objeto){
      this.errores.push({ tipo: "Semántico", descripcion: `Objeto ${objetoId} no declarado` });
      return;
    }
    if(!objeto.metodos){
      objeto.metodos = new Map();
    }
    if(objeto.metodos.has(metodoId)){
      this.errores.push({ tipo: "Semántico", descripcion: `Metodo ${metodoId} ya declarado en el objeto ${objetoId}` });
      return;
    }
    objeto.metodos.set(metodoId, { parametros: parametros, sentencias: sentencias });
  }*/

  declararFuncion(id, tipoRetorno, parametros, sentencias) {
    if (this.variables.has(id)) {
      this.errores.push({ tipo: "Semántico", descripcion: `Función ${id} ya declarada` });
      return;
    }
    this.variables.set(id, { 
      tipo: "FUNCION", 
      tipoRetorno, 
      parametros, 
      sentencias 
    });
  }

  obtenerFuncion(id) {
    if (!this.variables.has(id)) {
      if (this.entornoPadre == null) {
        this.errores.push({ tipo: "Semántico", descripcion: `Función ${id} no declarada` });
        return null;
      }
      return this.entornoPadre.obtenerFuncion(id);
    }
    const func = this.variables.get(id);
    return func.tipo === "FUNCION" ? func : null;
  }

  // 🆕 MÉTODO PARA DECLARACIONES MÚLTIPLES (opcional)
  declararMultiple(ids, tipoDato, valores) {
    if (ids.length !== valores.length) {
      this.errores.push({ tipo: "Semántico", descripcion: "Número de variables y valores no coincide" });
      return;
    }
    
    for (let i = 0; i < ids.length; i++) {
      this.declarar(ids[i], tipoDato, valores[i]);
    }
  }
}

module.exports = Entorno;