import { rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assets = [
  { file: "public/images/marketing1.jpg", width: 2400, type: "jpeg" },
  { file: "public/images/marketing2.jpg", width: 1800, type: "jpeg" },
  { file: "public/images/marketing3.jpg", width: 1800, type: "jpeg" },
  { file: "public/images/accessories.png", width: 1600, type: "png" },
  { file: "public/images/sutdy.png", width: 1600, type: "png" },
  { file: "public/team1.png", width: 896, type: "png" },
  { file: "public/logo-main.png", width: 1024, type: "png" },
];

for (const asset of assets) {
  const input = path.resolve(asset.file);
  const output = `${input}.optimized`;
  const before = (await stat(input)).size;
  let pipeline = sharp(input).rotate().resize({
    width: asset.width,
    withoutEnlargement: true,
  });

  pipeline =
    asset.type === "jpeg"
      ? pipeline.jpeg({ quality: 82, mozjpeg: true })
      : pipeline.png({ compressionLevel: 9, effort: 10 });

  await pipeline.toFile(output);
  const after = (await stat(output)).size;

  if (after < before) {
    await rename(output, input);
    console.log(`${asset.file}: ${before} -> ${after}`);
  } else {
    await unlink(output);
    console.log(`${asset.file}: kept original (${before})`);
  }
}
