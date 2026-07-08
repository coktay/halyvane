/**
 * Halyvane — Personalized Print-on-Demand Store (DEMO / work-in-progress).
 * Shared data: product catalog + category metadata.
 *
 * Product photos live in images/products/ (one JPEG per product, named after the
 * product slug). They are free-license stock photos (Openverse / CC / StockSnap).
 * samplePlaceholder() is kept only as the onerror fallback if a photo fails to load.
 */

/* ---- Sample placeholder generator (brand-styled "SAMPLE PRODUCT" card) ---- */
function samplePlaceholder(title) {
  const t = String(title || "Sample Product")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>" +
      "<rect width='600' height='600' fill='#fbf1f2'/>" +
      "<rect x='34' y='34' width='532' height='532' rx='26' fill='#fffafa' stroke='#e5989b' stroke-width='3' stroke-dasharray='14 12'/>" +
      "<g fill='none' stroke='#e5989b' stroke-width='9' stroke-linecap='round' stroke-linejoin='round'>" +
        "<rect x='219' y='196' width='162' height='124' rx='14'/>" +
        "<circle cx='260' cy='236' r='15'/>" +
        "<path d='M231 312 L286 262 L318 292 L346 270 L369 312'/>" +
      "</g>" +
      "<text x='300' y='392' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='27' font-weight='700' fill='#c47b86' letter-spacing='3'>SAMPLE PRODUCT</text>" +
      "<text x='300' y='430' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='20' fill='#8a8a8a'>" + t + "</text>" +
      "<text x='300' y='466' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='13' fill='#c3b3b6' letter-spacing='2'>PREVIEW • WORK IN PROGRESS</text>" +
    "</svg>";
  // Encode single quotes too, so the data-URI is safe inside single-quoted onerror handlers.
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27");
}

/* Every <img> onerror points here — but placeholders never fail, so it's just a safety net. */
function fallbackImage(_category) {
  return samplePlaceholder("Sample Product");
}

/* Category metadata — order as requested: ornament, tote bag, wall art, baby clothing, tshirt.
   Each tile uses a representative product photo from its own category. */
const CATEGORIES = [
  { key: "ornament",      label: "Ornaments",     icon: "fa-solid fa-snowflake",     image: "images/products/personalized-bauble-ornament.jpg" },
  { key: "tote-bag",      label: "Tote Bags",     icon: "fa-solid fa-bag-shopping",  image: "images/products/custom-canvas-tote-bag.jpg" },
  { key: "wall-art",      label: "Wall Art",      icon: "fa-solid fa-image",         image: "images/products/custom-canvas-print.jpg" },
  { key: "baby-clothing", label: "Baby Clothing", icon: "fa-solid fa-baby",          image: "images/products/baby-announcement-romper.jpg" },
  { key: "tshirt",        label: "T-Shirts",      icon: "fa-solid fa-shirt",         image: "images/products/custom-text-classic-tee.jpg" }
];

/* Reusable size / option sets */
const TEE_SIZES  = ["S", "M", "L", "XL", "XXL"];
const KID_SIZES  = ["2T", "3T", "4T", "5-6Y", "7-8Y"];
const BABY_SIZES = ["0-3M", "3-6M", "6-12M", "12-18M", "2T"];
const PRINT_SIZES = ['8"×10"', '12"×16"', '18"×24"', '24"×36"'];

/* Reusable color swatch sets */
const TEE_COLORS = [
  { name: "White", hex: "#ffffff" },
  { name: "Black", hex: "#1c1c1c" },
  { name: "Rose",  hex: "#e5989b" },
  { name: "Sand",  hex: "#d8c3a5" },
  { name: "Navy",  hex: "#2a3d5c" }
];
const BABY_COLORS = [
  { name: "White",  hex: "#ffffff" },
  { name: "Cream",  hex: "#efe6d5" },
  { name: "Rose",   hex: "#e5989b" },
  { name: "Sky",    hex: "#bcd4e6" },
  { name: "Mint",   hex: "#bfe3d0" }
];
const TOTE_COLORS = [
  { name: "Natural", hex: "#efe6d5" },
  { name: "Black",   hex: "#1c1c1c" },
  { name: "Rose",    hex: "#e5989b" }
];
const ORNAMENT_COLORS = [
  { name: "Red",    hex: "#c0392b" },
  { name: "Gold",   hex: "#d4af37" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "White",  hex: "#ffffff" }
];

/* Helper: attach the product photo + personalizable flag to each product.
   Photos live at images/products/<name-as-kebab-case>.jpg; if one is missing the
   <img> onerror handler falls back to the sample placeholder. */
function productImage(name) {
  return "images/products/" + String(name).toLowerCase().replace(/\s+/g, "-") + ".jpg";
}
function P(id, name, category, price, rating, reviews, colors, sizes, placeholder, description) {
  return { id, name, category, price, rating, reviews, colors, sizes, personalizable: true,
    placeholder, description, image: productImage(name) };
}

/* 30 personalizable POD products across the 5 categories (6 each). */
const PRODUCTS = [
  // --- ORNAMENTS (1–6) ---
  P(1,  "Personalized Bauble Ornament",   "ornament", 14.99, 4.9, 132, ORNAMENT_COLORS, null, "Name or year",
     "Glass bauble personalized with a name, date or short message. A keepsake for the tree."),
  P(2,  "Wooden Name Ornament",           "ornament", 12.99, 4.8, 88,  ORNAMENT_COLORS, null, "Name to engrave",
     "Laser-engraved wooden ornament with the name of your choice in elegant lettering."),
  P(3,  "Photo Keepsake Ornament",        "ornament", 16.99, 4.8, 96,  ORNAMENT_COLORS, null, "Caption text",
     "Add your favorite memory — we print it onto a glossy ornament with your custom caption."),
  P(4,  "First Christmas Ornament",       "ornament", 18.99, 4.9, 141, ORNAMENT_COLORS, null, "Name & year",
     "A sweet 'first Christmas' keepsake engraved with a name and the year. Gift-boxed."),
  P(5,  "Family Name Ornament",           "ornament", 19.99, 4.7, 74,  ORNAMENT_COLORS, null, "Family surname",
     "Celebrate the whole family with a personalized ornament featuring your surname and year."),
  P(6,  "Engraved Keepsake Ornament",     "ornament", 21.99, 4.9, 63,  ORNAMENT_COLORS, null, "Name & message",
     "A thoughtful engraved ornament with a name, date and a short message. Made with care."),

  // --- TOTE BAGS (7–12) ---
  P(7,  "Custom Canvas Tote Bag",         "tote-bag", 18.99, 4.8, 176, TOTE_COLORS, null, "Name or phrase",
     "Heavy-duty natural canvas tote printed with your text. Everyday-ready and reusable."),
  P(8,  "Monogram Tote Bag",              "tote-bag", 19.99, 4.7, 92,  TOTE_COLORS, null, "Your initials",
     "Understated monogram tote for the minimalist. Add up to three initials."),
  P(9,  "Quote Tote Bag",                 "tote-bag", 17.99, 4.6, 58,  TOTE_COLORS, null, "Your quote",
     "Carry your favorite words. Bold, clean typography printed across the front."),
  P(10, "Photo Tote Bag",                 "tote-bag", 22.99, 4.8, 84,  TOTE_COLORS, null, "Caption text",
     "Print a photo onto a durable tote with a personalized caption of your choice."),
  P(11, "Market Shopper Tote",            "tote-bag", 20.99, 4.7, 47,  TOTE_COLORS, null, "Name or word",
     "Roomy market tote with reinforced handles. Personalize it with a name or word."),
  P(12, "Mini Personalized Tote",         "tote-bag", 15.99, 4.6, 61,  TOTE_COLORS, null, "Name to print",
     "A cute mini tote for little ones or small errands. Add a name to make it theirs."),

  // --- WALL ART (13–18) ---
  P(13, "Custom Name Poster",             "wall-art", 21.99, 4.8, 134, null, PRINT_SIZES, "Name or title",
     "Museum-grade matte poster typeset with your name or title. Ships rolled in a tube."),
  P(14, "Personalized Family Print",      "wall-art", 26.99, 4.8, 87,  null, PRINT_SIZES, "Family surname",
     "A warm typographic family print featuring your surname and the year you became a family."),
  P(15, "Custom Quote Print",             "wall-art", 19.99, 4.6, 63,  null, PRINT_SIZES, "Your favorite quote",
     "Turn your favorite words into elegant wall art. Choose your size, we typeset it."),
  P(16, "Map Coordinates Print",          "wall-art", 32.99, 4.9, 96,  null, PRINT_SIZES, "Place or coordinates",
     "A minimalist print of a place that matters — where you met, married or grew up."),
  P(17, "Personalized Nursery Print",     "wall-art", 23.99, 4.8, 77,  null, PRINT_SIZES, "Baby's name",
     "Soft, sweet nursery art with baby's name and birth details. A treasured first gift."),
  P(18, "Custom Canvas Print",            "wall-art", 49.99, 4.9, 108, null, PRINT_SIZES, "Your text",
     "Gallery-wrapped canvas, ready to hang. Add a quote, family name or a meaningful date."),

  // --- BABY CLOTHING (19–24) ---
  P(19, "Personalized Baby Bodysuit",     "baby-clothing", 19.99, 4.9, 158, BABY_COLORS, BABY_SIZES, "Baby's name",
     "Soft, gentle-on-skin cotton bodysuit printed with baby's name. Snap closure."),
  P(20, "Custom Name Onesie",             "baby-clothing", 18.99, 4.8, 121, BABY_COLORS, BABY_SIZES, "Name to print",
     "A cozy onesie personalized with a name or a sweet phrase. Perfect newborn gift."),
  P(21, "Baby Announcement Romper",       "baby-clothing", 22.99, 4.8, 74,  BABY_COLORS, BABY_SIZES, "Announcement text",
     "Share the news in style with a personalized announcement romper. Made to order."),
  P(22, "Personalized Baby Bib",          "baby-clothing", 12.99, 4.7, 96,  BABY_COLORS, null,       "Name or word",
     "Absorbent, adjustable bib printed with baby's name. Because mealtimes get messy."),
  P(23, "Matching Sibling Baby Tee",      "baby-clothing", 17.99, 4.8, 63,  BABY_COLORS, BABY_SIZES, "Big/Little text",
     "Adorable matching baby tee for siblings. Add 'big sis', 'little bro' or any text."),
  P(24, "Custom Baby Hat",                "baby-clothing", 13.99, 4.6, 52,  BABY_COLORS, null,       "Name to print",
     "A snug knit-look baby hat personalized with a name. Keeps little heads cozy."),

  // --- T-SHIRTS (25–30) ---
  P(25, "Custom Text Classic Tee",        "tshirt", 24.99, 4.9, 214, TEE_COLORS, TEE_SIZES, "Your name or slogan",
     "Soft 100% ring-spun cotton tee printed with your own text. Pick a color and size."),
  P(26, "Couples Matching Tee",           "tshirt", 26.99, 4.8, 143, TEE_COLORS, TEE_SIZES, "e.g. Est. 2024",
     "A best-selling matching set. Add your names, an anniversary date or an inside joke."),
  P(27, "Kids Name Tee",                  "tshirt", 19.99, 4.9, 96,  TEE_COLORS, KID_SIZES, "Child's name",
     "Durable, gentle-on-skin kids tee. Print their name in bold playful lettering."),
  P(28, "Long-Sleeve Statement Tee",      "tshirt", 29.99, 4.6, 74,  TEE_COLORS, TEE_SIZES, "Your statement",
     "Relaxed long-sleeve tee for cooler days. Print a bold statement front and center."),
  P(29, "Photo Upload Tee",               "tshirt", 27.99, 4.7, 88,  TEE_COLORS, TEE_SIZES, "Caption text",
     "Put a photo on a tee with a personalized caption. A fun, giftable custom piece."),
  P(30, "Minimalist Quote Tee",           "tshirt", 23.99, 4.7, 65,  TEE_COLORS, TEE_SIZES, "Your quote",
     "Clean, minimalist tee for your favorite short quote. Understated and everyday-ready.")
];
