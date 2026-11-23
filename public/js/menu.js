// Cake menu — shared by the website and the server.
// The server uses these prices to calculate order totals, so edit
// prices here and both sides stay in sync.
(function (root) {
  const CATEGORIES = [
    { id: "mini", label: "Mini Cakes", emoji: "🎂" },
    { id: "slice", label: "Cake Slices", emoji: "🍰" },
    { id: "cup", label: "Cups & Cupcakes", emoji: "🧁" }
  ];

  const CAKES = [
    {
      id: 1, category: "mini", price: 150,
      name: "Kitty Mini Cake", thai: "เค้กน้องแมว",
      image: "images/kitty-mini.jpg",
      description: "Vanilla mini cake with a hand-drawn kitty and rainbow sprinkles."
    },
    {
      id: 2, category: "mini", price: 150,
      name: "Sunny Day Mini Cake", thai: "เค้กพระอาทิตย์",
      image: "images/sunny-mini.jpg",
      description: "Sky-blue cream, fluffy clouds and a smiling sun."
    },
    {
      id: 3, category: "mini", price: 150,
      name: "Happy Birthday Mini Cake", thai: "เค้กวันเกิด",
      image: "images/birthday-mini.jpg",
      description: "Pastel birthday cake, ready to pick up and celebrate."
    },
    {
      id: 4, category: "mini", price: 150,
      name: "Bear Mini Cake", thai: "เค้กน้องหมี",
      image: "images/bear-mini.jpg",
      description: "A cheeky little bear face with a sprinkle border."
    },
    {
      id: 5, category: "mini", price: 280,
      name: "Race Car Birthday Cake", thai: "เค้กรถแข่ง",
      image: "images/race-car.jpg",
      description: "Racetrack cake with toy cars and a Birthday topper. Kids love it.",
      badge: "Best for kids"
    },
    {
      id: 6, category: "slice", price: 40,
      name: "Vanilla Cream Slice", thai: "เค้กวานิลลา",
      image: "images/vanilla-slice.jpg",
      description: "Soft vanilla sponge layered with fresh cream."
    },
    {
      id: 7, category: "slice", price: 40,
      name: "Pandan Slice", thai: "เค้กใบเตย",
      image: "images/pandan-slice.jpg",
      description: "Fragrant pandan sponge with light cream."
    },
    {
      id: 8, category: "slice", price: 40,
      name: "Chocolate Slice", thai: "เค้กช็อกโกแลต",
      image: "images/chocolate-slice.jpg",
      description: "Rich chocolate layers for chocolate lovers."
    },
    {
      id: 9, category: "slice", price: 40,
      name: "Red Velvet Slice", thai: "เค้กเรดเวลเวท",
      image: "images/red-velvet.jpg",
      description: "Red velvet crumb with smooth cream cheese frosting.",
      badge: "Popular"
    },
    {
      id: 10, category: "slice", price: 40,
      name: "Strawberry Layer Slice", thai: "เค้กสตรอว์เบอร์รี",
      image: "images/strawberry-slice.jpg",
      description: "Vanilla sponge, cream and a sweet strawberry topping."
    },
    {
      id: 11, category: "slice", price: 40,
      name: "Blueberry Layer Slice", thai: "เค้กบลูเบอร์รี",
      image: "images/blueberry-slice.jpg",
      description: "Creamy layers finished with blueberry sauce."
    },
    {
      id: 12, category: "slice", price: 40,
      name: "Foi Thong Slice", thai: "เค้กฝอยทอง",
      image: "images/foi-thong.jpg",
      description: "Thai golden threads on pandan sponge. A local favourite.",
      badge: "Thai classic"
    },
    {
      id: 13, category: "slice", price: 40,
      name: "Orange Slice", thai: "เค้กส้ม",
      image: "images/orange-slice.jpg",
      description: "Sweet and tangy orange jelly over soft cake."
    },
    {
      id: 14, category: "cup", price: 40,
      name: "Cookies & Cream Cup", thai: "เค้กถ้วยโอรีโอ้",
      image: "images/cookies-cup.jpg",
      description: "Layers of cake, cream and crushed cookies in a cup."
    },
    {
      id: 15, category: "cup", price: 100,
      name: "Cupcake Box", thai: "คัพเค้กรวม",
      image: "images/cupcake-box.jpg",
      description: "A box of assorted decorated cupcakes. Great for sharing."
    }
  ];

  const MENU = { categories: CATEGORIES, cakes: CAKES };

  if (typeof module === "object" && module.exports) {
    module.exports = MENU;
  } else {
    root.CAKE_MENU = MENU;
  }
})(typeof window !== "undefined" ? window : globalThis);
