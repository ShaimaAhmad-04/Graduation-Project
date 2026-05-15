import prisma from './prisma/client.js'
import bcrypt from 'bcrypt'

// ─── Skill IDs from your DB ───────────────────────────────────────────────
const S = {
  JavaScript: 1, TypeScript: 2, Python: 3, React: 26, Angular: 25,
  NodeJS: 38, Java: 4, CSharp: 7, SQL: 60, MongoDB: 55, Git: 73,
  GitHub: 74, Docker: 70, AWS: 67, Linux: 76, CSS: 24, HTML: 23,
  Express: 39, PostgreSQL: 53, REST: 49, ML: 84, DataAnalysis: 92,
  Flutter: 106, ReactNative: 105, Figma: 153, Scrum: 145
}

const now = new Date()
const deadline = (days) => new Date(now.getTime() + days * 86400000)
const posted = (daysAgo) => new Date(now.getTime() - daysAgo * 86400000)

async function seed() {

  // ── 1. Extra recruiter accounts + companies ──────────────────────────────
  const pw = await bcrypt.hash('Demo1234', 10)

  const recruiters = [
    { email: 'google@demo.com',    firstName: 'Google',    lastName: 'Recruiter', company: { name: 'Google',    industry: 'Technology',        status: 'verified', description: 'Google is a global leader in internet services and AI.', website: 'https://google.com', location: 'Mountain View, USA' } },
    { email: 'microsoft@demo.com', firstName: 'Microsoft', lastName: 'Recruiter', company: { name: 'Microsoft', industry: 'Technology',        status: 'verified', description: 'Microsoft empowers every person and organization on the planet.', website: 'https://microsoft.com', location: 'Redmond, USA' } },
    { email: 'zain@demo.com',      firstName: 'Zain',      lastName: 'Recruiter', company: { name: 'Zain Jordan', industry: 'Telecommunications', status: 'verified', description: 'Leading telecom operator in Jordan and the Middle East.', website: 'https://jo.zain.com', location: 'Amman, Jordan' } },
    { email: 'orange@demo.com',    firstName: 'Orange',    lastName: 'Recruiter', company: { name: 'Orange Jordan', industry: 'Telecommunications', status: 'pending', description: 'Digital services and telecom provider in Jordan.', website: 'https://orange.jo', location: 'Amman, Jordan' } },
  ]

  const companyIds = {}

  for (const r of recruiters) {
    let user = await prisma.user.findUnique({ where: { email: r.email } })
    if (!user) {
      user = await prisma.user.create({
        data: { firstName: r.firstName, lastName: r.lastName, email: r.email, password: pw, phoneNumber: '0790000000', role: 1 }
      })
    }
    let company = await prisma.company.findUnique({ where: { userId: user.id } })
    if (!company) {
      company = await prisma.company.create({
        data: { userId: user.id, ...r.company }
      })
    }
    companyIds[r.company.name] = user.id
  }

  // Amazon is already in DB (userId: 1)
  companyIds['Amazon'] = 1

  // ── 2. Internships ────────────────────────────────────────────────────────
  const listings = [
    // Amazon
    {
      companyId: companyIds['Amazon'],
      title: 'Frontend Developer Intern',
      description: 'Join Amazon\'s frontend team to build responsive, accessible UIs for millions of users. You\'ll work with React and TypeScript to develop new features for Amazon\'s e-commerce platform. Collaborate with senior engineers in an Agile environment.',
      postDate: posted(10), submissionDeadline: deadline(20),
      duration: '3 months', isPaid: true, status: true, location: 'Onsite',
      skills: [S.React, S.TypeScript, S.JavaScript, S.CSS, S.HTML, S.Git]
    },
    {
      companyId: companyIds['Amazon'],
      title: 'Backend Engineer Intern',
      description: 'Work on scalable backend services powering Amazon\'s cloud infrastructure. You\'ll design REST APIs, optimize database queries, and deploy microservices on AWS. Strong problem-solving skills required.',
      postDate: posted(5), submissionDeadline: deadline(25),
      duration: '6 months', isPaid: true, status: true, location: 'Onsite',
      skills: [S.NodeJS, S.Express, S.PostgreSQL, S.AWS, S.Docker, S.REST, S.Git]
    },
    // Google
    {
      companyId: companyIds['Google'],
      title: 'Machine Learning Intern',
      description: 'Contribute to cutting-edge ML research at Google. You\'ll help train and evaluate models for natural language processing and computer vision tasks. Work alongside world-class researchers using Python and TensorFlow.',
      postDate: posted(3), submissionDeadline: deadline(30),
      duration: '3 months', isPaid: true, status: true, location: 'Remote',
      skills: [S.Python, S.ML, S.DataAnalysis, S.SQL, S.Git, S.Linux]
    },
    {
      companyId: companyIds['Google'],
      title: 'Full Stack Developer Intern',
      description: 'Build internal tools and developer-facing products at Google. You\'ll use Angular on the frontend and Node.js on the backend to create seamless developer experiences. Agile methodology with two-week sprints.',
      postDate: posted(7), submissionDeadline: deadline(15),
      duration: '4 months', isPaid: true, status: true, location: 'Hybrid',
      skills: [S.Angular, S.TypeScript, S.NodeJS, S.MongoDB, S.REST, S.Scrum]
    },
    // Microsoft
    {
      companyId: companyIds['Microsoft'],
      title: 'Cloud Solutions Intern',
      description: 'Support Microsoft Azure customers in deploying and managing cloud infrastructure. You\'ll automate deployments using scripts, monitor system health, and implement DevOps best practices.',
      postDate: posted(2), submissionDeadline: deadline(35),
      duration: '3 months', isPaid: true, status: true, location: 'Hybrid',
      skills: [S.AWS, S.Docker, S.Linux, S.Python, S.Git, S.Scrum]
    },
    {
      companyId: companyIds['Microsoft'],
      title: 'Mobile App Developer Intern',
      description: 'Develop cross-platform mobile applications for Microsoft\'s productivity suite. You\'ll build features for Teams and Outlook mobile using React Native, working closely with the design team to implement pixel-perfect UIs.',
      postDate: posted(8), submissionDeadline: deadline(22),
      duration: '3 months', isPaid: true, status: true, location: 'Remote',
      skills: [S.ReactNative, S.JavaScript, S.TypeScript, S.REST, S.Git, S.Figma]
    },
    // Zain Jordan
    {
      companyId: companyIds['Zain Jordan'],
      title: 'Software Development Intern',
      description: 'Join Zain Jordan\'s digital transformation team. You\'ll develop internal web applications to streamline operations, build REST APIs, and integrate with third-party telecom systems. Great opportunity to work on real-world enterprise software.',
      postDate: posted(4), submissionDeadline: deadline(18),
      duration: '3 months', isPaid: true, status: true, location: 'Onsite',
      skills: [S.JavaScript, S.React, S.NodeJS, S.SQL, S.REST, S.Git]
    },
    {
      companyId: companyIds['Zain Jordan'],
      title: 'UI/UX Design Intern',
      description: 'Shape the digital experience of Zain Jordan\'s customer-facing products. You\'ll create wireframes, prototypes, and final designs for web and mobile apps. Collaborate with developers to ensure accurate implementation.',
      postDate: posted(6), submissionDeadline: deadline(12),
      duration: '2 months', isPaid: false, status: true, location: 'Onsite',
      skills: [S.Figma, S.CSS, S.HTML, S.JavaScript, S.Scrum]
    },
    // Orange Jordan
    {
      companyId: companyIds['Orange Jordan'],
      title: 'Data Analysis Intern',
      description: 'Analyze customer usage data to improve Orange Jordan\'s service offerings. You\'ll work with large datasets using Python and SQL, build dashboards, and present insights to the business team.',
      postDate: posted(1), submissionDeadline: deadline(28),
      duration: '3 months', isPaid: false, status: true, location: 'Onsite',
      skills: [S.Python, S.DataAnalysis, S.SQL, S.PostgreSQL, S.Git]
    },
  ]

  let created = 0
  for (const listing of listings) {
    const { skills, ...data } = listing
    const existing = await prisma.internship.findFirst({ where: { title: data.title, companyId: data.companyId } })
    if (!existing) {
      await prisma.internship.create({
        data: {
          ...data,
          internshipSkills: {
            create: skills.map(skillId => ({ skillId }))
          }
        }
      })
      created++
    }
  }

  console.log(`\n✅ Demo seed complete!`)
  console.log(`   Companies: Google, Microsoft, Zain Jordan, Orange Jordan (+ Amazon)`)
  console.log(`   Internships created: ${created}`)
  console.log(`\n📋 Demo recruiter logins (password: Demo1234):`)
  console.log(`   google@demo.com | microsoft@demo.com | zain@demo.com | orange@demo.com`)
  await prisma.$disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })
