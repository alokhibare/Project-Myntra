const { db, initDb } = require('./db');

const initialProducts = [
  // MEN - TOPWEAR
  {
    title: 'Men Slim Fit Printed Casual Shirt',
    brand: 'Roadster',
    category: 'Men',
    gender: 'Men',
    price: 699,
    mrp: 1499,
    discount: 53,
    rating: 4.3,
    rating_count: 1420,
    image: 'imgs/mens/mens_section/men1.jpg',
    sizes: 'S,M,L,XL',
    tag: 'BESTSELLER',
    description: 'Cotton printed casual shirt with button-down collar, curved hem, and patch pocket.',
    specs: JSON.stringify({ "Fabric": "100% Cotton", "Fit": "Slim Fit", "Pattern": "Printed", "Sleeve": "Long Sleeves", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Men Pure Cotton Opaque Casual Shirt',
    brand: 'HIGHLANDER',
    category: 'Men',
    gender: 'Men',
    price: 799,
    mrp: 1999,
    discount: 60,
    rating: 4.1,
    rating_count: 890,
    image: 'imgs/mens/mens_section/men2.jpg',
    sizes: 'M,L,XL',
    tag: 'TRENDING',
    description: 'Breathable pure cotton casual shirt, perfect for everyday casual style and office wear.',
    specs: JSON.stringify({ "Fabric": "100% Pure Cotton", "Fit": "Regular Fit", "Pattern": "Solid", "Sleeve": "Long Sleeves", "Wash Care": "Hand Wash / Machine Wash" })
  },
  {
    title: 'Men Regular Fit Solid Casual Shirt',
    brand: 'WROGN',
    category: 'Men',
    gender: 'Men',
    price: 1299,
    mrp: 2599,
    discount: 50,
    rating: 4.5,
    rating_count: 2150,
    image: 'imgs/mens/mens_section/men3.jpg',
    sizes: 'S,M,L,XL',
    tag: 'MYNTRA SPECIAL',
    description: 'Stylish solid casual shirt designed with modern slim fit cut and mandarin collar.',
    specs: JSON.stringify({ "Fabric": "Cotton Blend", "Fit": "Modern Slim Fit", "Pattern": "Solid", "Sleeve": "Long Sleeves", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Men Printed Oversized Crew-Neck T-shirt',
    brand: 'HRX by Hrithik Roshan',
    category: 'Men',
    gender: 'Men',
    price: 499,
    mrp: 1199,
    discount: 58,
    rating: 4.4,
    rating_count: 3200,
    image: 'imgs/mens/mens_section/men4.jpg',
    sizes: 'S,M,L,XL,XXL',
    tag: 'BESTSELLER',
    description: 'Soft jersey knit cotton t-shirt with rapid-dry activewear moisture wicking technology.',
    specs: JSON.stringify({ "Fabric": "100% Jersey Cotton", "Fit": "Oversized Fit", "Pattern": "Graphic Print", "Sleeve": "Short Sleeves", "Wash Care": "Machine Wash Cold" })
  },
  {
    title: 'Men Solid Denim Trucker Jacket with Pockets',
    brand: 'Levi\'s',
    category: 'Men',
    gender: 'Men',
    price: 2499,
    mrp: 4999,
    discount: 50,
    rating: 4.7,
    rating_count: 980,
    image: 'imgs/mens/mens_section/men5.jpg',
    sizes: 'M,L,XL',
    tag: 'PREMIUM',
    description: 'Classic trucker denim jacket built from durable heavyweight denim with dual buttoned chest pockets.',
    specs: JSON.stringify({ "Fabric": "Heavyweight Denim", "Fit": "Regular Fit", "Pattern": "Solid Wash", "Sleeve": "Long Sleeves", "Wash Care": "Machine Wash Cold inside out" })
  },
  {
    title: 'Men Tapered Fit Stretchable Chinos',
    brand: 'U.S. Polo Assn.',
    category: 'Men',
    gender: 'Men',
    price: 1399,
    mrp: 2799,
    discount: 50,
    rating: 4.2,
    rating_count: 1120,
    image: 'imgs/mens/men1.jpg',
    sizes: '30,32,34,36',
    tag: 'ESSENTIAL',
    description: 'Versatile stretch cotton chinos with mid-rise waist and slant front pockets.',
    specs: JSON.stringify({ "Fabric": "98% Cotton 2% Elastane", "Fit": "Tapered Fit", "Pattern": "Solid", "Closure": "Button & Zip Fly", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Men Slim Fit Dark Wash Stretch Jeans',
    brand: 'Jack & Jones',
    category: 'Men',
    gender: 'Men',
    price: 1899,
    mrp: 3999,
    discount: 52,
    rating: 4.6,
    rating_count: 1780,
    image: 'imgs/mens/men2.jpg',
    sizes: '30,32,34,36',
    tag: 'TRENDING',
    description: 'Dark blue washed stretchable denim jeans with subtle whiskers effect.',
    specs: JSON.stringify({ "Fabric": "Cotton Stretch Denim", "Fit": "Slim Fit", "Pattern": "Washed", "Closure": "Zip Fly", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Men Striped Pure Cotton Polo Collar T-shirt',
    brand: 'Puma',
    category: 'Men',
    gender: 'Men',
    price: 899,
    mrp: 1999,
    discount: 55,
    rating: 4.4,
    rating_count: 2450,
    image: 'imgs/mens/men3.jpg',
    sizes: 'S,M,L,XL',
    tag: 'SPORTSWEAR',
    description: 'Breathable cotton pique polo t-shirt with classic ribbed collar and sleeve cuffs.',
    specs: JSON.stringify({ "Fabric": "Cotton Pique", "Fit": "Regular Fit", "Pattern": "Striped", "Sleeve": "Short Sleeves", "Wash Care": "Machine Wash" })
  },

  // WOMEN - ETHNIC & WESTERN WEAR
  {
    title: 'Women Printed A-Line Kurta Set with Dupatta',
    brand: 'Anouk',
    category: 'Women',
    gender: 'Women',
    price: 1199,
    mrp: 3499,
    discount: 65,
    rating: 4.5,
    rating_count: 4500,
    image: 'imgs/women/w1.jpg',
    sizes: 'S,M,L,XL',
    tag: 'BESTSELLER',
    description: 'Elegant ethnic floral printed A-line kurta set with matching trousers and organza dupatta.',
    specs: JSON.stringify({ "Fabric": "Pure Cotton", "Fit": "A-Line", "Pattern": "Floral Printed", "Neck": "V-Neck", "Wash Care": "Hand Wash Recommended" })
  },
  {
    title: 'Women Floral Print Tiered Fit & Flare Maxi Dress',
    brand: 'DressBerry',
    category: 'Women',
    gender: 'Women',
    price: 899,
    mrp: 2299,
    discount: 60,
    rating: 4.3,
    rating_count: 1890,
    image: 'imgs/women/w2.jpg',
    sizes: 'XS,S,M,L',
    tag: 'SUMMER SPECIAL',
    description: 'Vibrant summer tiered dress featuring soft puff sleeves, sweetheart neckline, and ruffle hem.',
    specs: JSON.stringify({ "Fabric": "Viscose Rayon", "Fit": "Fit & Flare", "Pattern": "Botanical Print", "Length": "Maxi Length", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Women High-Rise Clean Look Straight Jeans',
    brand: 'MANGO',
    category: 'Women',
    gender: 'Women',
    price: 1799,
    mrp: 3990,
    discount: 55,
    rating: 4.6,
    rating_count: 750,
    image: 'imgs/women/w3.jpg',
    sizes: '28,30,32',
    tag: 'NEW ARRIVAL',
    description: 'Classic high-waisted denim jeans featuring a clean indigo wash and full leg length.',
    specs: JSON.stringify({ "Fabric": "100% Rigid Denim Cotton", "Fit": "Straight Leg", "Rise": "High Rise", "Wash Care": "Machine Wash Cold" })
  },
  {
    title: 'Women Solid Open Front Layered Shrug Cardigan',
    brand: 'VERO MODA',
    category: 'Women',
    gender: 'Women',
    price: 999,
    mrp: 2499,
    discount: 60,
    rating: 4.2,
    rating_count: 640,
    image: 'imgs/women/w4.jpg',
    sizes: 'S,M,L',
    tag: 'POPULAR',
    description: 'Lightweight knit open front cardigan designed for effortless chic layering over dresses and tees.',
    specs: JSON.stringify({ "Fabric": "Acrylic Blend Knit", "Pattern": "Solid", "Length": "Mid-Thigh", "Wash Care": "Dry Clean / Soft Wash" })
  },
  {
    title: 'Women Intricate Embroidered Straight Kurta',
    brand: 'Biba',
    category: 'Women',
    gender: 'Women',
    price: 1499,
    mrp: 3299,
    discount: 54,
    rating: 4.7,
    rating_count: 3100,
    image: 'imgs/women/w5.jpg',
    sizes: 'S,M,L,XL,XXL',
    tag: 'ETHNIC ESSENTIAL',
    description: 'Crafted with delicate mirror work and zardozi embroidery along the round neckline and sleeve borders.',
    specs: JSON.stringify({ "Fabric": "Chanderi Silk Blend", "Fit": "Straight", "Pattern": "Embroidered", "Sleeve": "Three-Quarter", "Wash Care": "Dry Clean Only" })
  },

  // KIDS
  {
    title: 'Boys Graphic Printed T-Shirt & Denim Shorts Set',
    brand: 'Mothercare',
    category: 'Kids',
    gender: 'Boys',
    price: 549,
    mrp: 1299,
    discount: 57,
    rating: 4.6,
    rating_count: 940,
    image: 'imgs/kids/k1.jpg',
    sizes: '2-3Y,3-4Y,4-5Y,6-7Y',
    tag: 'COMBO DEAL',
    description: 'Comfy bio-washed cotton graphic tee with elasticated waistband denim shorts for active play.',
    specs: JSON.stringify({ "Fabric": "100% Bio-Wash Cotton", "Pattern": "Cartoon Print", "Occasion": "Casual Playwear", "Wash Care": "Machine Wash" })
  },
  {
    title: 'Girls Floral Print Party Fit and Flare Dress',
    brand: 'Gini & Jony',
    category: 'Kids',
    gender: 'Girls',
    price: 699,
    mrp: 1699,
    discount: 58,
    rating: 4.5,
    rating_count: 1230,
    image: 'imgs/kids/k2.jpg',
    sizes: '3-4Y,5-6Y,7-8Y',
    tag: 'PARTYWEAR',
    description: 'Adorable satin-lined party dress with floral organza overlay and back tie sash bow.',
    specs: JSON.stringify({ "Fabric": "Polyester Organza & Cotton Lining", "Closure": "Back Zipper", "Length": "Knee Length", "Wash Care": "Hand Wash" })
  },
  {
    title: 'Boys Colorblocked Fleece Hooded Sweatshirt',
    brand: 'U.S. Polo Assn. Kids',
    category: 'Kids',
    gender: 'Boys',
    price: 899,
    mrp: 1999,
    discount: 55,
    rating: 4.4,
    rating_count: 510,
    image: 'imgs/kids/k3.jpg',
    sizes: '6-7Y,8-9Y,10-11Y',
    tag: 'WINTER SPECIAL',
    description: 'Warm fleece-lined pullover sweatshirt with front kangaroo pocket and ribbed cuffs.',
    specs: JSON.stringify({ "Fabric": "80% Cotton 20% Polyester Fleece", "Sleeve": "Long Sleeves", "Wash Care": "Machine Wash Warm" })
  },

  // BEAUTY & PERSONAL CARE
  {
    title: 'Superstay Matte Liquid Lipstick Long Lasting 5ml',
    brand: 'Maybelline New York',
    category: 'Beauty',
    gender: 'Unisex',
    price: 499,
    mrp: 699,
    discount: 28,
    rating: 4.8,
    rating_count: 12400,
    image: 'imgs/beuty/b1.jpg',
    sizes: '5ml',
    tag: 'MUST HAVE',
    description: 'Intense matte color payload that lasts up to 16 hours without transfer or smudging.',
    specs: JSON.stringify({ "Finish": "Matte", "Coverage": "Full", "Form": "Liquid", "Shade": "Sensational Red", "Features": "Smudge-proof & Transfer-proof" })
  },
  {
    title: '10% Vitamin C Facial Serum for Radiant Skin 30ml',
    brand: 'Minimalist',
    category: 'Beauty',
    gender: 'Unisex',
    price: 599,
    mrp: 699,
    discount: 14,
    rating: 4.7,
    rating_count: 8700,
    image: 'imgs/beuty/b2.jpg',
    sizes: '30ml',
    tag: 'DERMA TESTED',
    description: 'Dermatologically tested facial serum formulated with stable 10% Ethyl Ascorbic Acid to fade spots and brighten tone.',
    specs: JSON.stringify({ "Key Ingredient": "Vitamin C + Centella Water", "Skin Type": "All Skin Types", "Volume": "30ml", "Free From": "Parabens, Sulphates, Fragrance" })
  },
  {
    title: 'Oil-Free Hydrating Gel Moisturizer with Aloe Vera 50g',
    brand: 'Plum',
    category: 'Beauty',
    gender: 'Unisex',
    price: 399,
    mrp: 550,
    discount: 27,
    rating: 4.4,
    rating_count: 3100,
    image: 'imgs/beuty/b3.webp',
    sizes: '50g',
    tag: 'VEGAN & CRUELTY FREE',
    description: 'Ultra-lightweight oil-free gel moisturizer enriched with Aloe Vera and Green Tea extracts to soothe acne-prone skin.',
    specs: JSON.stringify({ "Form": "Gel", "Skin Type": "Oily & Combination", "Volume": "50g", "Cruelty-Free": "Yes 100%" })
  },

  // HOME & LIVING
  {
    title: '100% Cotton 300 TC King Bedsheet with 2 Pillow Covers',
    brand: 'Story@Home',
    category: 'Home',
    gender: 'Unisex',
    price: 899,
    mrp: 2499,
    discount: 64,
    rating: 4.3,
    rating_count: 1560,
    image: 'imgs/home/h1.jpg',
    sizes: 'King Size',
    tag: 'HOME ESSENTIAL',
    description: 'Luxurious 300 thread count percale weave king size cotton bedsheet featuring fade-resistant reactive print.',
    specs: JSON.stringify({ "Fabric": "100% Cotton", "Thread Count": "300 TC", "Dimensions": "108 x 108 inches", "Care": "Machine Washable" })
  },
  {
    title: 'Set of 4 Textured Jacquard Cushion Covers 16x16 inch',
    brand: 'Home Centre',
    category: 'Home',
    gender: 'Unisex',
    price: 499,
    mrp: 1299,
    discount: 61,
    rating: 4.5,
    rating_count: 820,
    image: 'imgs/home/h2.webp',
    sizes: '16x16 inch',
    tag: 'POPULAR',
    description: 'Decorative textured woven cushion covers with hidden zipper closure, ideal for living room sofas.',
    specs: JSON.stringify({ "Material": "Jacquard Cotton Blend", "Dimensions": "40cm x 40cm", "Pack Count": "4 Covers", "Care": "Hand Wash" })
  },

  // GENZ TRENDS
  {
    title: 'Unisex Graphic Print Baggy Oversized Hoodie',
    brand: 'Streetwear Co',
    category: 'GenZ',
    gender: 'Unisex',
    price: 1199,
    mrp: 2999,
    discount: 60,
    rating: 4.7,
    rating_count: 2410,
    image: 'imgs/genz/g1.png',
    sizes: 'S,M,L,XL',
    tag: 'OVERSIZED TREND',
    description: 'Trending aesthetic oversized drop-shoulder hoodie crafted from 350 GSM heavyweight fleece knit.',
    specs: JSON.stringify({ "Fabric": "80% Cotton 20% Polyester Fleece", "Fit": "Baggy Oversized", "GSM": "350 GSM", "Wash Care": "Machine Wash Cold" })
  },
  {
    title: 'Relaxed Fit Stretch Cargo Joggers with 6 Utility Pockets',
    brand: 'SAYONARA',
    category: 'GenZ',
    gender: 'Unisex',
    price: 999,
    mrp: 2499,
    discount: 60,
    rating: 4.6,
    rating_count: 1840,
    image: 'imgs/genz/g2.jpg',
    sizes: 'S,M,L,XL',
    tag: 'STREET STYLE',
    description: 'Relaxed fit stretch cotton twill cargo pants featuring dual side flap pockets and elastic cuff ankles.',
    specs: JSON.stringify({ "Fabric": "97% Cotton 3% Spandex", "Fit": "Relaxed Cargo", "Pockets": "6 Utility Pockets", "Wash Care": "Machine Wash" })
  }
];

async function seed() {
  await initDb();
  
  db.serialize(() => {
    db.run(`ALTER TABLE products ADD COLUMN tag TEXT`, () => {});
    db.run(`ALTER TABLE products ADD COLUMN specs TEXT`, () => {});

    db.run(`DELETE FROM products`, (err) => {
      if (err) console.error('Error clearing products:', err);
    });

    const stmt = db.prepare(`
      INSERT INTO products (title, brand, category, gender, price, mrp, discount, rating, rating_count, image, sizes, tag, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of initialProducts) {
      stmt.run(
        p.title,
        p.brand,
        p.category,
        p.gender,
        p.price,
        p.mrp,
        p.discount,
        p.rating,
        p.rating_count,
        p.image,
        p.sizes,
        p.tag || '',
        p.description,
        p.specs || '{}'
      );
    }

    stmt.finalize(() => {
      console.log(`Successfully re-seeded ${initialProducts.length} OG Myntra products!`);
      db.close();
    });
  });
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
});
