const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function resolveFoodsPath() {
  const candidates = [
    path.resolve(process.cwd(), '../data/foods/foods.json'),
    path.resolve(__dirname, '../../data/foods/foods.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function normalizeFood(raw, index) {
  return {
    id: String(raw.id ?? raw.stt ?? `${raw.name ?? 'food'}-${index}`),
    name: String(raw.name ?? raw.food_name ?? 'Unknown'),
    category: String(raw.category ?? 'Other'),
    calories: Number(raw.calories ?? raw.kcal ?? 0),
    protein: Number(raw.protein ?? 0),
    fat: Number(raw.fat ?? 0),
    carbs: Number(raw.carbs ?? 0),
  };
}

async function main() {
  const foodsPath = resolveFoodsPath();
  if (!foodsPath) {
    throw new Error('foods.json not found. Expected at ../data/foods.json');
  }

  const rawText = fs.readFileSync(foodsPath, 'utf-8');
  const data = JSON.parse(rawText);

  if (!Array.isArray(data)) {
    throw new Error('foods.json must contain an array');
  }

  const foods = data.map((item, index) => normalizeFood(item, index));

  const result = await prisma.food.createMany({
    data: foods,
    skipDuplicates: true,
  });

  console.log(`Seeded foods: ${result.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
