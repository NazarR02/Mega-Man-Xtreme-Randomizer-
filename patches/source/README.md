# Fuentes del submenú nativo

`key-bar.asm` contiene el submenú de llaves e incluye `reward-message.asm`,
con los textos opcionales de objetos. Los dos BIN pequeños son los recursos
que las directivas INCBIN incorporan al banco compilado.

Para ensamblar este banco con RGBDS, crea una carpeta local `build` y ejecuta
desde la raíz del proyecto:

```sh
rgbasm -I patches/source/ -o build/key-menu.o patches/source/key-bar.asm
rgblink -p 255 -o build/key-menu-banks.bin build/key-menu.o
```

Esto ensambla el banco; no genera por sí solo los BPS base completos. El
generador web utiliza los BPS y el banco ya publicados en esta copia. RGBDS,
emuladores, ROMs y salidas de compilación no se incluyen en el repositorio.
