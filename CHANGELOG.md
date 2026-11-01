# Changelog / Historial

## 1.2.2 — 2026-11-01

- Boss reward screens now name the actual rewards granted by each Maverick.
  Supports one or two rewards and an empty-reward message, using native text.
  The original weapon illustration remains unchanged.
- Works with pickup text enabled or disabled; updates both ROM bank aliases
  and regenerates labels when rerolling an existing seed ROM.
- Las pantallas de jefes muestran los nombres de sus recompensas reales.
  Admiten una o dos recompensas y un mensaje si no hay ninguna. Se conserva
  la ilustración original del arma. Funciona con o sin textos al recoger objetos.

## 1.2.1 — 2026-10-31

### English

- Chill Penguin domes always receive a seeded weapon vulnerability, independently
  of boss weakness settings. Normal and charged attacks of that weapon deal 4
  damage. The spoiler identifies the weapon.
- Progression logic requires the selected weapon to collect the dome's reward,
  including shuffled progression items. Seed replay and ROM rerolls preserve it.
- Fixed Starting Gear overwriting two register-save instructions, which crashed
  new Xtreme games. The dispatch stub now sits beyond all eight inventory slots.
- Removed automatic upgrades of experimental pause-menu ROMs. The `patches/`
  directory contains optional documentation and native sources.

### Español

- Las cúpulas de Chill Penguin siempre reciben una vulnerabilidad por seed,
  independiente de las opciones de jefes. El ataque normal y el cargado del arma
  elegida hacen 4 de daño. El spoiler identifica el arma.
- La lógica exige esa arma para recoger la recompensa de la cúpula, incluidos
  objetos de progresión randomizados. Las semillas y la regeneración la conservan.
- Corregida la tabla de equipo inicial que sobrescribía dos instrucciones y
  bloqueaba las partidas nuevas en Xtreme. La rutina queda fuera de las ocho
  entradas del inventario.
- Retirada la actualización automática de ROMs experimentales del menú de pausa.
  La carpeta `patches/` contiene documentación y fuentes nativas opcionales.
