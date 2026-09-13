export const generateRetroIdenticon = (seedStr: string, size: number = 256): string => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to a 32-bit integer array for deterministic randomness
  const r = () => {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };

  // Generate a color palette based on the hash
  const hue1 = Math.floor(r() * 360);
  const hue2 = (hue1 + 180) % 360; // Complementary
  const bg = `hsl(${hue1}, 20%, 15%)`;
  const fg1 = `hsl(${hue1}, 80%, 60%)`;
  const fg2 = `hsl(${hue2}, 80%, 60%)`;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // 8x8 grid (mirrored horizontally to make it look like a 16-bit space invader / avatar)
  const grid = 8;
  const pixelSize = size / grid;

  // We only generate 4 columns and mirror them to get 8 columns
  for (let x = 0; x < grid / 2; x++) {
    for (let y = 0; y < grid; y++) {
      const isFilled = r() > 0.5;
      if (isFilled) {
        ctx.fillStyle = r() > 0.5 ? fg1 : fg2;
        
        // Left side
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        // Right side (mirrored)
        ctx.fillRect((grid - 1 - x) * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  return canvas.toDataURL("image/png");
};
