class Numero {
  constructor(valor) { this.valor = valor; }
  interpretar(_) { return this.valor; }
}

class Cadena {
  constructor(valor) { this.valor = valor; }
  interpretar(_) { return this.valor; }
}

class Booleano {
  constructor(valor) { this.valor = valor; }
  interpretar(_) { return this.valor; }
}

class Identificador {
  constructor(nombre) { this.nombre = nombre; }
  interpretar(entorno) { return entorno.obtener(this.nombre); }
}

class Suma {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    if (typeof l === "string" || typeof r === "string") return String(l) + String(r);
    return l + r;
  }
}

class Resta {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    return this.izq.interpretar(entorno) - this.der.interpretar(entorno);
  }
}

class Multiplicacion {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    return this.izq.interpretar(entorno) * this.der.interpretar(entorno);
  }
}

class Division {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    const a = this.izq.interpretar(entorno);
    const b = this.der.interpretar(entorno);
    if (b === 0) {
      entorno.errores.push({ tipo: "Semántico", descripcion: "División por cero" });
    }
    return a / b;
  }
}

class Igualdad {
  constructor(izq, der) { 
    this.izq = izq;
    this.der = der;
  }
  interpretar(entorno) {
    return this.izq.interpretar(entorno) == this.der.interpretar(entorno);
  }
}

class Desigualdad {
  constructor(izq, der) { 
    this.izq = izq;
    this.der = der;
  }
  interpretar(entorno) {
    return this.izq.interpretar(entorno) != this.der.interpretar(entorno);
  }
}

module.exports = {
  Numero,
  Cadena,
  Booleano,
  Identificador,
  Suma,
  Resta,
  Multiplicacion,
  Division,
  Igualdad,
  Desigualdad
};