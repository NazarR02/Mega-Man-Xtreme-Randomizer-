# Mega Man Xtreme Randomizer

[English](README.md) | **Español**

Randomizer para **Mega Man Xtreme de Game Boy Color**, ejecutado en el navegador.
Mezcla ubicaciones, recompensas y debilidades para crear una ruta de progresión
reproducible. Debes aportar tu copia compatible del juego; no se incluyen ROMs
ni emuladores.

## Opciones de randomización

### Randomizar objetos — activado por defecto

Mezcla Heart Tanks, Sub Tanks y habilidades de Zero entre las ubicaciones de
objetos habilitadas. Shotokan también puede aparecer como recompensa rara.
Desactivado, estas recompensas conservan sus ubicaciones originales. Los objetos
incluidos en el equipo inicial se sustituyen por recompensas de relleno para
evitar entregarlos dos veces; esto también se aplica a las cápsulas de armadura.

### Randomizar armadura — activado por defecto

Añade el casco, la mejora del Buster, el cuerpo y las botas al conjunto de
recompensas que se mezclan. Desactivado, las piezas quedan en sus cápsulas
originales. Si también randomizas las recompensas de jefes, una pieza puede
aparecer al derrotar a un jefe y un arma en una ubicación de armadura habilitada.

### Randomizar recompensas de jefes — activado por defecto

Permite que las ocho armas de jefe entren en el conjunto general de recompensas.
Puedes encontrar armas fuera de los combates y recibir objetos o armaduras al
derrotar jefes. Las opciones de objetos y armadura determinan qué grupos de
ubicaciones participan en esa mezcla.

Desactivado, las armas **siguen mezclándose entre las recompensas de los jefes**:
no vuelven automáticamente a sus dueños originales. Los objetos y armaduras se
distribuyen por separado según sus propias opciones.

### Randomizar debilidades de jefes — desactivado por defecto

Asigna una debilidad a cada uno de los ocho Mavericks, usando una vez cada arma
entre esos jefes. La cabeza final de Sigma recibe una selección independiente.
Por azar, algunas debilidades pueden coincidir con las originales.

El daño normal y cargado se determina por jefe y seed entre **4 y 7**, incluidos
ambos extremos. El cargado nunca hace menos daño que el normal. No cambia la
vida de los jefes ni el daño del Buster.

En Chill Penguin, Spark Mandrill, Morph Moth, Magna Centipede y Flame Stag, la
reacción especial se asigna por separado a un **ataque normal o cargado de otra
arma**. Solo la variante seleccionada activa el efecto. Ese ataque hace 1 punto
de daño por impacto aceptado, aunque antes fuera inmune; la debilidad de daño
sigue haciendo 4–7, pero ya no activa la reacción especial.

Armored Armadillo comparte una debilidad antes y después de perder la armadura.
La rotura sigue vinculada a su debilidad de daño: Armadillo queda excluido de
las reacciones independientes para preservar esa transición. Eagle, Gator y
Sigma conservan sus respuestas genéricas. Las formas anteriores, el cuerpo,
las garras y las ventanas de vulnerabilidad de Sigma no cambian.

La lógica exige el arma débil asignada, salvo un jefe de inicio elegido por
seed que puede considerarse vencible con Buster. Esa excepción no evita sus
llaves. También exige el arma asignada a Sigma. Los ataques de reacción son
herramientas opcionales, no requisitos extra de progresión. Las reacciones con
carga necesitan la mejora del Buster. El spoiler indica debilidades de daño,
daños, armas y variantes de reacción, y el jefe de inicio con Buster.

Desactivado, las debilidades y daños quedan vanilla. Al regenerar una ROM
compatible que tenía esta opción activa, se restauran sus tablas originales.

### Bloquear acceso a jefes — desactivado por defecto

Añade ocho llaves de jefe al conjunto de progresión. Cada jefe requiere su
llave correspondiente para acceder al combate. Pueden aparecer junto a otras
recompensas; obtener una llave no implica derrotar primero a su propio jefe.

Desactivado, las ocho llaves se conceden automáticamente al empezar, incluso
con equipo inicial «Sin equipo». Las dos llaves de Sigma siguen formando parte
de la progresión independientemente de esta opción.

### Exigir progresión completa — desactivado por defecto

Exige que la lógica pueda alcanzar las **20 ubicaciones de objetos y las ocho
recompensas de jefes**, además del objetivo final. También comprueba las piezas
de armadura y llaves necesarias. Actívalo si quieres que todas las ubicaciones
estén disponibles en la ruta generada.

Desactivado, basta una ruta válida al objetivo final y pueden quedar ubicaciones
o jefes inaccesibles. Si las debilidades están randomizadas, el arma asignada a
Sigma sigue siendo necesaria para la lógica.

### Mostrar textos de ítems — desactivado por defecto

Muestra el nombre abreviado de la recompensa debajo de la barra de vida al
recogerla. La partida continúa mientras aparece el texto. Selecciona la variante
del parche con textos sin cambiar las ubicaciones de los objetos. El equipo
inicial se entrega sin mensajes.

### Generar spoiler log — activado por defecto

Descarga un TXT junto a la ROM generada. Incluye opciones, equipo inicial,
recompensas y esferas de progresión; si corresponde, también debilidades y daños.
Desactívalo si no quieres descargar esa información. Esta casilla no cambia el
resultado de la randomización.

## Equipo inicial

| Modo | Comportamiento |
|---|---|
| **Sin equipo** | No añade equipo. Las llaves automáticas siguen aplicándose si el bloqueo de jefes está desactivado. La lógica no repara este modo regalando objetos extra. |
| **Normal** — predeterminado | Selecciona dos recompensas iniciales de forma determinista por seed. Shotokan puede sustituir una de ellas muy rara vez. |
| **Generoso** | Selecciona cuatro recompensas, priorizando mejoras útiles para abrir rutas tempranas. Shotokan puede sustituir una rara vez. |
| **Personalizado** | Utiliza las piezas, armas y habilidades de Zero seleccionadas. Solo añade objetos si son necesarios para poder completar la seed. |

Normal y Generoso también pueden recibir objetos de seguridad de progresión
cuando sean necesarios. El equipo inicial se retira del conjunto de recompensas
y se reemplaza según corresponda. El spoiler distingue la selección inicial de
los objetos añadidos por seguridad.

La tabla de la ROM admite **ocho entradas después de comprimir los grupos
compatibles**. Todas las piezas de armadura, todas las habilidades de Zero y
todas las llaves pueden ocupar una entrada por grupo; las armas usan entradas
separadas. Ocho armas caben con el bloqueo de jefes activado, pero necesitan una
novena entrada para las llaves automáticas si está desactivado. Seleccionar todas
las armas, armaduras y habilidades supera el límite y se rechaza.

## Paletas y vistas previas

- **Pestañas de X y armas:** cada una conserva una paleta independiente. Las
  vistas normal y con armadura utilizan la paleta seleccionada.
- **Presets y valores manuales:** aplica un preset a la pestaña actual o edita
  sus ocho bytes hexadecimales, que representan cuatro colores.
- **Aleatorio — todas las paletas:** genera las nueve paletas con contraste
  controlado y colores relacionados. Oculta el resultado del preview como sorpresa.
- **Chaos — todas las paletas:** genera las nueve con colores más libres y
  extremos; también oculta el resultado del preview.
- **Guardar / Cargar paletas:** exporta o importa las nueve paletas en un TXT.
  Estos controles cambian colores, no la progresión.

## Seeds, descargas y controles del juego

Comparte el **código MXT2 completo**, no solo su nombre. Guarda las opciones,
equipo inicial y paletas necesarios para reproducir el resultado. Aplicar una
seed existente sustituye los ajustes actuales por su configuración guardada.

**Generar y descargar** crea la ROM configurada. **Descargar BPS** guarda un
parche de ese resultado; debe aplicarse exactamente al archivo elegido como
entrada. Si cargaste una ROM ya randomizada, el BPS descargado necesita esa
misma ROM, no una copia limpia. La aplicación aplica automáticamente los parches
base necesarios.

Dentro del juego, **Select** abre la pausa, **Start** muestra las llaves de
jefes y Sigma, y **B** vuelve al menú de armas. Los subtanques se ocultan solo
mientras se consulta la vista de llaves.

El **tracker opcional de BizHawk** se obtiene desde el botón de descarga. Extrae
el archivo y consulta [sus instrucciones](bizhawk/README.md). BizHawk no está
incluido. El botón de idioma alterna la interfaz entre español e inglés.

## Créditos y licencia

El código se distribuye bajo [MIT](LICENSE). Gracias a ElwinBran por el hack de
Hard/Xtreme desde el inicio, y a ElwinBran y Thirteen 1355 por la recarga de armas:

- [Enable Hard and Xtreme Mode from Start](https://www.romhacking.net/hacks/5020/)
- [Weapons Refill Upon Death](https://www.romhacking.net/hacks/4827/)

Mega Man Xtreme y las marcas, personajes y gráficos relacionados pertenecen a
Capcom. La licencia del código no concede titularidad sobre recursos del juego.
Debes aportar tu propia copia obtenida legalmente. No se incluyen ROMs ni partidas.

## Cómo ejecutar el generador

### En tu equipo

Desde la carpeta del proyecto, inicia un servidor HTTP estático:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000`, carga tu ROM compatible, elige las opciones y genera
el resultado. No requiere dependencias de Node ni compilación. Evita abrir
`index.html` con `file://`, porque puede bloquear la carga de los parches.

### En GitHub Pages

Sube **el contenido** de la carpeta del proyecto, conservando `js`, `css`,
`patches` y `bizhawk`. Configura Pages en los ajustes del repositorio para servir
la raíz de la rama elegida. Conserva `.nojekyll`, los dos BPS de la raíz y los
recursos compilados. Extrae el ZIP antes de subir sus archivos manualmente.
