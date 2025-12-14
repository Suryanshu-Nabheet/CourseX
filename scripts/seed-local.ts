import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const coursesData = [
  {
    id: "mj58j5mj8jbktzuxj5e",
    title: "Complete Web Development Bootcamp",
    slug: "complete-web-development-bootcamp",
    description:
      "Master HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and land your dream job as a web developer.",
    category: "Web Development",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Beginner",
    language: "English",
    price: 0,
    published: true,
  },
  {
    id: "mj58j5mk9lodgy1y6mu",
    title: "Python for Data Science and Machine Learning",
    slug: "python-data-science-machine-learning",
    description:
      "Learn Python, pandas, NumPy, matplotlib, scikit-learn, and TensorFlow. Build ML models from scratch.",
    category: "Data Science",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Intermediate",
    language: "English",
    price: 0,
    published: true,
  },
  {
    id: "mj58j5mlxl3l3oywydf",
    title: "UI/UX Design Masterclass",
    slug: "ui-ux-design-masterclass",
    description:
      "Learn design principles, Figma, user research, wireframing, and prototyping. Create beautiful, user-centered designs.",
    category: "Design",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Beginner",
    language: "English",
    price: 0,
    published: true,
  },
  {
    id: "mj58j5mlbwsjgmde4pt",
    title: "React Native Mobile App Development",
    slug: "react-native-mobile-app-development",
    description:
      "Build iOS and Android apps with React Native. Learn hooks, navigation, state management, and deployment.",
    category: "Mobile Development",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Intermediate",
    language: "English",
    price: 0,
    published: true,
  },
  {
    id: "mj58j5mm182sxo2l1no",
    title: "Digital Marketing Strategy",
    slug: "digital-marketing-strategy",
    description:
      "Master SEO, social media marketing, content marketing, and analytics. Grow your business online.",
    category: "Business",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Beginner",
    language: "English",
    price: 0,
    published: true,
  },
  {
    id: "mj58j5mm8bwqpujor6o",
    title: "Photography Masterclass",
    slug: "photography-masterclass",
    description:
      "Learn professional photography techniques, composition, lighting, and editing. Capture stunning images.",
    category: "Photography",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
    introVideoUrl:
      "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
    difficulty: "Beginner",
    language: "English",
    price: 0,
    published: true,
  },
];

async function main() {
  console.log("🌱 Seeding local database...");

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Instructor
  const instructor = await prisma.user.create({
    data: {
      id: "user_2Y6M9Z7W1Q5R9T2Y6M9Z7W1Q5", // Example Clerk ID
      name: "Suryanshu Nabheet",
      email: "suryanshu@coursex.com",
      role: "INSTRUCTOR",
      image: "/Suryanshu_Nabheet.png",
    },
  });

  // Create Student
  const student = await prisma.user.create({
    data: {
      id: "user_2Y6M9Z7W1Q5R9T2Y6M9Z7W1Q6", // Example Clerk ID
      name: "John Doe",
      email: "john@example.com",
      role: "STUDENT",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
  });

  // Create Courses
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        id: courseData.id,
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        category: courseData.category,
        thumbnailUrl: courseData.thumbnailUrl,
        introVideoUrl: courseData.introVideoUrl,
        difficulty: courseData.difficulty,
        language: courseData.language,
        price: courseData.price,
        published: courseData.published,
        instructorId: instructor.id,
        lessons: {
          create: [
            {
              title: `Introduction to ${courseData.title}`,
              description: `Learn the basics of ${courseData.category}`,
              videoUrl:
                "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
              order: 1,
              resources: {
                create: [{ url: "https://developer.mozilla.org/en-US/" }],
              },
            },
            {
              title: `Advanced ${courseData.category} Concepts`,
              description: "Deep dive into advanced topics",
              videoUrl:
                "https://www.youtube.com/embed/BY2mTMBkuFI?si=g1nBAiIGwRd9-MES",
              order: 2,
            },
          ],
        },
      },
    });
    console.log(`Created course: ${course.title}`);
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
