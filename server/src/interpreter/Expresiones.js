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

class Modulo {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    
    // Validar que ambos sean números (se simplifica la validación por ahora)
    if (typeof l !== 'number' || typeof r !== 'number') {
      entorno.errores.push({ tipo: "Semántico", descripcion: "Operador Módulo (%) solo soporta tipos numéricos." });
      return null;
    }
    if (r === 0) {
      entorno.errores.push({ tipo: "Semántico", descripcion: "Módulo por cero." });
      return null;
    }

    return l % r;
  }
}

class Potencia {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    const base = this.izq.interpretar(entorno);
    const exponente = this.der.interpretar(entorno);
    
    if (typeof base !== 'number' || typeof exponente !== 'number') {
      entorno.errores.push({ tipo: "Semántico", descripcion: "Operador Potencia (^) solo soporta tipos numéricos." });
      return null;
    }
    
    return Math.pow(base, exponente); // Usamos la función nativa Math.pow
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

class Menor {
  constructor(izq, der) { this.izq = izq; this.der = der;}
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l < r;
  }
}

class MenorIgual {
  constructor(izq, der) { this.izq = izq; this.der = der;}
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l <= r;
  }
}

class Mayor {
  constructor(izq, der) { this.izq = izq; this.der = der;}
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l > r;
  }
}

class MayorIgual {
  constructor(izq, der) { this.izq = izq; this.der = der;}
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l >= r;
  }
}

class And {
  constructor(izq, der) { this.izq = izq; this.der = der; }
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l && r;
  }
}

class Or {
  constructor(izq, der) { this.izq = izq; this.der = der;}
  interpretar(entorno) {
    const l = this.izq.interpretar(entorno);
    const r = this.der.interpretar(entorno);
    return l || r;
  }
}

class Not {
  constructor(expresion) { this.expresion = expresion; }
  interpretar(entorno) {
    const valor = this.expresion.interpretar(entorno);
    return !valor;
  }
}
//Negacion expresion unaria
class NegacionUnaria {
  constructor(expresion) { this.expresion = expresion; }
  interpretar(entorno) {
    const valor = this.expresion.interpretar(entorno);
    if (typeof valor !== 'number') {
      entorno.errores.push({ tipo: "Semántico", descripcion: "Negacion unarioa solo aplicable a numeros" });
      return null;
    }
    return -valor;
  }
}

//Operador ternario

class Ternario {
  constructor(condicion, verdadero, falso) {
    this.condicion = condicion;
    this.verdadero = verdadero;
    this.falso = falso;
  }
  interpretar(entorno) {
    const cond = this.condicion.interpretar(entorno);
    return cond ? this.verdadero.interpretar(entorno) : this.falso.interpretar(entorno);
  }
}

//  CASTEOS
class Casteo {
  constructor(tipoDato, expresion) {
    this.tipoDato = tipoDato;
    this.expresion = expresion;
  }
  interpretar(entorno) {
    const valor = this.expresion.interpretar(entorno);
    
    switch (this.tipoDato) {
      case 'entero':
        return Math.trunc(Number(valor));
      case 'decimal':
        return Number(valor);
      case 'cadena':
        return String(valor);
      case 'caracter':
        if (typeof valor === 'number') return String.fromCharCode(valor);
        return String(valor).charAt(0);
      default:
        entorno.errores.push({ tipo: "Semántico", descripcion: `Tipo de casteo no soportado: ${this.tipoDato}` });
        return null;
    }
  }
}

//  FUNCIONES BUILT-IN
class ToLower {
  constructor(expresion) { this.expresion = expresion; }
  interpretar(entorno) {
    const valor = this.expresion.interpretar(entorno);
    if (typeof valor !== 'string') {
      entorno.errores.push({ tipo: "Semántico", descripcion: "tolower solo aplicable a cadenas" });
      return null;
    }
    return valor.toLowerCase();
  }
}

class ToUpper {
  constructor(expresion) { this.expresion = expresion; }
  interpretar(entorno) {
    const valor = this.expresion.interpretar(entorno);
    if (typeof valor !== 'string') {
      entorno.errores.push({ tipo: "Semántico", descripcion: "toupper solo aplicable a cadenas" });
      return null;
    }
    return valor.toUpperCase();
  }
}

//  CARACTER
class Caracter {
  constructor(valor) { this.valor = valor; }
  interpretar(_) { return this.valor; }
}

module.exports = {
  // Existentes
  Numero, Cadena, Booleano, Identificador,
  Suma, Resta, Multiplicacion, Division, Modulo, Potencia,
  Igualdad, Desigualdad,
  
  // Nuevas
  Menor, MenorIgual, Mayor, MayorIgual,
  And, Or, Not,
  NegacionUnaria,
  Ternario,
  Casteo,
  ToLower, ToUpper,
  Caracter
};