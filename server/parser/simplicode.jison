%lex
%%
[ \t\r]+                      /* skip horizontal whitespace */
// COMENTARIOS
"//"[^\n]*                    /* skip comentarios de línea */
"/*"([^*]|\*+[^/*])*\*+"/"    /* skip comentarios multilínea */

// PALABRAS RESERVADAS - CORREGIDAS LAS MAYÚSCULAS
"ingresar"                    return 'INGRESAR';
"como"                        return 'COMO';
"con valor"                   return 'CONVALOR';
"entero"                      return 'TIPO_ENTERO';
"decimal"                     return 'TIPO_DECIMAL';
"caracter"                    return 'TIPO_CARACTER';
"cadena"                      return 'TIPO_CADENA';
"booleano"                    return 'TIPO_BOOLEANO';
"imprimir"                    return 'IMPRIMIR';
"nl"                          return 'NL';
"Verdadero"                   return 'VERDADERO';  // Cambiado a mayúscula
"Falso"                       return 'FALSO';      // Cambiado a mayúscula
"si"                          return 'SI';
"o"                           return 'O';
"de"                          return 'DE';
"lo"                          return 'LO';
"contrario"                   return 'CONTRARIO';
"mientras"                    return 'MIENTRAS';
"para"                        return 'PARA';
"hacer"                       return 'HACER';
"hasta"                       return 'HASTA';
"que"                         return 'QUE';
"procedimiento"               return 'PROCEDIMIENTO';
"funcion"                     return 'FUNCION';
"retornar"                    return 'RETORNAR';
"ejecutar"                    return 'EJECUTAR';
"vector"                      return 'VECTOR';
"objeto"                      return 'OBJETO';
"con"                         return 'CON';
"metodo"                      return 'METODO';
"detener"                     return 'DETENER';
"continuar"                   return 'CONTINUAR';
"tolower"                     return 'TOLOWER';
"toupper"                     return 'TOUPPER';

// EXPRESIONES REGULARES
[0-9]+(\.[0-9]+)?             return 'NUMERO';
\"([^"\\]|\\.)*\"             return 'CADENA';
\'([^'\\]|\\.)*\'             return 'CARACTER';
[a-zA-Z_][a-zA-Z0-9_]*        return 'ID';

// SIMBOLOS Y OPERADORES
"->"                          return 'ASIGNAR';

// OPERADORES ARITMETICOS
"+"                           return '+';
"-"                           return '-';
"*"                           return '*';
"/"                           return '/';
"^"                           return '^';
"%"                           return '%';

// OPERADORES RELACIONALES - ORDEN CORREGIDO: los más largos primero
"=="                          return '==';
"!="                          return '!=';
"<="                          return '<=';
">="                          return '>=';
"<"                           return '<';
">"                           return '>';

// OPERADORES LOGICOS
"||"                          return '||';
"&&"                          return '&&';
"!"                           return '!';

// SIMBOLOS DE REFERENCIA
"="                           return '=';
"."                           return '.';
"?"                           return '?';
":"                           return ':';

// SIMBOLOS DE AGRUPACION
"("                           return '(';
")"                           return ')';
"["                           return '[';
"]"                           return ']';
"{"                           return '{';
"}"                           return '}';

// SIMBOLOS DE SEPARACION
","                           return ',';
";"                           return ';';

\n                            return 'NEWLINE';
<<EOF>>                       return 'EOF';
. {
    console.error(`Carácter no reconocido: '${yytext}'`);
    return 'INVALIDO';
}
/lex

// PRECEDENCIA CORREGIDA - ORDEN CORRECTO
%left ','                    
%left '?' ':'               // Ternario - BAJA precedencia
%left '||'
%left '&&'
%left '==' '!=' '<' '<=' '>' '>='
%left '+' '-'
%left '*' '/' '%'
%right '^'
%right '!'
%right UNARY
%nonassoc CASTEO            // Precedencia específica para casteos

%start programa

%%

programa
    : sentencias EOF
        { 
            console.log("Análisis completado exitosamente");
            return $1; 
        }
    ;

sentencias
    : sentencias sentencia
        { 
            if ($2 !== null && $2 !== undefined) {
                $$ = $1.concat([$2]); 
            } else {
                $$ = $1;
            }
        }
    | /* empty */
        { $$ = []; }
    ;

sentencia
    : instruccion separador
        { $$ = $1; }
    | separador
        { $$ = null; }
    ;

separador
    : NEWLINE
    | ';'
    ;

instruccion
    : declaracion
        { $$ = $1; }
    | asignacion
        { $$ = $1; }
    | IMPRIMIR expresion
        { $$ = { tipo: 'IMPRIMIR', valor: $2, loc: this.yylloc }; }
    | IMPRIMIR NL expresion
        { $$ = { tipo: 'IMPRIMIR_NL', valor: $3, loc: this.yylloc }; }
    | sentencia_condicional
        { $$ = $1; }
    | ciclo
        { $$ = $1; }
    | procedimiento
        { $$ = $1; }
    | funcion
        { $$ = $1; }
    | EJECUTAR ID '(' ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2, argumentos: [], loc: this.yylloc }; }
    | EJECUTAR ID '(' lista_valores ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2, argumentos: $4, loc: this.yylloc }; }
    | EJECUTAR acceso_atributo '(' ')'
        { $$ = { tipo: 'LLAMAR_METODO', objeto: $2.objeto, metodo: $2.atributo, argumentos: [], loc: this.yylloc }; }
    | EJECUTAR acceso_atributo '(' lista_valores ')'
        { $$ = { tipo: 'LLAMAR_METODO', objeto: $2.objeto, metodo: $2.atributo, argumentos: $4, loc: this.yylloc }; }
    | declaracion_vector_tipo1
        { $$ = $1; }
    | declaracion_vector_tipo2
        { $$ = $1; }
    | def_objeto
        { $$ = $1; }
    | ing_objeto
        { $$ = $1; }
    | def_metodo_objeto
        { $$ = $1; }
    | declaracion_objeto_simple
        { $$ = $1; }
    | DETENER
        { $$ = { tipo: 'DETENER', loc: this.yylloc }; }
    | CONTINUAR
        { $$ = { tipo: 'CONTINUAR', loc: this.yylloc }; }
    | RETORNAR
        { $$ = { tipo: 'RETORNAR', valor: null, loc: this.yylloc }; }
    | RETORNAR expresion
        { $$ = { tipo: 'RETORNAR', valor: $2, loc: this.yylloc }; }
    ;

declaracion 
    : INGRESAR ID COMO tipo CONVALOR expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: $4, valor: $6, loc: this.yylloc }; }
    | tipo ID CONVALOR expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: $1, valor: $4, loc: this.yylloc }; }
    | tipo ID '=' expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: $1, valor: $4, loc: this.yylloc }; }
    ;

// NUEVA: Declaración simple de objetos (Persona p;)
declaracion_objeto_simple
    : ID ID
        { $$ = { tipo: 'DECLARACION_OBJETO', tipoObjeto: $1, id: $2, loc: this.yylloc }; }
    ;

lista_valores 
    : lista_valores ',' expresion
        { $$ = $1.concat([$3]); }
    | expresion
        { $$ = [$1]; }
    ;

asignacion
    : ID ASIGNAR expresion
        { $$ = { tipo: 'ASIGNACION', id: $1, valor: $3, loc: this.yylloc }; }
    | ID '=' expresion
        { $$ = { tipo: 'ASIGNACION', id: $1, valor: $3, loc: this.yylloc }; }
    | acceso_atributo '=' expresion
        { $$ = { tipo: 'ASIGNACION_ATRIBUTO', objeto: $1.objeto, atributo: $1.atributo, valor: $3, loc: this.yylloc }; }
    | acceso_vector '=' expresion
        { $$ = { tipo: 'ASIGNACION_VECTOR', vector: $1.id, indices: $1.indices, valor: $3, loc: this.yylloc }; }
    | actualizacion
        { $$ = $1; }
    ;

// CORREGIDO: Estructura de condicionales mejorada
sentencia_condicional 
    : SI '(' expresion ')' bloque condicional_extra
        { $$ = { tipo: 'SI', condicion: $3, sentencias: $5.sentencias, oSi: $6.oSi, contrario: $6.contrario, loc: this.yylloc }; }
    ;

bloque
    : '{' sentencias '}'
        { $$ = { sentencias: $2, loc: this.yylloc }; }
    ;

condicional_extra
    : lista_o_si DE LO CONTRARIO bloque
        { $$ = { oSi: $1, contrario: $4.sentencias }; }
    | DE LO CONTRARIO bloque
        { $$ = { oSi: [], contrario: $3.sentencias }; }
    | lista_o_si
        { $$ = { oSi: $1, contrario: null }; }
    | /* empty */
        { $$ = { oSi: [], contrario: null }; }
    ;

lista_o_si
    : lista_o_si O SI '(' expresion ')' bloque
        { $$ = $1.concat([{ condicion: $5, sentencias: $7.sentencias, loc: this.yylloc }]); }
    | O SI '(' expresion ')' bloque
        { $$ = [{ condicion: $4, sentencias: $6.sentencias, loc: this.yylloc }]; }
    ;

ciclo 
    : PARA '(' declaracion ';' expresion ';' asignacion ')' bloque
        { $$ = { tipo: 'PARA', inicio: $3, condicion: $5, actualizacion: $7, sentencias: $9.sentencias, loc: this.yylloc }; }
    | PARA '(' asignacion ';' expresion ';' asignacion ')' bloque
        { $$ = { tipo: 'PARA', inicio: $3, condicion: $5, actualizacion: $7, sentencias: $9.sentencias, loc: this.yylloc }; }
    | MIENTRAS '(' expresion ')' bloque
        { $$ = { tipo: 'MIENTRAS', condicion: $3, sentencias: $5.sentencias, loc: this.yylloc }; }
    | HACER bloque HASTA QUE '(' expresion ')'
        { $$ = { tipo: 'HACER_HASTA_QUE', sentencias: $2.sentencias, condicion: $6, loc: this.yylloc }; }
    ;

actualizacion
    : ID '+' '+'
        { $$ = { tipo: 'INCREMENTO', id: $1, loc: this.yylloc }; }
    | ID '-' '-'
        { $$ = { tipo: 'DECREMENTO', id: $1, loc: this.yylloc }; }
    ;

procedimiento 
    : PROCEDIMIENTO ID '(' ')' bloque
        { $$ = { tipo: 'DEF_PROCEDIMIENTO', id: $2, sentencias: $5.sentencias, parametros: [], loc: this.yylloc }; }
    | PROCEDIMIENTO ID '(' lista_parametros ')' bloque
        { $$ = { tipo: 'DEF_PROCEDIMIENTO', id: $2, sentencias: $6.sentencias, parametros: $4, loc: this.yylloc }; }
    ;

funcion 
    : FUNCION tipo ID '(' ')' bloque
        { $$ = { tipo: 'DEF_FUNCION', id: $3, tipoRetorno: $2, sentencias: $6.sentencias, parametros: [], loc: this.yylloc }; }
    | FUNCION tipo ID '(' lista_parametros ')' bloque
        { $$ = { tipo: 'DEF_FUNCION', id: $3, tipoRetorno: $2, sentencias: $7.sentencias, parametros: $5, loc: this.yylloc }; }
    ;

lista_parametros 
    : lista_parametros ',' parametro
        { $$ = $1.concat([$3]); }
    | parametro
        { $$ = [$1]; }
    ;

parametro
    : tipo ID
        { $$ = { tipo: 'PARAMETRO', id: $2, tipoDato: $1, loc: this.yylloc }; }
    | tipo ID '=' expresion
        { $$ = { tipo: 'PARAMETRO', id: $2, tipoDato: $1, valor: $4, loc: this.yylloc }; }
    ;

declaracion_vector_tipo1
    : tipo '[' ']' ID '=' VECTOR tipo '[' expresion ']'
        { $$ = { tipo: 'DECLARACION_VECTOR1', id: $4, tipoDato: $1, tamaño: $9, dimensiones: 1, loc: this.yylloc }; }
    | tipo '[' ']' '[' ']' ID '=' VECTOR tipo '[' expresion ']' '[' expresion ']'
        { $$ = { tipo: 'DECLARACION_VECTOR1', id: $7, tipoDato: $1, tamaño1: $11, tamaño2: $14, dimensiones: 2, loc: this.yylloc }; }
    ;

declaracion_vector_tipo2
    : tipo '[' ']' ID '=' '[' lista_valores ']'
        { $$ = { tipo: 'DECLARACION_VECTOR2', id: $4, tipoDato: $1, valores: $7, dimensiones: 1, loc: this.yylloc }; }
    | tipo '[' ']' '[' ']' ID '=' '[' lista_valores_filas ']'
        { $$ = { tipo: 'DECLARACION_VECTOR2', id: $7, tipoDato: $1, valores: $9, dimensiones: 2, loc: this.yylloc }; }
    ;

lista_valores_filas
    : lista_valores_filas ',' '[' lista_valores ']'
        { $$ = $1.concat([$4]); }
    | '[' lista_valores ']'
        { $$ = [$2]; }
    ;

acceso_vector
    : ID '[' expresion ']'
        { $$ = { tipo: 'ACCESO_VECTOR', id: $1, indices: [$3], loc: this.yylloc }; }
    | ID '[' expresion ']' '[' expresion ']'
        { $$ = { tipo: 'ACCESO_VECTOR', id: $1, indices: [$3, $6], loc: this.yylloc }; }
    ;

// CORREGIDO: Definición de objetos con métodos internos
def_objeto
    : OBJETO ID '{' lista_miembros '}'
        { $$ = { tipo: 'DEF_OBJETO', id: $2, miembros: $4, loc: this.yylloc }; } 
    ;

lista_miembros
    : lista_miembros miembro
        { $$ = $1.concat([$2]); }
    | miembro 
        { $$ = [$1]; }
    ;

miembro
    : atributo ';'
        { $$ = { tipo: 'ATRIBUTO', id: $1.id, tipoDato: $1.tipo, loc: this.yylloc }; }
    | metodo
        { $$ = $1; }
    ;

atributo
    : tipo ID
        { $$ = { id: $2, tipo: $1, loc: this.yylloc }; }
    ;

// NUEVO: Métodos dentro de objetos
metodo
    : PROCEDIMIENTO ID '(' ')' bloque
        { $$ = { tipo: 'METODO_OBJETO', id: $2, tipo: 'PROCEDIMIENTO', parametros: [], sentencias: $5.sentencias, loc: this.yylloc }; }
    | PROCEDIMIENTO ID '(' lista_parametros ')' bloque
        { $$ = { tipo: 'METODO_OBJETO', id: $2, tipo: 'PROCEDIMIENTO', parametros: $4, sentencias: $6.sentencias, loc: this.yylloc }; }
    | FUNCION tipo ID '(' ')' bloque
        { $$ = { tipo: 'METODO_OBJETO', id: $3, tipo: 'FUNCION', tipoRetorno: $2, parametros: [], sentencias: $6.sentencias, loc: this.yylloc }; }
    | FUNCION tipo ID '(' lista_parametros ')' bloque
        { $$ = { tipo: 'METODO_OBJETO', id: $3, tipo: 'FUNCION', tipoRetorno: $2, parametros: $5, sentencias: $7.sentencias, loc: this.yylloc }; }
    ;

// CORREGIDO: Cambiar 'valores' por 'argumentos' para coincidir con el intérprete
ing_objeto
    : INGRESAR OBJETO ID ASIGNAR ID '(' lista_valores ')'
        { $$ = { tipo: 'INGRESAR_OBJETO', id: $3, tipoObjeto: $5, argumentos: $7, loc: this.yylloc }; }
    ;

// CORREGIDO: Métodos de objeto externos (objeto con metodo)
def_metodo_objeto
    : ID CON METODO ID '(' ')' bloque
        { $$ = { tipo: 'DEF_METODO_OBJETO', objeto: $1, id: $4, parametros: [], sentencias: $7.sentencias, loc: this.yylloc }; }
    | ID CON METODO ID '(' lista_parametros ')' bloque
        { $$ = { tipo: 'DEF_METODO_OBJETO', objeto: $1, id: $4, parametros: $6, sentencias: $8.sentencias, loc: this.yylloc }; }
    ;

acceso_atributo
    : ID '.' ID
        { $$ = { tipo: 'ACCESO_ATRIBUTO', objeto: $1, atributo: $3, loc: this.yylloc }; }
    ;

// JERARQUÍA DE EXPRESIONES
expresion
    : expresion_ternaria
    ;

expresion_ternaria
    : expresion_logica_or '?' expresion ':' expresion
        { $$ = { tipo: 'TERNARIO', condicion: $1, verdadero: $3, falso: $5, loc: this.yylloc }; }
    | expresion_logica_or
    ;

expresion_logica_or
    : expresion_logica_or '||' expresion_logica_and
        { $$ = { tipo: 'OR', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_logica_and
    ;

expresion_logica_and
    : expresion_logica_and '&&' expresion_relacional
        { $$ = { tipo: 'AND', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional
    ;

expresion_relacional
    : expresion_relacional '==' expresion_aditiva
        { $$ = { tipo: 'IGUALDAD', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional '!=' expresion_aditiva
        { $$ = { tipo: 'DESIGUALDAD', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional '<' expresion_aditiva
        { $$ = { tipo: 'MENOR', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional '<=' expresion_aditiva
        { $$ = { tipo: 'MENOR_IGUAL', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional '>' expresion_aditiva
        { $$ = { tipo: 'MAYOR', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_relacional '>=' expresion_aditiva
        { $$ = { tipo: 'MAYOR_IGUAL', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_aditiva
    ;

expresion_aditiva
    : expresion_aditiva '+' expresion_multiplicativa
        { $$ = { tipo: 'SUMA', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_aditiva '-' expresion_multiplicativa
        { $$ = { tipo: 'RESTA', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_multiplicativa
    ;

expresion_multiplicativa
    : expresion_multiplicativa '*' expresion_exponencial
        { $$ = { tipo: 'MULTIPLICACION', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_multiplicativa '/' expresion_exponencial
        { $$ = { tipo: 'DIVISION', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_multiplicativa '%' expresion_exponencial
        { $$ = { tipo: 'MODULO', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_exponencial
    ;

expresion_exponencial
    : expresion_unaria '^' expresion_exponencial
        { $$ = { tipo: 'POTENCIA', izquierda: $1, derecha: $3, loc: this.yylloc }; }
    | expresion_unaria
    ;

expresion_unaria
    : '-' expresion_unaria %prec UNARY
        { $$ = { tipo: 'NEGACION_UNARIA', expresion: $2, loc: this.yylloc }; }
    | '!' expresion_unaria
        { $$ = { tipo: 'NOT', expresion: $2, loc: this.yylloc }; }
    | expresion_atomica
    ;

expresion_atomica
    : NUMERO
        { $$ = { tipo: 'NUMERO', valor: Number($1), loc: this.yylloc }; }
    | ID
        { $$ = { tipo: 'ID', nombre: $1, loc: this.yylloc }; }
    | CADENA
        { $$ = { tipo: 'CADENA', valor: $1.slice(1, -1), loc: this.yylloc }; }
    | CARACTER
        { $$ = { tipo: 'CARACTER', valor: $1.slice(1, -1), loc: this.yylloc }; }
    | VERDADERO
        { $$ = { tipo: 'BOOLEANO', valor: true, loc: this.yylloc }; }
    | FALSO
        { $$ = { tipo: 'BOOLEANO', valor: false, loc: this.yylloc }; }
    | acceso_vector
        { $$ = $1; }
    | acceso_atributo
        { $$ = $1; }
    | TOLOWER '(' expresion ')'
        { $$ = { tipo: 'TOLOWER', expresion: $3, loc: this.yylloc }; }
    | TOUPPER '(' expresion ')'
        { $$ = { tipo: 'TOUPPER', expresion: $3, loc: this.yylloc }; }
    | '(' tipo ')' expresion_unaria %prec CASTEO
        { $$ = { tipo: 'CASTEO', tipoDato: $2, expresion: $4, loc: this.yylloc }; }
    | '(' expresion ')'
        { $$ = $2; }
    ;

tipo
    : TIPO_ENTERO
        { $$ = 'entero'; }
    | TIPO_DECIMAL
        { $$ = 'decimal'; }
    | TIPO_CADENA
        { $$ = 'cadena'; }
    | TIPO_BOOLEANO
        { $$ = 'booleano'; }
    | TIPO_CARACTER
        { $$ = 'caracter'; }
    ;