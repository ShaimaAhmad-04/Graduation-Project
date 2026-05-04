import prisma from './client.js'

const skills = [
  // ── Programming Languages ──
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'Dart', 'Perl',
  'Shell Scripting', 'Bash', 'PowerShell', 'Assembly',

  // ── Web Frontend ──
  'HTML', 'CSS', 'Angular', 'React', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte',
  'Tailwind CSS', 'Bootstrap', 'SASS', 'LESS', 'jQuery', 'Redux', 'Webpack',

  // ── Web Backend ──
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'ASP.NET', 'Laravel', 'Ruby on Rails', 'NestJS', 'GraphQL', 'REST APIs',
  'Microservices', 'WebSockets', 'gRPC',

  // ── Databases ──
  'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Firebase',
  'Prisma', 'SQL', 'Oracle Database', 'Microsoft SQL Server', 'Cassandra',
  'Elasticsearch', 'DynamoDB', 'Supabase',

  // ── Cloud & DevOps ──
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'GitLab', 'Linux', 'Terraform', 'Ansible', 'Jenkins',
  'GitHub Actions', 'Nginx', 'Apache', 'Serverless',

  // ── AI / Data Science ──
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
  'Pandas', 'NumPy', 'Scikit-learn', 'Data Analysis', 'Data Visualization',
  'Computer Vision', 'NLP', 'OpenCV', 'Jupyter Notebook', 'Tableau',
  'Power BI', 'Excel (Advanced)', 'Statistics', 'Big Data', 'Hadoop', 'Spark',

  // ── Mobile Development ──
  'React Native', 'Flutter', 'Android Development', 'iOS Development',
  'Xamarin', 'Ionic',

  // ── Cybersecurity ──
  'Cybersecurity', 'Network Security', 'Penetration Testing', 'Ethical Hacking',
  'SIEM', 'Firewalls', 'Cryptography', 'Vulnerability Assessment',
  'Incident Response', 'OWASP', 'Kali Linux', 'Wireshark', 'Metasploit',

  // ── Networking & IT ──
  'Networking', 'TCP/IP', 'DNS', 'DHCP', 'VPN', 'Cisco', 'Routing & Switching',
  'Network Administration', 'IT Support', 'Windows Server', 'Active Directory',
  'System Administration', 'Virtualization', 'VMware', 'VirtualBox',

  // ── Software Engineering ──
  'Object-Oriented Programming', 'Design Patterns', 'Data Structures',
  'Algorithms', 'Software Architecture', 'Agile', 'Scrum', 'Kanban',
  'Test-Driven Development', 'Unit Testing', 'Integration Testing',
  'Code Review', 'Clean Code', 'SOLID Principles',

  // ── UI/UX & Design ──
  'Figma', 'Adobe XD', 'Sketch', 'UI/UX Design', 'Wireframing', 'Prototyping',
  'User Research', 'Adobe Photoshop', 'Adobe Illustrator', 'Canva',
  'Responsive Design', 'Accessibility (WCAG)',

  // ── Business & Management ──
  'Project Management', 'Business Analysis', 'Strategic Planning',
  'Business Development', 'Operations Management', 'Change Management',
  'Risk Management', 'Stakeholder Management', 'Process Improvement',
  'Six Sigma', 'Lean Management', 'PMP', 'PRINCE2',

  // ── Marketing & Sales ──
  'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing',
  'Content Marketing', 'Email Marketing', 'Google Analytics', 'Google Ads',
  'Facebook Ads', 'Brand Management', 'Market Research', 'CRM',
  'Salesforce', 'HubSpot', 'Copywriting', 'Sales',

  // ── Finance & Accounting ──
  'Financial Analysis', 'Accounting', 'Budgeting', 'Financial Reporting',
  'Auditing', 'Tax', 'QuickBooks', 'SAP', 'ERP Systems', 'Cost Accounting',
  'Financial Modeling', 'Investment Analysis', 'Excel',

  // ── Human Resources ──
  'Recruitment', 'Talent Acquisition', 'Employee Relations', 'HR Management',
  'Performance Management', 'Training & Development', 'Payroll', 'HRIS',
  'Onboarding', 'Labor Law',

  // ── Engineering (General) ──
  'AutoCAD', 'SolidWorks', 'MATLAB', 'Circuit Design', 'PCB Design',
  'Embedded Systems', 'PLC Programming', 'Mechanical Design',
  'Structural Analysis', 'Thermodynamics', 'Electrical Engineering',
  'Control Systems', 'Signal Processing', 'VHDL', 'FPGA',

  // ── Soft Skills ──
  'Communication', 'Teamwork', 'Leadership', 'Problem Solving',
  'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity',
  'Attention to Detail', 'Public Speaking', 'Negotiation', 'Conflict Resolution',
  'Mentoring', 'Decision Making',

  // ── Languages ──
  'Arabic', 'English', 'French', 'German', 'Spanish', 'Mandarin',

  // ── Other Tools ──
  'Microsoft Office', 'Google Workspace', 'Slack', 'Jira', 'Trello',
  'Notion', 'Confluence', 'Zoom', 'Microsoft Teams', 'LaTeX',
]

async function main() {
  console.log('Seeding skills...')
  let count = 0
  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name }
    })
    count++
  }
  console.log(`Done! Seeded ${count} skills.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
