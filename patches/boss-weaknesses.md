# Debilidades de jefes

La opción está desactivada por defecto. Al activarla, las ocho armas se
distribuyen como debilidades entre los Mavericks; la cabeza final de Sigma
recibe una selección independiente. Puede conservarse alguna debilidad original
por azar. Los daños normal y cargado se eligen entre 4 y 7 por jefe y seed.

La lógica requiere la debilidad asignada, salvo un jefe de inicio permitido con
Buster. La excepción no evita las llaves. El arma de Sigma se exige para llegar
al objetivo final, y todas las asignaciones aparecen en el spoiler.

Armadillo comparte una debilidad en sus dos perfiles. El arma nueva activa la
secuencia original de rotura y sigue siendo su debilidad después. El resto de
resistencias de la armadura se conserva. Las reacciones específicas de los otros
jefes también reconocen el arma asignada; los proyectiles mantienen su tipo.

Los ajustes son deterministas a partir de la seed. Los metadatos de ROM versión
2 identifican el rango de daños 4–7. Se pueden cargar ROMs anteriores de daño
3/4 para actualizar sus daños sin cambiar las asignaciones, o desactivar la
opción y restaurar los valores originales. No cambia la vida de los jefes.

Código: `js/boss-weakness.js`, `js/logic.js`, `js/randomizer.js` y `js/rom.js`.
La escritura comprueba los bytes originales, conserva los bancos espejo y
actualiza los checksums. Las modificaciones de combate desconocidas se rechazan.
