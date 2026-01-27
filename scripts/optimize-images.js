// Carga modulos
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Configuración de carpetas
const INPUT_DIR = path.join(__dirname, "..", "assets");
const OUTPUT_DIR = path.join(__dirname, "..", "assets", "optimized");

// Extenciones permitidas
const exts = new Set([".jpg", ".jpeg", ".png"]);


// Funcion para crear carpeta de salida
async function ensureDir(dir) {
    await fs.promises.mkdir(dir, {recursive: true}); // utiliza recursive por si la carpeta ya existe, no mande error la funcion y continue
}

// Funcion que optimiza la imagen
async function optimizedOne(file) {
    // Construye ruta completa de entrada
    const inPath = path.join(INPUT_DIR, file);
    // Separa el nombre en partes, es decir, quita la extensión del archivo
    const outBase = path.parse(file).name;

    // Crea objeto sharp leyendo la imagen de entrada
    const image = sharp(inPath);

    //Webp
    // clone -> crea una copia del pipeline de procesamiento , resize -> redimenciona el ancho y si la imagen original es menor a 480px no la agranda
    // .webp -> convierte en formato webp entre mas alto mas calidad mas peso, mas bajo es menos peso y peor calidad
    // toFile -> escribe el resultado final en la ruta establecida
    // await asegura que no siga hasta que se termine de guardar
    const webpPath = path.join(OUTPUT_DIR, `${outBase}.webp`);
    await image.clone().resize({width: 480, withoutEnlargement: true}).webp({quality: 80}).toFile(webpPath);

    //AVIF
    // avif -> calidad 45 de avif
    const avifPath = path.join(OUTPUT_DIR, `${outBase}.avif`);
    await image.clone().resize({width: 480, withoutEnlargement: true}).avif({quality: 45}).toFile(avifPath);

    console.log(`OK: ${file} -> ${outBase}.{webp,avif}`);
}

async function main() {
    // Asegura que exista la ruta de salida antes de escribir
    await ensureDir(OUTPUT_DIR);
    // Lee el contenido de la carpeta y devuelve un arreglo con nombres de archivo
    const files = await fs.promises.readdir(INPUT_DIR);

    // Filtra imagenes para solo quedarse con imagenes validas
    // path.extsname(f) -> obtiene la extension, exts.has(...) -> verifica si está en el set permitido
    const targets = files.filter((f) => exts.has(path.extname(f).toLowerCase()));
    // Si no encontro imagenes muestra mensaje y termina.
    if (targets.length === 0) {
        console.log("No encontre imagenes .jpg / .png en /assets");
        return;
    }

    // Reconoce cada archivo valido
    for (const file of targets) {
        // Intenta optimizar, teniendo a await procesando uno por uno
        try {
            await optimizedOne(file);
        // Si algo falla (archivo corrupto, permisos, etc) reporta el error y sigue con el siguiente archivo
        } catch (e) {
            console.error(`Error con ${file}`, e.message);
        }
    }
}

main();