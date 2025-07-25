import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Cars', icon: '🚗' },
    { name: 'Mobiles', icon: '📱' },
    { name: 'Properties', icon: '🏠' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Bikes', icon: '🏍️' },
    { name: 'Electronics', icon: '📺' },
    { name: 'Books, Sports & Hobbies', icon: '📚' },
    { name: 'Commercial Vehicles & Spares', icon: '🚚' },
    { name: 'Jobs', icon: '💼' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories seeded');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
