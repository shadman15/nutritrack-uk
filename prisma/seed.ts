import { prisma } from "../src/lib/db";

const initialFoods = [
  {
    barcode: "5000347015390",
    name: "Soft White Medium Sliced Bread",
    brand: "Hovis",
    category: "Bread",
    superstore: "tesco",
    per100gKcal: 236,
    per100gProtein: 8.8,
    per100gCarbs: 46.5,
    per100gFat: 1.1,
    per100gFibre: 2.5,
    per100gSalt: 0.9,
    per100gSugar: 3.5,
    per100gSaturates: 0.2,
    verified: true,
  },
  {
    barcode: "5000128452331",
    name: "Semi-Skimmed Milk",
    brand: "Dairy",
    category: "Milk",
    superstore: "sainsburys",
    per100gKcal: 50,
    per100gProtein: 3.6,
    per100gCarbs: 4.8,
    per100gFat: 1.8,
    per100gFibre: 0,
    per100gSalt: 0.1,
    per100gSugar: 4.8,
    per100gSaturates: 1.1,
    verified: true,
  },
  {
    barcode: "5010044002378",
    name: "Baked Beans in Tomato Sauce",
    brand: "Heinz",
    category: "Canned",
    superstore: "asda",
    per100gKcal: 78,
    per100gProtein: 4.7,
    per100gCarbs: 12.5,
    per100gFat: 0.2,
    per100gFibre: 3.7,
    per100gSalt: 0.6,
    per100gSugar: 4.7,
    per100gSaturates: 0.1,
    verified: true,
  },
  {
    name: "Banana",
    category: "Fruit",
    per100gKcal: 89,
    per100gProtein: 1.1,
    per100gCarbs: 22.8,
    per100gFat: 0.3,
    per100gFibre: 2.6,
    per100gSalt: 0,
    per100gSugar: 12.2,
    per100gSaturates: 0.1,
    verified: true,
  },
  {
    name: "Chicken Breast, Raw",
    category: "Meat",
    per100gKcal: 106,
    per100gProtein: 23.5,
    per100gCarbs: 0,
    per100gFat: 1.3,
    per100gFibre: 0,
    per100gSalt: 0.2,
    per100gSugar: 0,
    per100gSaturates: 0.3,
    verified: true,
  },
];

async function main() {
  console.log("Seeding UK food database...");

  for (const food of initialFoods) {
    const exists = food.barcode 
      ? await prisma.foodItem.findUnique({ where: { barcode: food.barcode } })
      : await prisma.foodItem.findFirst({ where: { name: food.name } });

    if (!exists) {
      await prisma.foodItem.create({ data: food });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
