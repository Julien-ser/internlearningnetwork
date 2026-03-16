import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (optional - be careful in production!)
  // await prisma.userSkill.deleteMany()
  // await prisma.postSkill.deleteMany()
  // await prisma.pointsLog.deleteMany()
  // await prisma.post.deleteMany()
  // await prisma.skill.deleteMany()
  // await prisma.user.deleteMany()
  // await prisma.level.deleteMany()

  // Seed levels if empty
  const levelCount = await prisma.level.count()
  if (levelCount === 0) {
    await prisma.level.createMany({
      data: [
        { levelNumber: 1, minPoints: 0, maxPoints: 99, name: 'Beginner' },
        { levelNumber: 2, minPoints: 100, maxPoints: 499, name: 'Intermediate' },
        { levelNumber: 3, minPoints: 500, maxPoints: 1499, name: 'Advanced' },
        { levelNumber: 4, minPoints: 1500, maxPoints: 4999, name: 'Expert' },
        { levelNumber: 5, minPoints: 5000, maxPoints: null, name: 'Master' },
      ],
    })
    console.log('Seeded levels')
  }

  // Seed demo skills if empty
  const skillCount = await prisma.skill.count()
  if (skillCount === 0) {
    const demoSkills = [
      { name: 'JavaScript', description: 'Programming in JavaScript' },
      { name: 'TypeScript', description: 'Type-safe JavaScript development' },
      { name: 'React', description: 'Frontend UI library' },
      { name: 'Node.js', description: 'Server-side JavaScript runtime' },
      { name: 'Python', description: 'General-purpose programming language' },
      { name: 'SQL', description: 'Database query language' },
      { name: 'Git', description: 'Version control system' },
      { name: 'Docker', description: 'Containerization platform' },
      { name: 'AWS', description: 'Cloud computing services' },
      { name: 'GraphQL', description: 'API query language' },
      { name: 'MongoDB', description: 'NoSQL document database' },
      { name: 'PostgreSQL', description: 'Relational database system' },
      { name: 'REST APIs', description: 'Architectural style for web services' },
      { name: 'Testing', description: 'Software testing practices' },
      { name: 'CI/CD', description: 'Continuous integration and deployment' },
    ]

    for (const skill of demoSkills) {
      await prisma.skill.create({ data: skill })
    }
    console.log(`Seeded ${demoSkills.length} demo skills`)
  }

  // Optionally create a demo admin user
  const adminCount = await prisma.user.count({ where: { email: 'admin@example.com' } })
  if (adminCount === 0) {
    const hashedPassword = await require('bcrypt').hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        levelId: 5,
        totalPoints: 9999,
      },
    })
    console.log('Created demo admin user (admin@example.com / admin123)')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
