// Cake menu — shared by the website and the server.
// The server uses these prices to calculate order totals, so edit
// prices here and both sides stay in sync.
(function (root) {
  const CAKES = [
    {
      id: 1,
      name: "เค้กส้ม",
      price: 200,
      category: "Fruit",
      images: [
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80"
      ],
      description: "ความเปรี้ยวอมหวานของส้ม ตัดกับเนื้อเค้กนิ่ม ๆ กินแล้วเฟรช"
    },
    {
      id: 2,
      name: "Strawberry Cake",
      price: 380,
      category: "Fruit",
      images: [
        "https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Soft sponge layered with fresh strawberry cream."
    },
    {
      id: 3,
      name: "Vanilla Cake",
      price: 300,
      category: "Classic",
      images: [
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Classic vanilla cake with light buttercream."
    },
    {
      id: 4,
      name: "Red Velvet Cake",
      price: 420,
      category: "Birthday",
      images: [
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Moist red velvet cake with cream cheese frosting."
    },
    {
      id: 5,
      name: "Blueberry Cheesecake",
      price: 450,
      category: "Fruit",
      images: [
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1562777717-dc6984f65a63?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Creamy cheesecake topped with blueberry sauce."
    },
    {
      id: 6,
      name: "Dark Cocoa Cake",
      price: 390,
      category: "Chocolate",
      images: [
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Deep cocoa flavor for serious chocolate fans."
    }
  ];

  if (typeof module === "object" && module.exports) {
    module.exports = CAKES;
  } else {
    root.CAKE_MENU = CAKES;
  }
})(typeof window !== "undefined" ? window : globalThis);
