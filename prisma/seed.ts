const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create some coaches
  const coach1 = await prisma.user.create({
    data: {
      name: "Coach Alice",
      email: "alice@example.com",
      phone: "1234567890",
      isCoach: true,
    },
  });

  const coach2 = await prisma.user.create({
    data: {
      name: "Coach Bob",
      email: "bob@example.com",
      phone: "0987654321",
      isCoach: true,
    },
  });

  // Create some students
  const student1 = await prisma.user.create({
    data: {
      name: "Student Charlie",
      email: "charlie@example.com",
      phone: "1122334455",
      isCoach: false,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Student Diana",
      email: "diana@example.com",
      phone: "5566778899",
      isCoach: false,
    },
  });

  console.log({ coach1, coach2, student1, student2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
