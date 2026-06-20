export type Category = "bags" | "luggage" | "slippers" | "wallets";
export type Gender = "women" | "men";

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
}

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

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
    images: [img("photo-1584917865442-de89df76afd3"), img("photo-1591561954557-26941169b49e")],
    description: "A softly structured shoulder bag in supple Italian leather, finished with hand-burnished edges.",
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
    images: [img("photo-1548036328-c9fa89d128fa"), img("photo-1566150905458-1bf1fc113f0d")],
    description: "A miniature tote with subtle pleating, designed for the considered essentials of an unhurried day.",
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
    images: [img("photo-1564222256577-45e728f2c0a5"), img("photo-1590739225497-56c1ef803296")],
    description: "Slouched silhouette with a single curved handle, an everyday hobo refined to its essential form.",
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
    images: [img("photo-1559563458-527698bf5295"), img("photo-1606522754091-a3bbf9ad4cb3")],
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
    images: [img("photo-1553062407-98eeb64c6a62"), img("photo-1572276596237-5db2c3e16c5d")],
    description: "A spacious weekender hand-stitched in the Tuscan tradition, made for slow travel.",
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
    images: [img("photo-1581553680321-4fffae59fccd"), img("photo-1565026057447-bc90a3dceb87")],
    description: "Cabin-sized trunk in featherweight aluminum with leather corners and a silent four-wheel system.",
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
    images: [img("photo-1543163521-1bf539c55dd2"), img("photo-1606107557195-0e29a4b5b4aa")],
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
    images: [img("photo-1535043934128-cf0b28d52f95"), img("photo-1518049362265-d5b2a6467637")],
    description: "Plush velvet slipper with embroidered emblem — refined comfort for evenings at home.",
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
    images: [img("photo-1603487742131-4160ec999306"), img("photo-1581101767113-1677fc2bee76")],
    description: "Unstructured leather flat that folds gently with the foot — an everyday companion.",
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
    images: [img("photo-1547949003-9792a18a2601"), img("photo-1591348122449-02525d70379b")],
    description: "An architectural briefcase with hand-rolled handles and a discreet trolley sleeve.",
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
    images: [img("photo-1590739225497-56c1ef803296"), img("photo-1622560480605-d83c853bc5c3")],
    description: "Soft-construction messenger in vegetable-tanned leather that develops a unique patina over time.",
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
    images: [img("photo-1547949003-9792a18a2601"), img("photo-1553062407-98eeb64c6a62")],
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
    images: [img("photo-1627123424574-724758594e93"), img("photo-1604644401890-0bd678c83788")],
    description: "A slim bifold with six card slots and a full-length note compartment, edge-painted by hand.",
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
    images: [img("photo-1620109893353-ac5fb43c1a8a"), img("photo-1606293926249-ed22f747f5dc")],
    description: "Minimalist cardholder with four slots and a central pocket, debossed with our quiet monogram.",
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
    images: [img("photo-1604644401890-0bd678c83788"), img("photo-1627123424574-724758594e93")],
    description: "A travel-length wallet with twelve card slots, a zipped coin pocket, and a passport sleeve.",
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
    images: [img("photo-1606293926249-ed22f747f5dc"), img("photo-1620109893353-ac5fb43c1a8a")],
    description: "A clean-lined zip pouch for documents, devices, and the quiet ceremony of arrival.",
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

export const heroImage = img("photo-1490481651871-ab68de25d43d", 2000);
export const womenBannerImage = img("photo-1581338834647-b0fb40704e21", 1400);
export const menBannerImage = img("photo-1617137968427-85924c800a22", 1400);
export const craftImage = img("photo-1528605248644-14dd04022da1", 1400);
