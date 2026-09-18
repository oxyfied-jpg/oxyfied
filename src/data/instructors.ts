import type { Instructor } from '../types';

export const instructors: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Dr. Evelyn Vance',
    role: 'Lead Cybersecurity Instructor',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    bio: 'Former Enterprise Security Architect with 12+ years of experience auditing defense infrastructure. Holds certifications in CISSP, CEH, and OSCP. Passionate about teaching system hardening through practical, safe labs.',
    linkedin: 'https://linkedin.com/in/placeholder-evelyn-vance',
    expertise: ['Network Security', 'Ethical Hacking', 'Penetration Testing', 'Incident Response']
  },
  {
    id: 'inst-2',
    name: 'Michael Kovac',
    role: 'Principal Data Scientist & Researcher',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    bio: 'Data Science consultant previously leading optimization algorithms at finance platforms. Expert in statistical modeling, machine learning systems, and Python tooling. Dedicated to building production-ready analytical pipelines.',
    linkedin: 'https://linkedin.com/in/placeholder-michael-kovac',
    expertise: ['Python', 'Machine Learning', 'Statistical Analysis', 'Predictive Modeling']
  }
];
