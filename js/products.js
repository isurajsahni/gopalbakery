/*
  ==========================================================================
  SHOP SETTINGS & PRODUCTS  –  edit this file to change what the shop sells
  ==========================================================================

  ⚠️  The prices below are SAMPLE prices. Replace them with your real prices
      before the website goes live.

  Each product has:
    id          short unique name with no spaces (the cart uses it)
    name        product name shown on the card
    category    one of the keys in SHOP_CATEGORIES below
    size        weight or number of pieces, shown under the name
    price       price in rupees – a plain number, no ₹ sign or commas
    image       picture file inside assets/images/
    fit         "cover"   = photo fills the frame (normal photos)
                "contain" = whole picture is shown (cut-out pictures)
    description one short line about the product

  To add a product: copy one { ... } block, paste it, and change the details.
  To remove a product: delete its { ... } block (and the comma after it).
*/

// WhatsApp number that receives orders: country code (91) + number, digits only
const SHOP_WHATSAPP_NUMBER = '919988340395';

// Shop name used at the top of the WhatsApp order message
const SHOP_NAME = 'Gopal Bakery and Sweets';

// Filter buttons shown above the products (key: label)
const SHOP_CATEGORIES = {
  cakes: 'Cakes',
  cookies: 'Cookies & Biscuits',
  pastries: 'Pastries & Breads',
};

const SHOP_PRODUCTS = [
  // ---------- Cakes ----------
  {
    id: 'chocolate-truffle-cake',
    name: 'Chocolate Truffle Cake',
    category: 'cakes',
    size: '500 g',
    price: 650,
    image: 'cake-chocolate-truffle.png',
    fit: 'cover',
    description: 'A rich and indulgent chocolate experience for true chocolate lovers.',
  },
  {
    id: 'chocolate-delight-cake',
    name: 'Chocolate Delight Cake',
    category: 'cakes',
    size: '500 g',
    price: 600,
    image: 'cake-chocolate-delight.png',
    fit: 'cover',
    description: 'Rich chocolate layers topped with cream and juicy cherries.',
  },
  {
    id: 'black-forest-cake',
    name: 'Black Forest Cake',
    category: 'cakes',
    size: '500 g',
    price: 550,
    image: 'cake-black-forest.png',
    fit: 'cover',
    description: 'A classic favourite with soft chocolate layers and fresh cream.',
  },
  {
    id: 'fresh-cream-cake',
    name: 'Fresh Cream Cake',
    category: 'cakes',
    size: '500 g',
    price: 500,
    image: 'cake-fresh-cream.png',
    fit: 'cover',
    description: 'Light, creamy and perfect for birthdays and every celebration.',
  },
  {
    id: 'red-velvet-strawberry-cake',
    name: 'Red Velvet Strawberry Cake',
    category: 'cakes',
    size: '500 g',
    price: 600,
    image: 'cake-strawberry-cream.png',
    fit: 'cover',
    description: 'Soft red velvet layers with fresh cream and strawberries.',
  },
  {
    id: 'chocolate-drip-fruit-cake',
    name: 'Chocolate Drip Fruit Cake',
    category: 'cakes',
    size: '1 kg',
    price: 1100,
    image: 'hero-cake.png',
    fit: 'cover',
    description: 'Our showstopper: chocolate drip cake topped with fresh fruit.',
  },

  // ---------- Cookies & Biscuits ----------
  {
    id: 'choco-chip-cookies',
    name: 'Choco Chip Cookies',
    category: 'cookies',
    size: '250 g',
    price: 180,
    image: 'cookies-fresh.png',
    fit: 'cover',
    description: 'Warm, delicious cookies baked fresh with premium ingredients.',
  },
  {
    id: 'desi-ghee-atta-biscuits',
    name: 'Desi Ghee Atta Biscuits',
    category: 'cookies',
    size: '500 g',
    price: 240,
    image: 'deco-biscuits.png',
    fit: 'contain',
    description: 'Our special whole-wheat biscuits made with pure desi ghee.',
  },
  {
    id: 'butter-biscuits',
    name: 'Butter Biscuits',
    category: 'cookies',
    size: '400 g',
    price: 200,
    image: 'deco-cookie-bowl.png',
    fit: 'contain',
    description: 'Crisp, buttery biscuits – perfect with your evening tea.',
  },
  {
    id: 'assorted-cookies',
    name: 'Assorted Cookies',
    category: 'cookies',
    size: '500 g',
    price: 260,
    image: 'hero-cookies.png',
    fit: 'cover',
    description: 'A mix of our favourite cookies and biscuits, great for sharing.',
  },
  {
    id: 'custom-cookies',
    name: 'Custom Cookies',
    category: 'cookies',
    size: 'Box of 6',
    price: 450,
    image: 'cookies-custom.png',
    fit: 'cover',
    description: 'Colourful, customised cookies for birthdays and special days.',
  },
  {
    id: 'cookie-gift-box',
    name: 'Cookie Gift Box',
    category: 'cookies',
    size: '12 pieces',
    price: 499,
    image: 'cookies-gift-box.png',
    fit: 'cover',
    description: 'Beautifully packed assorted cookies, perfect for gifting.',
  },

  // ---------- Pastries & Breads ----------
  {
    id: 'glazed-donuts',
    name: 'Glazed Donuts',
    category: 'pastries',
    size: '4 pieces',
    price: 160,
    image: 'feature-donuts.png',
    fit: 'cover',
    description: 'Soft donuts with colourful glazes and sprinkles.',
  },
  {
    id: 'butter-croissants',
    name: 'Butter Croissants',
    category: 'pastries',
    size: '2 pieces',
    price: 120,
    image: 'story-croissants.png',
    fit: 'cover',
    description: 'Flaky, golden croissants baked fresh every morning.',
  },
  {
    id: 'fresh-bread-rolls',
    name: 'Fresh Bread Rolls',
    category: 'pastries',
    size: '6 pieces',
    price: 60,
    image: 'story-bread.png',
    fit: 'cover',
    description: 'Soft bread rolls, straight from our oven.',
  },
  {
    id: 'glazed-danish-pastry',
    name: 'Glazed Danish Pastry',
    category: 'pastries',
    size: '2 pieces',
    price: 140,
    image: 'pastry-banner.png',
    fit: 'cover',
    description: 'Flaky pastry with a sweet filling and an icing drizzle.',
  },
];
