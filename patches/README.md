# Parches y recursos del generador

- `../randomizer patch v1.2.bps`: base de 2 MiB con submenú de llaves y corrección
  de visibilidad de subtanques, sin textos de objetos activados.
- `../randomizer patch v1.2 - item texts.bps`: variante con textos de objetos.
- `randomizer-v1.2-legacy.bps`: parche anterior para compatibilidad de actualización.
- `key-menu-bank.bin`: banco compilado del submenú, requerido al actualizar ROMs.
  Es un recurso del parche y no una ROM ejecutable completa.
- `key-menu-manifest.json`: tamaños, CRCs, hashes y procedencia de sprites.
- `source/`: fuentes de ensamblador y sus pequeños recursos gráficos.

Los dos BPS de la raíz se aplican a la misma ROM limpia compatible de 1 MiB.
El generador comprueba su CRC antes de aplicarlos: el navegador los carga directamente y no necesita herramientas de
ensamblado para funcionar.

Las tablas de recompensas, equipo inicial, debilidades, daños y paletas se
escriben por seed desde JavaScript; no están fijadas en los BPS base. El BPS
descargado por el usuario sí incluye la configuración de su seed y requiere
exactamente el archivo que seleccionó como entrada.

