const SPRITE_WIDTH = 25;
const SPRITE_HEIGHT = 25;
const FALLBACK_OBJ0_COLORS = ["#9c9c8c", "#f7f7f7", "#0042f7", "#101010"];
const ARMORED_OPAQUE_BOUNDS = Object.freeze({ x: 13, y: 9, width: 117, height: 118 });
const ARMORED_SPRITE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIoAAACACAYAAADUHPECAAADeklEQVR4nO3dMWojMRiGYW0IbLXEuEuVk4UcwWfZM+RkW21nDKlS7baJ/AdeS79GmvA+ZZjY4+FDfGg0mlIkSZIkSZIkpfkx+wRmOBwO/2Z87+Vy2e31vpt9AtoHgyLEoAgxKEJ2W65uUZfX8/mc+vmPr2/ouPfTEzpuxdLriCLEoAgxKEIMipD72SeQLZp1rcvr8XhM/U5ajh/LH3Tc4fT06TesUG4dUYQYFCEGRYhBETK9JGWLyuzP36xEEn+ff139jZbjqPS2FuutC64jihCDIsSgCDEoQr7dzGymqLhG6MxsT+kNPuuqtI8suI4oQgyKEIMixKAI2XWZJUsKItEa154Z10h0Hq2lN3uNbwtHFCEGRYhBEWJQhOxmmQEtrrSo1qLiSpcF9CwfgLOwV39zmYGWZFCEGBQhBkXIpjOz2Vti4ZnT5/kzm6W0l14fANNuGBQhBkWIQRGyaUnqeTiLrl+NZmbplli1Wbf3M3dbyCrCjihCDIoQgyJk+kQOnYSLukxrb4k6S/ad4sxnfaLfHv0GelxLb3FEEWJQhBgUIQZFyJLP9dBSdjyNPY+eJY70uKhYZt5lj65lvT3pV+fxkSOKEIMixKAIMShCpi+FxDOYQXGld57rIhz9H30eKHt3pRl797dwRBFiUIQYFCEGRciwMttTXCOtxbX1mFL4i5joLf8IWSrR89uz3gPgiCLEoAgxKEIMipBha2Z7yix9hX0rumaWyt5mlKDXyDWz2pRBEWJQhBgUIcNmZqPCFL2MaIV93m8RFdeeB6+ia5LJh9S1KYMixKAIMShCdr2bAUXWzNKlB5nn8ZUVtgutOaIIMShCDIoQgyJkyd0MenYRiNQFtOfWe7QTAC24Nzw89uk7Vii3jihCDIoQgyLEoAiZvhd+9jKDGS9KGv27fEupdsOgCDEoQgyKkCV3M6DbZEWyZ3VrWxTyWjjz+/Iw9DtrjihCDIoQgyJk+t3j7AfSV9hqs5S+lz2RaxJ1pZGTcI4oQgyKEIMixKAISSk/dBIqe2ei1reI9pQ++hxS9ltPCcuspjMoQgyKEIMiZNjMLN2ZqOfz6HGjlw1Gv6vnfFuvU8vbRylHFCEGRYhBEWJQhDQVnXp2cqUtQEeX2RlLIXtkXQ9HFCEGRYhBEWJQhKSU2ZXM2J1o5esRscxqGIMixKAIMSiS8vwHHDRdiycl/0sAAAAASUVORK5CYII=";
let armoredSpriteImage;
let latestArmoredPreview;
const SPRITE_PIXELS = [
  "............33333........",
  "..........332211133......",
  ".........32222222113.....",
  "........3222221222333....",
  "........32221111123113...",
  "........31313333112313...",
  ".......32313113133123....",
  "......33333311313133.....",
  ".....322233311111113333..",
  ".....3112232331311331313.",
  "....311332322233333313113",
  "....311332322233333313113",
  "...3223113122222133233113",
  "..32221133211133112213313",
  "..3221111132222333222133.",
  "...32111113222213333333..",
  "....331113133311133......",
  ".....333313...312223.....",
  "....322233.....32223.....",
  "...3222223....3222223....",
  "..32222223....3222223....",
  "..33332233....33223333...",
  ".32222333.....323322223..",
  "322222223.....3222222223.",
  "33333333.......333333333.",
];

export function drawCharacterPreview(canvas, colors) {
  drawPreview(canvas, colors);
}

export function drawArmoredCharacterPreview(canvas, colors) {
  latestArmoredPreview = { canvas, colors: normalizeColors(colors) };
  if (armoredSpriteImage?.complete) {
    drawArmoredSprite(canvas, latestArmoredPreview.colors);
    return;
  }

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackdrop(context, canvas);

  if (!armoredSpriteImage) {
    armoredSpriteImage = new Image();
    armoredSpriteImage.addEventListener("load", () => {
      if (latestArmoredPreview) drawArmoredSprite(latestArmoredPreview.canvas, latestArmoredPreview.colors);
    }, { once: true });
    armoredSpriteImage.src = ARMORED_SPRITE_URL;
  }
}

function drawPreview(canvas, colors) {
  const context = canvas.getContext("2d");
  const palette = normalizeColors(colors);
  const scale = Math.max(1, Math.floor(Math.min((canvas.width - 36) / SPRITE_WIDTH, (canvas.height - 42) / SPRITE_HEIGHT)));
  const spriteWidth = SPRITE_WIDTH * scale;
  const spriteHeight = SPRITE_HEIGHT * scale;
  const originX = Math.floor((canvas.width - spriteWidth) / 2);
  const originY = Math.floor((canvas.height - spriteHeight) / 2) - 2;

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackdrop(context, canvas);
  drawGroundShadow(context, originX, originY, spriteWidth, spriteHeight, scale);

  for (let y = 0; y < SPRITE_HEIGHT; y += 1) {
    for (let x = 0; x < SPRITE_WIDTH; x += 1) {
      const pixel = SPRITE_PIXELS[y][x];
      if (pixel === ".") {
        continue;
      }

      const colorIndex = Number(pixel);
      context.fillStyle = palette[colorIndex] ?? FALLBACK_OBJ0_COLORS[colorIndex] ?? "#ff00ff";
      context.fillRect(originX + x * scale, originY + y * scale, scale, scale);
    }
  }
}

function drawArmoredSprite(canvas, palette) {
  const context = canvas.getContext("2d");
  const source = document.createElement("canvas");
  source.width = armoredSpriteImage.naturalWidth;
  source.height = armoredSpriteImage.naturalHeight;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(armoredSpriteImage, 0, 0);
  const imageData = sourceContext.getImageData(0, 0, source.width, source.height);
  const mappedColors = palette.slice(1).map(cssHexToRgb);

  for (let index = 0; index < imageData.data.length; index += 4) {
    if (imageData.data[index + 3] === 0) continue;
    const red = imageData.data[index];
    const colorIndex = red > 240 ? 0 : red < 20 ? 2 : 1;
    const [mappedRed, mappedGreen, mappedBlue] = mappedColors[colorIndex];
    imageData.data[index] = mappedRed;
    imageData.data[index + 1] = mappedGreen;
    imageData.data[index + 2] = mappedBlue;
  }
  sourceContext.putImageData(imageData, 0, 0);

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBackdrop(context, canvas);
  const normalScale = Math.max(1, Math.floor(Math.min((canvas.width - 36) / SPRITE_WIDTH, (canvas.height - 42) / SPRITE_HEIGHT)));
  const targetSize = SPRITE_HEIGHT * normalScale;
  const scale = Math.min(targetSize / ARMORED_OPAQUE_BOUNDS.width, targetSize / ARMORED_OPAQUE_BOUNDS.height);
  const width = source.width * scale;
  const height = source.height * scale;
  const visibleWidth = ARMORED_OPAQUE_BOUNDS.width * scale;
  const visibleHeight = ARMORED_OPAQUE_BOUNDS.height * scale;
  const originX = (canvas.width - visibleWidth) / 2 - ARMORED_OPAQUE_BOUNDS.x * scale;
  const originY = (canvas.height - visibleHeight) / 2 - ARMORED_OPAQUE_BOUNDS.y * scale - 2;
  context.drawImage(source, Math.round(originX), Math.round(originY), width, height);
}

function cssHexToRgb(color) {
  const clean = String(color).replace("#", "");
  return [0, 2, 4].map((index) => Number.parseInt(clean.slice(index, index + 2), 16) || 0);
}

function drawBackdrop(context, canvas) {
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#172033");
  gradient.addColorStop(1, "#101928");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.055)";
  for (let x = 0; x < canvas.width; x += 18) {
    context.fillRect(x, 0, 1, canvas.height);
  }

  for (let y = 0; y < canvas.height; y += 18) {
    context.fillRect(0, y, canvas.width, 1);
  }
}

function drawGroundShadow(context, originX, originY, spriteWidth, spriteHeight, scale) {
  context.fillStyle = "rgba(0, 0, 0, 0.3)";
  context.fillRect(originX + scale * 2, originY + spriteHeight - scale, spriteWidth - scale * 4, scale);
}

function normalizeColors(colors) {
  const normalized = Array.isArray(colors) ? [...colors] : [];
  while (normalized.length < FALLBACK_OBJ0_COLORS.length) {
    normalized.push(FALLBACK_OBJ0_COLORS[normalized.length]);
  }
  return normalized.slice(0, FALLBACK_OBJ0_COLORS.length);
}
