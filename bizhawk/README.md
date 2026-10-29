# Tracker opcional para BizHawk

1. Extrae `bizhawk.zip` en una carpeta con permiso de escritura.
2. Abre `tracker.html` en un navegador.
3. Abre una ROM generada con este proyecto en tu instalación de BizHawk.
4. Ejecuta `mxt_randomizer_tracker.lua` desde la consola Lua de BizHawk.

El script lee el inventario del juego y actualiza `state.js`; el navegador
muestra el equipo, las llaves y las notificaciones. El tracker se resincroniza
al cargar estados. No incluye BizHawk, ROMs ni partidas guardadas.
