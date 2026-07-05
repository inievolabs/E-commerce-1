import heroHomeImg from "@/assets/hero-home.jpg";

export type Category = "bags" | "luggage" | "slippers" | "wallets";
export type Gender = "women" | "men";

export type SizeGuideRow = { eu: string; uk: string; us: string; cm: string };
export type TrustBadge = { icon: string; label: string };

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  gender: Gender;
  color: string;
  colorHex: string;
  images: string[];
  description: string;
  materials: string;
  isNew?: boolean;
  isBestseller?: boolean;
  sizes?: string[];
  taxIncluded?: boolean;
  taxLabel?: string;
  shippingInfo?: string;
  returnsInfo?: string;
  sizeGuide?: SizeGuideRow[];
  sizeGuideTitle?: string;
  showSizeGuide?: boolean;
  trustBadges?: TrustBadge[];
  stock?: number;
}

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Local mock product photos — generated via `node scripts/generate-product-images.mjs` */
export const productImg = (id: string, index: 1 | 2 = 1) => `/products/${id}-${index}.jpg`;

export const products: Product[] = [
  // Women's bags
  {
    id: "w-bag-01",
    name: "Marais Shoulder Bag",
    price: 1480,
    category: "bags",
    gender: "women",
    color: "Camel",
    colorHex: "#b08458",
    images: [productImg("w-bag-01", 1), productImg("w-bag-01", 2)],
    description:
      "A softly structured shoulder bag in supple Italian leather, finished with hand-burnished edges.",
    materials: "Full-grain calfskin, brass hardware, suede lining.",
    isNew: true,
    isBestseller: true,
  },
  {
    id: "w-bag-02",
    name: "Lune Mini Tote",
    price: 1120,
    category: "bags",
    gender: "women",
    color: "Ivory",
    colorHex: "#efe7d8",
    images: [productImg("w-bag-02", 1), productImg("w-bag-02", 2)],
    description:
      "A miniature tote with subtle pleating, designed for the considered essentials of an unhurried day.",
    materials: "Smooth nappa leather, lambskin lining.",
    isNew: true,
  },
  {
    id: "w-bag-03",
    name: "Rive Hobo",
    price: 1690,
    category: "bags",
    gender: "women",
    color: "Noir",
    colorHex: "#1a1a1a",
    images: [productImg("w-bag-03", 1), productImg("w-bag-03", 2)],
    description:
      "Slouched silhouette with a single curved handle, an everyday hobo refined to its essential form.",
    materials: "Pebbled calfskin, woven cotton lining.",
    isBestseller: true,
  },
  {
    id: "w-bag-04",
    name: "Sienna Crossbody",
    price: 980,
    category: "bags",
    gender: "women",
    color: "Burgundy",
    colorHex: "#5c1a1b",
    images: [productImg("w-bag-04", 1), productImg("w-bag-04", 2)],
    description: "Compact crossbody with adjustable strap and a sculpted magnetic flap closure.",
    materials: "Polished calfskin, palladium hardware.",
  },
  // Women's luggage
  {
    id: "w-lug-01",
    name: "Voyage Weekender",
    price: 2480,
    category: "luggage",
    gender: "women",
    color: "Cognac",
    colorHex: "#8b4a2a",
    images: [productImg("w-lug-01", 1), productImg("w-lug-01", 2)],
    description:
      "A spacious weekender hand-stitched in the Tuscan tradition, made for slow travel.",
    materials: "Vegetable-tanned leather, solid brass feet.",
    isBestseller: true,
  },
  {
    id: "w-lug-02",
    name: "Aerea Cabin Trunk",
    price: 3290,
    category: "luggage",
    gender: "women",
    color: "Ivory",
    colorHex: "#efe7d8",
    images: [productImg("w-lug-02", 1), productImg("w-lug-02", 2)],
    description:
      "Cabin-sized trunk in featherweight aluminum with leather corners and a silent four-wheel system.",
    materials: "Anodised aluminium, calfskin trim.",
    isNew: true,
  },
  // Women's slippers
  {
    id: "w-slp-01",
    name: "Mira Mule",
    price: 590,
    category: "slippers",
    gender: "women",
    color: "Noir",
    colorHex: "#1a1a1a",
    images: [productImg("w-slp-01", 1), productImg("w-slp-01", 2)],
    description: "A relaxed leather mule with a softly squared toe and tonal stitching.",
    materials: "Nappa leather upper, leather sole.",
    isNew: true,
  },
  {
    id: "w-slp-02",
    name: "Velvet Lounge Slipper",
    price: 480,
    category: "slippers",
    gender: "women",
    color: "Burgundy",
    colorHex: "#5c1a1b",
    images: [productImg("w-slp-02", 1), productImg("w-slp-02", 2)],
    description:
      "Plush velvet slipper with embroidered emblem — refined comfort for evenings at home.",
    materials: "Silk velvet, leather sole, shearling lining.",
  },
  {
    id: "w-slp-03",
    name: "Sole Flat",
    price: 540,
    category: "slippers",
    gender: "women",
    color: "Camel",
    colorHex: "#b08458",
    images: [productImg("w-slp-03", 1), productImg("w-slp-03", 2)],
    description:
      "Unstructured leather flat that folds gently with the foot — an everyday companion.",
    materials: "Calfskin upper, padded leather insole.",
    isBestseller: true,
  },
  // Men's bags
  {
    id: "m-bag-01",
    name: "Atlas Briefcase",
    price: 1890,
    category: "bags",
    gender: "men",
    color: "Noir",
    colorHex: "#1a1a1a",
    images: [productImg("m-bag-01", 1), productImg("m-bag-01", 2)],
    description:
      "An architectural briefcase with hand-rolled handles and a discreet trolley sleeve.",
    materials: "Saffiano leather, palladium hardware.",
    isBestseller: true,
  },
  {
    id: "m-bag-02",
    name: "Holm Messenger",
    price: 1340,
    category: "bags",
    gender: "men",
    color: "Cognac",
    colorHex: "#8b4a2a",
    images: [productImg("m-bag-02", 1), productImg("m-bag-02", 2)],
    description:
      "Soft-construction messenger in vegetable-tanned leather that develops a unique patina over time.",
    materials: "Vegetable-tanned leather, canvas lining.",
    isNew: true,
  },
  {
    id: "m-bag-03",
    name: "Nord Duffel",
    price: 1620,
    category: "bags",
    gender: "men",
    color: "Olive",
    colorHex: "#4b4a30",
    images: [productImg("m-bag-03", 1), productImg("m-bag-03", 2)],
    description: "A weekend duffel cut from waxed canvas and trimmed in matte leather.",
    materials: "Waxed cotton canvas, bridle leather trim.",
  },
  // Men's wallets
  {
    id: "m-wal-01",
    name: "Bifold Wallet",
    price: 380,
    category: "wallets",
    gender: "men",
    color: "Noir",
    colorHex: "#1a1a1a",
    images: [productImg("m-wal-01", 1), productImg("m-wal-01", 2)],
    description:
      "A slim bifold with six card slots and a full-length note compartment, edge-painted by hand.",
    materials: "Box calf leather, lambskin lining.",
    isBestseller: true,
  },
  {
    id: "m-wal-02",
    name: "Cardholder",
    price: 240,
    category: "wallets",
    gender: "men",
    color: "Cognac",
    colorHex: "#8b4a2a",
    images: [productImg("m-wal-02", 1), productImg("m-wal-02", 2)],
    description:
      "Minimalist cardholder with four slots and a central pocket, debossed with our quiet monogram.",
    materials: "Vegetable-tanned calfskin.",
    isNew: true,
  },
  {
    id: "m-wal-03",
    name: "Long Wallet",
    price: 520,
    category: "wallets",
    gender: "men",
    color: "Burgundy",
    colorHex: "#5c1a1b",
    images: [productImg("m-wal-03", 1), productImg("m-wal-03", 2)],
    description:
      "A travel-length wallet with twelve card slots, a zipped coin pocket, and a passport sleeve.",
    materials: "Saffiano leather, satin lining.",
  },
  {
    id: "m-wal-04",
    name: "Zip Pouch",
    price: 460,
    category: "wallets",
    gender: "men",
    color: "Ivory",
    colorHex: "#efe7d8",
    images: [productImg("m-wal-04", 1), productImg("m-wal-04", 2)],
    description:
      "A clean-lined zip pouch for documents, devices, and the quiet ceremony of arrival.",
    materials: "Smooth calfskin, brass zip.",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const editorialImages = [
  img("photo-1490481651871-ab68de25d43d", 900),
  img("photo-1483985988355-763728e1935b", 900),
  img("photo-1558769132-cb1aea458c5e", 900),
  img("photo-1469334031218-e382a71b716b", 900),
  img("photo-1485231183945-fffde7cc051e", 900),
  img("photo-1509631179647-0177331693ae", 900),
];

export const heroImage = heroHomeImg;
export const womenBannerImage = "https://res.cloudinary.com/dtwejrh45/image/upload/v1783216169/ChatGPT_Image_Jul_5_2026_07_47_21_AM_fo1kbk.png";
export const menBannerImage = "https://res.cloudinary.com/dtwejrh45/image/upload/v1783216139/ChatGPT_Image_Jul_5_2026_07_47_28_AM_lpw8xd.png";
export const craftImage = heroHomeImg;
