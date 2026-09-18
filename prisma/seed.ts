import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { courses } from '../src/data/courses.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  
  // Clean up all tables in order of dependency
  await prisma.homepageSetting.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.statItem.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding default users...');
  
  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('adminpassword123', 10);
  const studentPasswordHash = await bcrypt.hash('studentpassword123', 10);
  const mentor1PasswordHash = await bcrypt.hash('mentorpassword123', 10);
  const mentor2PasswordHash = await bcrypt.hash('mentorpassword123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@oxyfied.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 8547755667',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Jane Student',
      email: 'student@oxyfied.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      phone: '+91 8547755667',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    }
  });

  const userMentor1 = await prisma.user.create({
    data: {
      name: 'Dr. Evelyn Vance',
      email: 'evelyn.vance@oxyfied.com',
      passwordHash: mentor1PasswordHash,
      role: 'mentor',
      phone: '+91 8547755667',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'
    }
  });

  const userMentor2 = await prisma.user.create({
    data: {
      name: 'Michael Kovac',
      email: 'michael.kovac@oxyfied.com',
      passwordHash: mentor2PasswordHash,
      role: 'mentor',
      phone: '+91 8547755667',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop'
    }
  });

  console.log('Seeding mentors...');
  
  const inst1 = await prisma.mentor.create({
    data: {
      id: 'inst-1',
      userId: userMentor1.id,
      name: 'Dr. Evelyn Vance',
      designation: 'Lead Cybersecurity & Systems Architect',
      bio: 'Former Enterprise Security & AI Architect with 12+ years of experience leading applied threat research, offensive red teaming, and secure computing architectures. Dedicated to hands-on, job-ready technology education.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      email: 'evelyn.vance@oxyfied.com',
      expertise: ['Cybersecurity', 'Ethical Hacking', 'Cloud Security', 'Autonomous Systems'],
      status: 'active',
      isActive: true
    }
  });

  const inst2 = await prisma.mentor.create({
    data: {
      id: 'inst-2',
      userId: userMentor2.id,
      name: 'Michael Kovac',
      designation: 'Principal Data Scientist & AI Researcher',
      bio: 'Data Science & MLOps consultant previously leading machine learning optimization and enterprise analytics pipelines at top-tier platforms. Dedicated to building production-grade intelligence workflows.',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
      email: 'michael.kovac@oxyfied.com',
      expertise: ['Data Science', 'Machine Learning', 'MLOps', 'Power BI & Analytics'],
      status: 'active',
      isActive: true
    }
  });

  console.log('Seeding categories...');
  
  const catCyber = await prisma.category.create({
    data: { 
      id: 'cat-cybersecurity', 
      name: 'Cybersecurity', 
      slug: 'cybersecurity', 
      description: 'Offensive and defensive cybersecurity masterclasses, penetration testing, DevSecOps, and SOC operations', 
      icon: 'ShieldCheck', 
      sortOrder: 0 
    }
  });

  const catDataScience = await prisma.category.create({
    data: { 
      id: 'cat-data-science', 
      name: 'Data Science', 
      slug: 'data-science', 
      description: 'End-to-end data science, machine learning, MLOps, deep learning, Power BI, and generative AI master programs', 
      icon: 'Database', 
      sortOrder: 1 
    }
  });

  const catComingSoon = await prisma.category.create({
    data: { 
      id: 'cat-coming-soon', 
      name: 'Coming Soon', 
      slug: 'coming-soon', 
      description: 'Next-generation computing tracks: Autonomous AI Agents, Quantum Computing, and Enterprise Blockchain', 
      icon: 'Clock', 
      sortOrder: 2 
    }
  });

  console.log(`Seeding ${courses.length} courses with full modules & curriculum...`);

  for (const c of courses) {
    let categoryId = catCyber.id;
    let mentorId = inst1.id;

    if (c.category === 'Data Science' || c.category.toLowerCase().includes('data')) {
      categoryId = catDataScience.id;
      mentorId = inst2.id;
    } else if (c.category === 'Coming Soon' || c.status === 'coming-soon') {
      categoryId = catComingSoon.id;
      mentorId = inst1.id;
    } else {
      categoryId = catCyber.id;
      mentorId = inst1.id;
    }

    const createdCourse = await prisma.course.create({
      data: {
        id: c.id,
        title: c.title,
        slug: c.slug,
        shortDescription: c.description.length > 250 ? c.description.slice(0, 247) + '...' : c.description,
        description: c.description,
        thumbnail: c.image,
        categoryId: categoryId,
        mentorId: mentorId,
        price: c.price,
        discountPrice: c.originalPrice,
        duration: c.duration,
        level: c.level,
        status: c.status,
        skills: c.skills,
        requirements: c.requirements || [],
        whoIsItFor: c.whoIsItFor || [],
        isFeatured: Boolean(c.featured),
        isActive: true
      }
    });

    // Seed all modules and lessons
    if (c.modules && c.modules.length > 0) {
      for (let mIdx = 0; mIdx < c.modules.length; mIdx++) {
        const mod = c.modules[mIdx];
        const createdMod = await prisma.module.create({
          data: {
            id: mod.id,
            courseId: createdCourse.id,
            title: mod.title,
            description: mod.description || null,
            sortOrder: mIdx
          }
        });

        if (mod.lessons && mod.lessons.length > 0) {
          for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
            const l = mod.lessons[lIdx];
            await prisma.lesson.create({
              data: {
                id: l.id,
                moduleId: createdMod.id,
                courseId: createdCourse.id,
                title: l.title,
                description: l.description || l.content || null,
                duration: l.duration || '25:00',
                isPreview: Boolean(l.isPreview),
                videoType: 'youtube',
                youtubeVideoId: 'dQw4w9WgXcQ',
                sortOrder: lIdx,
                isActive: true
              }
            });
          }
        }
      }
    } else {
      // Fallback preview module
      const mod = await prisma.module.create({
        data: {
          id: `${c.id}-mod-1`,
          courseId: createdCourse.id,
          title: 'Module 1 — Foundations & Core Principles',
          description: `Essential core concepts and tools for ${c.title}.`,
          sortOrder: 0
        }
      });

      await prisma.lesson.create({
        data: {
          id: `${c.id}-l-1`,
          moduleId: mod.id,
          courseId: createdCourse.id,
          title: '1.1 Comprehensive Overview & Setup',
          duration: '15:00',
          isPreview: true,
          youtubeVideoId: 'dQw4w9WgXcQ',
          videoType: 'youtube',
          sortOrder: 0,
          isActive: true
        }
      });
    }
  }

  // Enroll default student in Master Program in Cybersecurity & Ethical Hacking
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: 'cybersecurity-ethical-hacking',
      status: 'active',
      progress: 15
    }
  });

  console.log('Seeding statistics...');
  await prisma.statItem.createMany({
    data: [
      { id: 'learners', value: '2,500+', label: 'Active Learners', icon: 'Users', sortOrder: 0 },
      { id: 'courses', value: '13 Programs', label: 'Master & Specialist Tracks', icon: 'BookOpen', sortOrder: 1 },
      { id: 'projects', value: '50+ Labs', label: 'Real-World Projects Built', icon: 'FolderGit', sortOrder: 2 },
      { id: 'rating', value: '4.9 / 5.0', label: 'Average Student Rating', icon: 'Star', sortOrder: 3 }
    ]
  });

  console.log('Seeding testimonials...');
  await prisma.testimonial.createMany({
    data: [
      {
        id: 't-1',
        name: 'Alexander P.',
        role: 'Data Scientist & AI Practitioner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        content: 'The Master Program in Data Science & Generative AI provided exactly the practical depth I needed. The hands-on projects, live sessions, and PyTorch architecture labs gave me the confidence to transition into a senior data science role.',
        rating: 5,
        courseName: 'Master Program in Data Science & Generative AI'
      },
      {
        id: 't-2',
        name: 'Meera S.',
        role: 'SOC Security Analyst',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
        content: 'The SOC Analyst & Cyber Threat Intelligence Masterclass and Ethical Hacking curriculum took my defensive security capabilities to another level. The live Splunk and packet forensics labs delivered immediate workplace value.',
        rating: 5,
        courseName: 'SOC Analyst & Cyber Threat Intelligence Masterclass'
      },
      {
        id: 't-3',
        name: 'Rohan K.',
        role: 'Cloud Security Engineer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
        content: 'The Cloud Security & DevSecOps Engineering program helped me master Kubernetes hardening, Trivy pipeline scanning, and IAM architecture. Truly production-grade training!',
        rating: 5,
        courseName: 'Cloud Security & DevSecOps Engineering'
      }
    ]
  });

  console.log('Database seeding completed successfully with all courses, modules, and lessons!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
