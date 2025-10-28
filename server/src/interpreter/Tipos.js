// archivo: simplicode/server/src/interpreter/Tipos.js

// Definición de Tipos de SimpliCode
const TIPOS = {
    ENTERO: 'entero',
    DECIMAL: 'decimal',
    BOOLEANO: 'booleano',
    CARACTER: 'caracter',
    CADENA: 'cadena',
    NULO: 'nulo', // Para manejo de valores no inicializados o nulos
    ERROR: 'error'
};

// Matriz de resultados para operaciones aritméticas (Ejemplo de SUMA)
// Fila: Operando Izquierdo | Columna: Operando Derecho
const TABLA_SUMA = {
    [TIPOS.ENTERO]: {
        [TIPOS.ENTERO]: TIPOS.ENTERO,
        [TIPOS.DECIMAL]: TIPOS.DECIMAL, // entero + decimal = decimal
        [TIPOS.CADENA]: TIPOS.CADENA,   // entero + cadena = cadena (concatenación)
        // ... otros tipos ...
    },
    [TIPOS.DECIMAL]: {
        [TIPOS.ENTERO]: TIPOS.DECIMAL,
        [TIPOS.DECIMAL]: TIPOS.DECIMAL,
        [TIPOS.CADENA]: TIPOS.CADENA, // decimal + cadena = cadena (concatenación)
        // ... otros tipos ...
    },
    [TIPOS.CADENA]: {
        [TIPOS.ENTERO]: TIPOS.CADENA,
        [TIPOS.DECIMAL]: TIPOS.CADENA,
        [TIPOS.CADENA]: TIPOS.CADENA,
        // ... otros tipos ...
    },
    // ... otros tipos ...
};

// Función de ayuda para obtener el tipo de un valor JS interpretado
function obtenerTipo(valor) {
    if (valor === null || valor === undefined) return TIPOS.NULO;
    if (typeof valor === 'number') {
        return Number.isInteger(valor) ? TIPOS.ENTERO : TIPOS.DECIMAL;
    }
    if (typeof valor === 'string') return TIPOS.CADENA;
    if (typeof valor === 'boolean') return TIPOS.BOOLEANO;
    // ... añadir lógica para CARACTER, Objetos, etc.
    return TIPOS.ERROR;
}

// Función de chequeo de tipos
function chequearSuma(tipoIzq, tipoDer) {
    if (TABLA_SUMA[tipoIzq] && TABLA_SUMA[tipoIzq][tipoDer]) {
        return TABLA_SUMA[tipoIzq][tipoDer];
    }
    return TIPOS.ERROR; // Retorna ERROR si la operación no está permitida
}

module.exports = {
    TIPOS,
    obtenerTipo,
    chequearSuma,
    // ... exportar otras funciones de chequeo de tipos (resta, multi, etc.)
};