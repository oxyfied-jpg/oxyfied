import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      enrollments: {
        select: {
          id: true,
          courseId: true,
          status: true,
          course: {
            select: {
              id: true,
              slug: true,
              title: true
            }
          }
        }
      }
    }
  });
  console.log('--- ALL USERS AND ENROLLMENTS ---');
  console.log(JSON.stringify(users, null, 2));

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slug: true,
      title: true
    }
  });
  console.log('--- ALL COURSES ---');
  console.log(JSON.stringify(courses, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
