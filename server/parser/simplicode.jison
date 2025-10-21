%lex
%%
[ \t\r]+                      /* skip horizontal whitespace */
//PALABRAS RESERVADAS
"ingresar"                    return 'INGRESAR';
"como"                        return 'COMO';
"con valor"                   return 'CONVALOR';
"entero"                      return 'TIPO_ENTERO';
"cadena"                      return 'TIPO_CADENA';
"booleano"                    return 'TIPO_BOOLEANO';
"imprimir"                    return 'IMPRIMIR';
"verdadero"                   return 'VERDADERO';
"falso"                       return 'FALSO';
"si"                          return 'SI';
"de"                          return 'DE';
"lo"                          return 'LO';
"contrario"                   return 'CONTRARIO';
"mientras"                    return 'MIENTRAS';
"para"                        return 'PARA';
"hasta"                        return 'HASTA';
"que"                         return 'QUE';
"procedimiento"               return 'PROCEDIMIENTO';
"ejecutar"                    return 'EJECUTAR';
//EXPRESIONES REGULARES
[0-9]+                        return 'NUMERO';
\"[^"]*\"                     return 'CADENA';
[a-zA-Z_][a-zA-Z0-9_]*        return 'ID';
//OPERADORES ARITMETICOS
"+"                           return '+';
"-"                           return '-';
"*"                           return '*';
"/"                           return '/';
//OPERADORES RELACIONALES
"=="                         return '==';
"!="                         return '!=';
//OPERADORES BOOLEANOS
"||"                         return '||';
"&&"                         return '&&';
"!"                          return '!';
//SIMBOLOS DE REFERENCIA
"->"                          return 'ASIGNAR';
"="                           return '=';
"."                           return '.';
//SIMBOLOS DE AGRUPACION
"("                           return '(';
")"                           return ')';
//SIMBOLOS DE SEPARACION
"{"                           return '{';
"}"                           return '}';
";"                           return ';';
\n                            return 'NEWLINE';
<<EOF>>                       return 'EOF';
. {
    console.error(`Carácter no reconocido: '${yytext}'`);
    return 'INVALIDO';
}
/lex

/* Operator precedence - lowest to highest */
%left '+' '-'
%left '*' '/'
%left '==' '!='
%left '||' '&&'

%left ','

%start programa
%token INGRESAR COMO CONVALOR TIPO_ENTERO TIPO_CADENA ASIGNAR IMPRIMIR ID NUMERO CADENA NEWLINE VERDADERO FALSO

%locations
%error-verbose

%%

programa
    : sentencias EOF
        { return $1; }
    ;

sentencias
    : sentencias sentencia
        { 
          if ($2 !== null) {
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
        { $$ = { tipo: 'IMPRIMIR', valor: $2 }; }
    | sentencia_condicional
        { $$ = $1; }
    | ciclo
        { $$ = $1; }
    | procedimiento
        { $$ = $1; }
    | EJECUTAR ID '(' ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2, argumentos: [] }; }
    | EJECUTAR ID '(' lista_valores ')'
        { $$ = { tipo: 'LLAMAR_PROCEDIMIENTO', id: $2, argumentos: $4 }; }
    ;

declaracion 
    : INGRESAR ID COMO tipo CONVALOR expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: $4, valor: $6 }; }
    | tipo ID CONVALOR expresion
        { $$ = { tipo: 'DECLARACION', id: $2, tipoDato: $1, valor: $4 }; }
    ;

lista_valores 
    : lista_valores ',' expresion
        { $$ = $1.concat([$3]); }
    | expresion
        { $$ = [$1]; }
    ;

asignacion
    : ID ASIGNAR expresion
        { $$ = { tipo: 'ASIGNACION', id: $1, valor: $3 }; }
    | ID '=' expresion
        { $$ = { tipo: 'ASIGNACION', id: $1, valor: $3 }; }
    | actualizcion
        { $$ = $1; }
    ;

sentencia_condicional 
    : SI '(' expresion ')' '{' sentencias '}'
        { //console.log("Condición SI:",  $3);
            $$ = { tipo: 'SI', condicion: $3, sentencias: $6 }; }
    | SI '(' expresion ')' '{' sentencias '}' DE LO CONTRARIO '{' sentencias '}'
        { $$ = { tipo: 'SI', condicion: $3, sentencias: $6, else: $12 }; }
    ;

ciclo 
    : PARA '(' declaracion ';' expresion ';' asignacion ')' '{' sentencias '}'
        { $$ = { tipo: 'PARA', inicio: $3, condicion: $5, actualizacion: $7, sentencias: $10 }; }
    | PARA '(' asignacion ';' expresion ';' asignacion ')' '{' sentencias '}'
        { $$ = { tipo: 'PARA', inicio: $3, condicion: $5, actualizacion: $7, sentencias: $10 }; }
;

actualizcion
    : ID '+' '+'
        { $$ = { tipo: 'INCREMENTO', id: $1 }; }
    | ID '-' '-'
        { $$ = { tipo: 'DECREMENTO', id: $1 }; }
    ;

procedimiento 
    : PROCEDIMIENTO ID '('  ')'  '{' sentencias '}' 
    {$$ = { tipo: 'DEF_PROCEDIMIENTO', id: $2, sentencias: $6, parametros: [] }; }
    | PROCEDIMIENTO ID '(' lista_parametros ')'  '{' sentencias '}' 
    {$$ = { tipo: 'DEF_PROCEDIMIENTO', id: $2, sentencias: $7, parametros: $4 }; }
;

lista_parametros : 
    lista_parametros ',' parametro
    { $$ = $1.concat([$3]); }
    | parametro
    { $$ = [$1]; }
;

parametro
    : tipo ID
    { $$ = { tipo: 'PARAMETRO', id: $2, tipoDato: $1 }; }
    | tipo ID '=' expresion
    { $$ = { tipo: 'PARAMETRO', id: $2, tipoDato: $1, valor: $4 }; }
;

expresion
    : expresion '+' expresion
        { $$ = { tipo: 'SUMA', izquierda: $1, derecha: $3 }; }
    | expresion '-' expresion
        { $$ = { tipo: 'RESTA', izquierda: $1, derecha: $3 }; }
    | expresion '*' expresion
        { $$ = { tipo: 'MULTIPLICACION', izquierda: $1, derecha: $3 }; }
    | expresion '/' expresion
        { $$ = { tipo: 'DIVISION', izquierda: $1, derecha: $3 }; }
    | expresion '==' expresion
        { $$ = { tipo: 'IGUALDAD', izquierda: $1, derecha: $3 }; }
    | expresion '!=' expresion
        { $$ = { tipo: 'DESIGUALDAD', izquierda: $1, derecha: $3 }; }
    | expresion '||' expresion
        { $$ = { tipo: 'OR', izquierda: $1, derecha: $3 }; }
    | NUMERO
        { $$ = { tipo: 'NUMERO', valor: Number($1) }; }
    | ID
        { $$ = { tipo: 'ID', nombre: $1 }; }
    | CADENA
        { $$ = { tipo: 'CADENA', valor: $1.slice(1, -1) }; }
    | VERDADERO
        { //console.log("Valor booleano:", true); 
        $$ = { tipo: 'BOOLEANO', valor: true }; }
    | FALSO
        { $$ = { tipo: 'BOOLEANO', valor: false }; }
    ;

    
tipo
    : TIPO_ENTERO
        { $$ = 'entero'; }
    | TIPO_CADENA
        { $$ = 'cadena'; }
    | TIPO_BOOLEANO
        { $$ = 'booleano'; }
    ;