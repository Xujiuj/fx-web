import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const mediaDirectory = path.join(projectRoot, "public", "media");
const outputDirectory = path.join(mediaDirectory, "optimized");

const requestedWidths = [480, 768, 1280, 1920];

const sources = [
  { file: "fengxing-hero-accounting.png", profile: "hero" },
  { file: "fengxing-hero-management.png", profile: "hero" },
  { file: "path-carbon-warm.jpg", profile: "content" }
];

const formats = {
  avif: {
    extension: "avif",
    encode: (image, profile) =>
      image.avif({ quality: profile === "hero" ? 52 : 55, effort: 6 }),
  },
  webp: {
    extension: "webp",
    encode: (image, profile) =>
      image.webp({
        quality: profile === "hero" ? 72 : 76,
        effort: 5,
        smartSubsample: true,
      }),
  },
  jpeg: {
    extension: "jpg",
    encode: (image, profile) =>
      image.jpeg({
        quality: profile === "hero" ? 76 : 80,
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      }),
  },
};

function outputUrl(relativePath) {
  return `/media/optimized/${relativePath.split(path.sep).join("/")}`;
}

async function optimizeSource(source) {
  const sourcePath = path.join(mediaDirectory, source.file);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot determine dimensions for ${source.file}`);
  }

  const baseName = path.parse(source.file).name;
  const destination = path.join(outputDirectory, baseName);
  await mkdir(destination, { recursive: true });

  // Keep requested responsive widths, then cap the largest candidate at the
  // source width so wide screens never require an enlarged 1920px export.
  const widths = [
    ...requestedWidths.filter((width) => width < metadata.width),
    metadata.width,
  ].filter((width, index, values) => values.indexOf(width) === index);

  const variants = [];

  for (const width of widths) {
    for (const [format, options] of Object.entries(formats)) {
      const fileName = `${baseName}-${width}.${options.extension}`;
      const relativePath = path.join(baseName, fileName);
      const destinationPath = path.join(outputDirectory, relativePath);
      const pipeline = sharp(sourcePath)
        .rotate()
        .resize({
          width,
          fit: "inside",
          withoutEnlargement: true,
        });

      await options.encode(pipeline, source.profile).toFile(destinationPath);
      const outputMetadata = await sharp(destinationPath).metadata();
      const outputStats = await stat(destinationPath);

      variants.push({
        format,
        width: outputMetadata.width,
        height: outputMetadata.height,
        bytes: outputStats.size,
        src: outputUrl(relativePath),
      });
    }
  }

  return {
    source: `/media/${source.file}`,
    sourceWidth: metadata.width,
    sourceHeight: metadata.height,
    profile: source.profile,
    variants,
  };
}

await mkdir(outputDirectory, { recursive: true });

const images = {};

for (const source of sources) {
  const optimized = await optimizeSource(source);
  images[path.parse(source.file).name] = optimized;

  const largest = optimized.variants.at(-1);
  console.log(
    `${source.file}: ${optimized.variants.length} variants, capped at ${largest.width}px`,
  );
}

const manifest = {
  generatedBy: "scripts/optimize-media.mjs",
  requestedWidths,
  images,
};

await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(`Manifest: ${outputUrl("manifest.json")}`);
