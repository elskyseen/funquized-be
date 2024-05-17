const categories = [
  {
    image: "categorie_fruit.png",
    url_image: "http://localhost:2000/categories/categorie_fruit.png",
    category_name: "fruit",
  },
  {
    image: "categorie_animal.png",
    url_image: "http://localhost:2000/categories/categorie_animal.png",
    category_name: "animal",
  },
];

const challenges = {
  fruit: [
    {
      categorie_id: 1,
      question:
        "aku berwarna ungu, dan aku banyak tidak hanya satu, buah apakah aku?",
      choices: ["anggur", "sirsak", "apel", "manggis"],
      answer: "anggur",
      level: 1,
      point: 1,
    },
    {
      categorie_id: 1,
      question:
        "aku berwarna hijau, sedikit masam dan berduri, buah apakah aku?",
      choices: ["anggur", "sirsak", "apel", "manggis"],
      answer: "sirsak",
      level: 2,
      point: 1,
    },
    {
      categorie_id: 1,
      question:
        "aku berwarna ungu, aku hanya satu namun isiku banyak, buah apakah aku?",
      choices: ["anggur", "sirsak", "apel", "manggis"],
      answer: "manggis",
      level: 3,
      point: 1,
    },
  ],
  animal: [
    {
      categorie_id: 2,
      question:
        "aku memiliki taring, dan aku adalah predator dibawah raja hutan, apakah aku?",
      choices: ["harimau", "kucing", "hiu", "paus"],
      answer: "harimau",
      level: 1,
      point: 1,
    },
    {
      categorie_id: 2,
      question:
        "aku memiliki tarinf, dan aku sering disebut raja hutan, apakah aku?",
      choices: ["harimau", "singa", "hiu", "paus"],
      answer: "singa",
      level: 2,
      point: 1,
    },
    {
      categorie_id: 2,
      question: "aku hewan terbesar dilautan apakah aku?",
      choices: ["harimau", "kucing", "hiu", "paus"],
      answer: "hiu",
      level: 3,
      point: 1,
    },
  ],
};

export { categories, challenges };
