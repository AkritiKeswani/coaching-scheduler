// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create Test Coach
  const testCoach = await prisma.user.upsert({
    where: { email: "coach@example.com" },
    update: {},
    create: {
      // id: 1, // Remove explicit ID assignment
      name: "Test Coach",
      email: "coach@example.com",
      phone: "123-456-7890",
      isCoach: true,
    },
  });

  // Create Test Student
  const testStudent = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      // id: 2, // Remove explicit ID assignment
      name: "Test Student",
      email: "student@example.com",
      phone: "098-765-4321",
      isCoach: false,
    },
  });

  // Optionally, keep existing users
  // Create Coach Alice
  const coachAlice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Coach Alice",
      email: "alice@example.com",
      phone: "1234567890",
      isCoach: true,
    },
  });

  // Create Coach Bob
  const coachBob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Coach Bob",
      email: "bob@example.com",
      phone: "0987654321",
      isCoach: true,
    },
  });

  // Create Student Charlie
  const studentCharlie = await prisma.user.upsert({
    where: { email: "charlie@example.com" },
    update: {},
    create: {
      name: "Student Charlie",
      email: "charlie@example.com",
      phone: "1122334455",
      isCoach: false,
    },
  });

  // Create Student Diana
  const studentDiana = await prisma.user.upsert({
    where: { email: "diana@example.com" },
    update: {},
    create: {
      name: "Student Diana",
      email: "diana@example.com",
      phone: "5566778899",
      isCoach: false,
    },
  });

  console.log({
    testCoach,
    testStudent,
    coachAlice,
    coachBob,
    studentCharlie,
    studentDiana,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
