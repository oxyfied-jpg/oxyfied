import type { Course } from '../types/index.js';

export const courses: Course[] = [
  // =========================================================================
  // 1. CYBERSECURITY TRACK (5 Courses)
  // =========================================================================
  {
    id: 'cybersecurity-ethical-hacking',
    slug: 'cybersecurity-ethical-hacking',
    title: 'Master Program in Cybersecurity & Ethical Hacking',
    category: 'Cybersecurity',
    description: 'Comprehensive master program covering network vulnerability assessments, ethical hacking, web penetration testing, malware reverse engineering, and red team operations.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    price: 44999,
    originalPrice: 69999,
    duration: '9 Months',
    lessons: 95,
    level: 'Beginner to Advanced',
    rating: 4.9,
    students: 1850,
    status: 'available',
    featured: true,
    skills: [
      'Ethical Hacking',
      'Penetration Testing',
      'Kali Linux',
      'Burp Suite',
      'Metasploit',
      'Network Security',
      'OWASP Top 10'
    ],
    requirements: [
      'Basic understanding of computer networks and operating systems.',
      'A laptop/desktop with min 8GB RAM (16GB recommended for virtual labs).',
      'No prior ethical hacking experience required - starts from foundations.'
    ],
    whoIsItFor: [
      'Aspiring Ethical Hackers, Penetration Testers, and Security Analysts.',
      'System administrators and software engineers transitioning to cybersecurity.',
      'Tech graduates seeking high-demand security certifications and offensive roles.'
    ],
    modules: [
      {
        id: 'ceh-mod-1',
        title: 'Module 1 — Linux Internals, Networking Protocols & Reconnaissance',
        description: 'Master Kali Linux environments, TCP/IP handshake dissection, active/passive intelligence gathering, and OSINT techniques.',
        lessons: [
          { id: 'ceh-l-1', title: '1.1 Linux Security Architecture & Terminal Mastery', duration: '25:00', isPreview: true },
          { id: 'ceh-l-2', title: '1.2 TCP/IP, DNS & Subnet Vulnerability Analysis', duration: '30:15', isPreview: true },
          { id: 'ceh-l-3', title: '1.3 Passive Reconnaissance & Advanced OSINT Frameworks', duration: '35:20' },
          { id: 'ceh-l-4', title: '1.4 Port Scanning & Service Enumeration with Nmap', duration: '40:10' }
        ]
      },
      {
        id: 'ceh-mod-2',
        title: 'Module 2 — Network Penetration Testing & Vulnerability Assessment',
        description: 'Identify network misconfigurations, exploit legacy services, execute MITM attacks, and crack wireless networks.',
        lessons: [
          { id: 'ceh-l-5', title: '2.1 Vulnerability Scanning with Nessus & OpenVAS', duration: '28:40' },
          { id: 'ceh-l-6', title: '2.2 Exploitation Frameworks & Metasploit Pro', duration: '38:15' },
          { id: 'ceh-l-7', title: '2.3 Wireless Network Security & WPA2/WPA3 Auditing', duration: '32:50' }
        ]
      },
      {
        id: 'ceh-mod-3',
        title: 'Module 3 — Web Application Penetration Testing (OWASP Top 10)',
        description: 'Discover and exploit modern web vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), and Broken Access Control.',
        lessons: [
          { id: 'ceh-l-8', title: '3.1 Burp Suite Professional Deep Dive', duration: '35:00' },
          { id: 'ceh-l-9', title: '3.2 SQLi, XSS, SSRF & CSRF Hands-On Lab Exploits', duration: '45:10' },
          { id: 'ceh-l-10', title: '3.3 Authentication & Session Management Exploitation', duration: '38:20' }
        ]
      },
      {
        id: 'ceh-mod-4',
        title: 'Module 4 — Privilege Escalation, Active Directory & Red Teaming',
        description: 'Execute Windows and Linux privilege escalation, pivot across Active Directory forests, and generate professional penetration test reports.',
        lessons: [
          { id: 'ceh-l-11', title: '4.1 Linux & Windows Privilege Escalation Vectors', duration: '42:00' },
          { id: 'ceh-l-12', title: '4.2 Active Directory Attacks: Kerberoasting & Pass-the-Hash', duration: '50:30' },
          { id: 'ceh-l-13', title: '4.3 Enterprise Red Team Capstone Simulation', duration: '48:15' }
        ]
      }
    ]
  },
  {
    id: 'soc-analyst-threat-intelligence',
    slug: 'soc-analyst-threat-intelligence',
    title: 'SOC Analyst & Cyber Threat Intelligence Masterclass',
    category: 'Cybersecurity',
    description: 'Master Blue Team defense, SIEM deployment (Splunk & Elastic), log analysis, threat hunting, incident response playbooks, and MITRE ATT&CK framework mapping.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    price: 34999,
    originalPrice: 54999,
    duration: '6 Months',
    lessons: 72,
    level: 'Intermediate',
    rating: 4.8,
    students: 1420,
    status: 'available',
    featured: true,
    skills: [
      'SIEM & Splunk',
      'Threat Hunting',
      'Incident Response',
      'MITRE ATT&CK',
      'Wireshark',
      'Log Analysis',
      'Blue Team Defense'
    ],
    requirements: [
      'Basic networking knowledge (OSI model, IP routing, DNS).',
      'Familiarity with basic Windows and Linux command line.'
    ],
    whoIsItFor: [
      'Aspiring Tier-1/Tier-2 SOC Analysts and Incident Responders.',
      'IT support professionals wanting to break into enterprise security operations.',
      'Cybersecurity students seeking hands-on SIEM and Blue Team defense skills.'
    ],
    modules: [
      {
        id: 'soc-mod-1',
        title: 'Module 1 — SOC Fundamentals & Security Information Event Management (SIEM)',
        description: 'Understand 24/7 Security Operations Center workflows, ingest log sources, and write Splunk queries (SPL).',
        lessons: [
          { id: 'soc-l-1', title: '1.1 Enterprise SOC Architecture & Triage Workflows', duration: '22:00', isPreview: true },
          { id: 'soc-l-2', title: '1.2 Splunk Fundamentals & Search Processing Language (SPL)', duration: '34:15', isPreview: true },
          { id: 'soc-l-3', title: '1.3 Building Real-time SOC Dashboards & Alert Rules', duration: '30:40' }
        ]
      },
      {
        id: 'soc-mod-2',
        title: 'Module 2 — Network Traffic & Endpoint Log Forensics',
        description: 'Analyze malicious packet captures with Wireshark, dissect Windows Event Logs, and detect lateral movement.',
        lessons: [
          { id: 'soc-l-4', title: '2.1 Wireshark Packet Inspection & C2 Beaconing Detection', duration: '36:00' },
          { id: 'soc-l-5', title: '2.2 Sysmon & Windows Event Logs In-Depth Triage', duration: '40:20' },
          { id: 'soc-l-6', title: '2.3 Mapping Adversary Behaviors to MITRE ATT&CK', duration: '32:15' }
        ]
      },
      {
        id: 'soc-mod-3',
        title: 'Module 3 — Proactive Threat Hunting & Incident Response Playbooks',
        description: 'Construct automated incident response playbooks, isolate infected endpoints, and build cyber threat intelligence feeds.',
        lessons: [
          { id: 'soc-l-7', title: '3.1 Proactive Threat Hunting with YARA and Sigma Rules', duration: '38:00' },
          { id: 'soc-l-8', title: '3.2 Ransomware Containment & Incident Response Execution', duration: '44:10' },
          { id: 'soc-l-9', title: '3.3 Live Incident Response Sandbox Capstone', duration: '42:00' }
        ]
      }
    ]
  },
  {
    id: 'cloud-security-devsecops',
    slug: 'cloud-security-devsecops',
    title: 'Cloud Security & DevSecOps Engineering',
    category: 'Cybersecurity',
    description: 'Secure multi-cloud architectures across AWS, Azure, and GCP. Master container security with Kubernetes, CI/CD pipeline scanning, infrastructure as code auditing, and IAM governance.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    price: 39999,
    originalPrice: 59999,
    duration: '6 Months',
    lessons: 68,
    level: 'Intermediate to Advanced',
    rating: 4.9,
    students: 1180,
    status: 'available',
    featured: true,
    skills: [
      'AWS Security',
      'Kubernetes Security',
      'CI/CD Pipelines',
      'Trivy & SonarQube',
      'Terraform Hardening',
      'IAM Architecture',
      'Zero Trust'
    ],
    requirements: [
      'Basic familiarity with Cloud concepts (AWS/Azure) and Git.',
      'Understanding of software deployment lifecycles.'
    ],
    whoIsItFor: [
      'DevOps engineers looking to specialize in Cloud Security.',
      'Cloud architects, security engineers, and backend developers.'
    ],
    modules: [
      {
        id: 'csd-mod-1',
        title: 'Module 1 — AWS & Cloud Infrastructure Security Architecture',
        description: 'Implement least-privilege IAM, VPC security groups, GuardDuty, AWS KMS encryption, and Zero-Trust cloud network segmentation.',
        lessons: [
          { id: 'csd-l-1', title: '1.1 Cloud Threat Landscape & Shared Responsibility', duration: '24:00', isPreview: true },
          { id: 'csd-l-2', title: '1.2 Advanced AWS IAM Policies & Least Privilege Access', duration: '32:30', isPreview: true },
          { id: 'csd-l-3', title: '1.3 VPC Network Hardening & Cloud Trail Monitoring', duration: '35:10' }
        ]
      },
      {
        id: 'csd-mod-2',
        title: 'Module 2 — DevSecOps: Shift-Left Security in CI/CD Pipelines',
        description: 'Integrate SAST, DAST, SCA, and secret scanning into GitHub Actions and GitLab CI workflows.',
        lessons: [
          { id: 'csd-l-4', title: '2.1 Shift-Left Paradigm & Automated CI/CD Gates', duration: '28:00' },
          { id: 'csd-l-5', title: '2.2 SAST & SCA Scanning with SonarQube, Snyk & Trufflehog', duration: '36:45' },
          { id: 'csd-l-6', title: '2.3 Infrastructure as Code (IaC) Hardening with Checkov & tfsec', duration: '34:20' }
        ]
      },
      {
        id: 'csd-mod-3',
        title: 'Module 3 — Docker & Kubernetes Cluster Security',
        description: 'Hardening container images with Trivy, enforcing Kubernetes RBAC, Pod Security Standards, and runtime monitoring with Falco.',
        lessons: [
          { id: 'csd-l-7', title: '3.1 Minimal Container Base Images & Trivy Scanning', duration: '30:00' },
          { id: 'csd-l-8', title: '3.2 Kubernetes RBAC, NetworkPolicies & OPA Gatekeeper', duration: '42:15' },
          { id: 'csd-l-9', title: '3.3 Runtime Threat Detection with Falco & Capstone Deployment', duration: '45:00' }
        ]
      }
    ]
  },
  {
    id: 'network-defense-incident-handling',
    slug: 'network-defense-incident-handling',
    title: 'Network Defense, Packet Analysis & Incident Handling',
    category: 'Cybersecurity',
    description: 'Deep-dive into network protocol security, Wireshark packet dissection, firewall rule orchestration, intrusion detection systems (Snort/Suricata), and incident containment.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    price: 24999,
    originalPrice: 39999,
    duration: '4 Months',
    lessons: 48,
    level: 'Beginner to Intermediate',
    rating: 4.8,
    students: 960,
    status: 'available',
    featured: false,
    skills: [
      'Wireshark',
      'Packet Analysis',
      'Snort / Suricata',
      'Firewalls & VPNs',
      'TCP/IP Hardening',
      'Incident Triage'
    ],
    requirements: [
      'Basic computing knowledge and interest in network defense.'
    ],
    whoIsItFor: [
      'Network administrators, junior security engineers, and IT specialists.'
    ],
    modules: [
      {
        id: 'ndh-mod-1',
        title: 'Module 1 — Network Architecture & Protocol Security',
        description: 'Dissect IPv4/IPv6, TCP, UDP, TLS 1.3, ARP poisoning, and DNS cache poisoning attacks.',
        lessons: [
          { id: 'ndh-l-1', title: '1.1 Deep Packet Inspection Principles', duration: '22:00', isPreview: true },
          { id: 'ndh-l-2', title: '1.2 TLS Handshake Analysis & Decryption Workflows', duration: '28:30' }
        ]
      },
      {
        id: 'ndh-mod-2',
        title: 'Module 2 — Next-Gen Firewalls & Intrusion Detection (IDS/IPS)',
        description: 'Configure and tune Snort and Suricata rules to catch malicious signatures and behavioral anomalies.',
        lessons: [
          { id: 'ndh-l-3', title: '2.1 Writing Custom Snort Signatures', duration: '32:00' },
          { id: 'ndh-l-4', title: '2.2 Firewall Rule Automation & Traffic Segmentation', duration: '35:00' }
        ]
      },
      {
        id: 'ndh-mod-3',
        title: 'Module 3 — Incident Handling & Post-Breach Containment',
        description: 'Contain active network threats, perform packet capture forensics, and isolate malicious IP ranges.',
        lessons: [
          { id: 'ndh-l-5', title: '3.1 Rapid Network Isolation & Evidence Collection', duration: '30:00' },
          { id: 'ndh-l-6', title: '3.2 Live Network Defense Lab Capstone', duration: '38:00' }
        ]
      }
    ]
  },
  {
    id: 'web-app-penetration-testing',
    slug: 'web-app-penetration-testing',
    title: 'Web Application Penetration Testing & Bug Bounty',
    category: 'Cybersecurity',
    description: 'Master offensive security for web applications. Discover and exploit SQLi, XSS, CSRF, SSRF, authentication bypasses, API vulnerabilities, and report bugs responsibly.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    price: 27999,
    originalPrice: 42999,
    duration: '4 Months',
    lessons: 54,
    level: 'Intermediate',
    rating: 4.9,
    students: 1650,
    status: 'available',
    featured: false,
    skills: [
      'OWASP Top 10',
      'Burp Suite Pro',
      'API Security',
      'SQL Injection',
      'Cross-Site Scripting (XSS)',
      'Bug Bounty Hunting'
    ],
    requirements: [
      'Basic familiarity with HTML, JavaScript, and HTTP headers.'
    ],
    whoIsItFor: [
      'Web developers, ethical hackers, and bug bounty hunters.'
    ],
    modules: [
      {
        id: 'wpt-mod-1',
        title: 'Module 1 — HTTP Protocol & Burp Suite Exploitation Toolkit',
        description: 'Intercepting and manipulating web requests, headers, cookies, and automating fuzzing with Burp Intruder.',
        lessons: [
          { id: 'wpt-l-1', title: '1.1 Modern Web Architecture & Security Headers', duration: '20:00', isPreview: true },
          { id: 'wpt-l-2', title: '1.2 Burp Suite Repeater, Intruder & Match Rules', duration: '30:00', isPreview: true }
        ]
      },
      {
        id: 'wpt-mod-2',
        title: 'Module 2 — Server-Side & Client-Side Vulnerability Exploitation',
        description: 'Exploiting Blind SQLi, Stored XSS, Server-Side Request Forgery (SSRF), and Insecure Direct Object References (IDOR).',
        lessons: [
          { id: 'wpt-l-3', title: '2.1 Advanced SQL Injection: Union-Based & Time-Based', duration: '36:00' },
          { id: 'wpt-l-4', title: '2.2 SSRF & Remote Code Execution in Cloud Environments', duration: '40:00' }
        ]
      },
      {
        id: 'wpt-mod-3',
        title: 'Module 3 — REST/GraphQL API Security & Bug Bounty Methodology',
        description: 'Finding broken object level authorization (BOLA) in REST APIs, GraphQL introspection leaks, and drafting bug reports for HackerOne.',
        lessons: [
          { id: 'wpt-l-5', title: '3.1 REST API & GraphQL Exploitation Techniques', duration: '34:00' },
          { id: 'wpt-l-6', title: '3.2 Professional Bug Bounty Capstone & Report Submission', duration: '42:00' }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. DATA SCIENCE TRACK (5 Courses)
  // =========================================================================
  {
    id: 'data-science-generative-ai',
    slug: 'data-science-generative-ai',
    title: 'Master Program in Data Science & Generative AI',
    category: 'Data Science',
    description: 'Complete career-track covering Python for numerical computing, exploratory data analysis, machine learning algorithms, deep learning neural networks, LLM fine-tuning, and RAG architectures.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    price: 49999,
    originalPrice: 79999,
    duration: '12 Months',
    lessons: 120,
    level: 'Beginner to Advanced',
    rating: 4.9,
    students: 2890,
    status: 'available',
    featured: true,
    skills: [
      'Python',
      'Pandas & NumPy',
      'Machine Learning',
      'PyTorch',
      'LLMs & RAG',
      'LangChain',
      'Model Deployment'
    ],
    requirements: [
      'Basic mathematics and interest in data analytics.',
      'A laptop/desktop with min 8GB RAM.',
      'No prior programming background needed — starts from foundational Python.'
    ],
    whoIsItFor: [
      'Aspiring Data Scientists, ML Engineers, and AI Researchers.',
      'Software developers transitioning into Generative AI and deep learning.',
      'Analysts seeking end-to-end predictive modeling and machine learning mastery.'
    ],
    modules: [
      {
        id: 'dsai-mod-1',
        title: 'Module 1 — Python for Data Science & Numerical Computing',
        description: 'Master core Python syntax, NumPy vectorized calculations, and Pandas tabular data manipulation.',
        lessons: [
          { id: 'dsai-l-1', title: '1.1 Python Fundamentals & Programming Logic', duration: '25:00', isPreview: true },
          { id: 'dsai-l-2', title: '1.2 Advanced Data Structures & Vectorization', duration: '30:15', isPreview: true },
          { id: 'dsai-l-3', title: '1.3 Data Wrangling with Pandas DataFrames', duration: '38:20' }
        ]
      },
      {
        id: 'dsai-mod-2',
        title: 'Module 2 — Statistical Modeling & Machine Learning Pipelines',
        description: 'Train regression, classification, random forests, XGBoost models, and evaluate precision/recall curves.',
        lessons: [
          { id: 'dsai-l-4', title: '2.1 Exploratory Data Analysis & Feature Engineering', duration: '32:00' },
          { id: 'dsai-l-5', title: '2.2 Supervised Learning with Scikit-Learn', duration: '40:15' },
          { id: 'dsai-l-6', title: '2.3 Ensemble Methods: Random Forests & XGBoost', duration: '36:40' }
        ]
      },
      {
        id: 'dsai-mod-3',
        title: 'Module 3 — Deep Learning & Neural Architectures with PyTorch',
        description: 'Build multilayer perceptrons, convolutional neural nets, recurrent models, and attention mechanisms.',
        lessons: [
          { id: 'dsai-l-7', title: '3.1 Tensors, Autograd & PyTorch Model Architecture', duration: '42:00' },
          { id: 'dsai-l-8', title: '3.2 Training CNNs for Computer Vision Applications', duration: '44:30' }
        ]
      },
      {
        id: 'dsai-mod-4',
        title: 'Module 4 — Generative AI, LLMs & Retrieval-Augmented Generation (RAG)',
        description: 'Fine-tune open-source LLMs with LoRA/QLoRA, construct vector databases with Pinecone, and build agentic RAG pipelines.',
        lessons: [
          { id: 'dsai-l-9', title: '4.1 Transformer Architecture & Embedding Spaces', duration: '48:00' },
          { id: 'dsai-l-10', title: '4.2 Building Production RAG with LangChain & FAISS', duration: '52:10' },
          { id: 'dsai-l-11', title: '4.3 End-to-End Enterprise AI Capstone Deployment', duration: '45:00' }
        ]
      }
    ]
  },
  {
    id: 'machine-learning-mlops',
    slug: 'machine-learning-mlops',
    title: 'Advanced Machine Learning & MLOps Architecture',
    category: 'Data Science',
    description: 'Learn to build, evaluate, monitor, and deploy scalable machine learning pipelines in production using MLflow, Docker, FastAPI, Kubernetes, and automated CI/CD for AI models.',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop',
    price: 42999,
    originalPrice: 64999,
    duration: '8 Months',
    lessons: 84,
    level: 'Intermediate to Advanced',
    rating: 4.9,
    students: 1540,
    status: 'available',
    featured: true,
    skills: [
      'MLflow',
      'Docker for ML',
      'Model Serving',
      'Feature Stores',
      'Drift Monitoring',
      'Kubernetes',
      'CI/CD Pipelines'
    ],
    requirements: [
      'Proficiency in Python and basic understanding of machine learning algorithms.'
    ],
    whoIsItFor: [
      'Machine learning engineers and data scientists wanting to ship robust production models.'
    ],
    modules: [
      {
        id: 'mlo-mod-1',
        title: 'Module 1 — ML Experiment Tracking & Version Control with MLflow',
        description: 'Track hyperparameters, artifacts, and metrics across experiments and manage model registries.',
        lessons: [
          { id: 'mlo-l-1', title: '1.1 MLflow Tracking Server & Model Registry', duration: '28:00', isPreview: true },
          { id: 'mlo-l-2', title: '1.2 DVC (Data Version Control) for Large Datasets', duration: '32:00' }
        ]
      },
      {
        id: 'mlo-mod-2',
        title: 'Module 2 — Containerized Model Serving & High-Throughput APIs',
        description: 'Package models into minimal Docker containers and serve ultra-low-latency REST/gRPC endpoints using FastAPI & ONNX Runtime.',
        lessons: [
          { id: 'mlo-l-3', title: '2.1 High-Performance Model Serving with FastAPI & ONNX', duration: '38:00' },
          { id: 'mlo-l-4', title: '2.2 Containerizing AI Workloads with Docker & GPU acceleration', duration: '40:00' }
        ]
      },
      {
        id: 'mlo-mod-3',
        title: 'Module 3 — Kubernetes Orchestration, Feature Stores & Drift Monitoring',
        description: 'Deploy auto-scaling inference services with KServe, configure Feast feature stores, and monitor data drift with Evidently AI.',
        lessons: [
          { id: 'mlo-l-5', title: '3.1 Scalable Inference on Kubernetes & Ray Serve', duration: '46:00' },
          { id: 'mlo-l-6', title: '3.2 Data Drift Detection & Automated Retraining Pipelines', duration: '44:00' }
        ]
      }
    ]
  },
  {
    id: 'data-analytics-power-bi',
    slug: 'data-analytics-power-bi',
    title: 'Data Analytics, Business Intelligence & Power BI Masterclass',
    category: 'Data Science',
    description: 'Transform raw enterprise datasets into actionable executive insights. Master SQL data modeling, DAX calculations, interactive Power BI dashboards, and automated reporting pipelines.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    price: 29999,
    originalPrice: 45999,
    duration: '6 Months',
    lessons: 64,
    level: 'Beginner to Intermediate',
    rating: 4.8,
    students: 2100,
    status: 'available',
    featured: true,
    skills: [
      'Power BI',
      'DAX Measures',
      'SQL Queries',
      'Data Modeling',
      'Executive Dashboards',
      'Excel Analytics'
    ],
    requirements: [
      'No prior programming knowledge required. Familiarity with basic spreadsheets helpful.'
    ],
    whoIsItFor: [
      'Business analysts, financial analysts, operations leads, and data reporting specialists.'
    ],
    modules: [
      {
        id: 'pbi-mod-1',
        title: 'Module 1 — Advanced SQL for Analytics & Data Modeling',
        description: 'Write complex SQL queries, multi-table joins, window functions, and design star/snowflake schemas.',
        lessons: [
          { id: 'pbi-l-1', title: '1.1 SQL Fundamentals & Relational Databases', duration: '24:00', isPreview: true },
          { id: 'pbi-l-2', title: '1.2 Advanced Window Functions & CTEs', duration: '32:00', isPreview: true },
          { id: 'pbi-l-3', title: '1.3 Dimensional Modeling: Fact & Dimension Tables', duration: '30:00' }
        ]
      },
      {
        id: 'pbi-mod-2',
        title: 'Module 2 — Power BI Data Modeling & DAX Formulation',
        description: 'Build custom calculated columns, measures, time intelligence formulas, and dynamic filter contexts in DAX.',
        lessons: [
          { id: 'pbi-l-4', title: '2.1 Power Query ETL & Data Cleansing', duration: '35:00' },
          { id: 'pbi-l-5', title: '2.2 Mastering DAX: CALCULATE, FILTER & Time Intelligence', duration: '42:00' }
        ]
      },
      {
        id: 'pbi-mod-3',
        title: 'Module 3 — Interactive Visual Storytelling & Executive Dashboards',
        description: 'Design UX-optimized executive KPI dashboards, implement drill-throughs, tooltips, and publish reports to Power BI Service.',
        lessons: [
          { id: 'pbi-l-6', title: '3.1 Dashboard UX, Color Psychology & Visual Hierarchy', duration: '30:00' },
          { id: 'pbi-l-7', title: '3.2 Enterprise Financial Analytics Capstone Dashboard', duration: '40:00' }
        ]
      }
    ]
  },
  {
    id: 'python-sql-data-engineering',
    slug: 'python-sql-data-engineering',
    title: 'Python & SQL for Data Engineering & Big Data',
    category: 'Data Science',
    description: 'Build high-throughput ETL data pipelines. Master PostgreSQL, Apache Spark, PySpark, Airflow workflow orchestration, and cloud data warehousing with Snowflake.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    price: 34999,
    originalPrice: 52999,
    duration: '6 Months',
    lessons: 70,
    level: 'Beginner to Intermediate',
    rating: 4.8,
    students: 1320,
    status: 'available',
    featured: false,
    skills: [
      'PySpark',
      'Apache Airflow',
      'PostgreSQL',
      'Snowflake',
      'ETL Pipelines',
      'Data Warehousing'
    ],
    requirements: [
      'Basic computer literacy and understanding of logical reasoning.'
    ],
    whoIsItFor: [
      'Software engineers and analysts looking to transition into modern Data Engineering.'
    ],
    modules: [
      {
        id: 'de-mod-1',
        title: 'Module 1 — Python Scripting & Relational Database Architecture',
        description: 'Automate ingestion of JSON/CSV datasets, connect Python to PostgreSQL via SQLAlchemy, and manage connection pools.',
        lessons: [
          { id: 'de-l-1', title: '1.1 Python Automation for Raw Data Processing', duration: '26:00', isPreview: true },
          { id: 'de-l-2', title: '1.2 Advanced SQL Indexing, Partitions & Performance', duration: '34:00' }
        ]
      },
      {
        id: 'de-mod-2',
        title: 'Module 2 — Big Data Distributed Processing with Apache Spark & PySpark',
        description: 'Process terabytes of batch and streaming data with Spark DataFrames, caching, and partitioning strategies.',
        lessons: [
          { id: 'de-l-3', title: '2.1 Spark Architecture: Driver, Executors & Lazy Evaluation', duration: '38:00' },
          { id: 'de-l-4', title: '2.2 PySpark Transformations & Aggregations at Scale', duration: '40:00' }
        ]
      },
      {
        id: 'de-mod-3',
        title: 'Module 3 — Workflow Orchestration with Apache Airflow & Snowflake',
        description: 'Build DAGs in Airflow to orchestrate complex dependencies, load data into Snowflake, and implement data quality checks.',
        lessons: [
          { id: 'de-l-5', title: '3.1 Designing Robust Airflow DAGs & Operators', duration: '36:00' },
          { id: 'de-l-6', title: '3.2 Snowflake Cloud Data Warehouse Capstone Pipeline', duration: '44:00' }
        ]
      }
    ]
  },
  {
    id: 'deep-learning-cv-nlp',
    slug: 'deep-learning-cv-nlp',
    title: 'Deep Learning, Computer Vision & NLP Systems',
    category: 'Data Science',
    description: 'Build state-of-the-art neural vision and natural language processing models. Train convolutional neural nets (CNNs), vision transformers, tokenizers, BERT, and generative diffusion models.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    price: 38999,
    originalPrice: 58999,
    duration: '7 Months',
    lessons: 78,
    level: 'Intermediate to Advanced',
    rating: 4.9,
    students: 1080,
    status: 'available',
    featured: false,
    skills: [
      'PyTorch',
      'Transformers',
      'Computer Vision (OpenCV)',
      'Hugging Face',
      'BERT & GPT Architecture',
      'Object Detection (YOLO)'
    ],
    requirements: [
      'Python programming proficiency and linear algebra basics.'
    ],
    whoIsItFor: [
      'AI engineers, research engineers, and developers building vision/NLP products.'
    ],
    modules: [
      {
        id: 'dl-mod-1',
        title: 'Module 1 — Convolutional Neural Networks & Computer Vision',
        description: 'Image classification, feature extractors, transfer learning with ResNet/EfficientNet, and real-time object detection with YOLO.',
        lessons: [
          { id: 'dl-l-1', title: '1.1 Convolutions, Pooling & Custom PyTorch Vision Models', duration: '32:00', isPreview: true },
          { id: 'dl-l-2', title: '1.2 YOLO Object Detection & OpenCV Video Inference', duration: '42:00' }
        ]
      },
      {
        id: 'dl-mod-2',
        title: 'Module 2 — Natural Language Processing & Transformer Networks',
        description: 'Word embeddings, Self-Attention mechanisms, BERT token classification, and text generation with Hugging Face.',
        lessons: [
          { id: 'dl-l-3', title: '2.1 Self-Attention & Multi-Head Transformer Mechanics', duration: '45:00' },
          { id: 'dl-l-4', title: '2.2 Fine-Tuning BERT & RoBERTa for Sentiment & NER', duration: '38:00' }
        ]
      },
      {
        id: 'dl-mod-3',
        title: 'Module 3 — Multimodal AI & Latent Diffusion Models',
        description: 'Explore CLIP embeddings, image-to-text generation, and latent diffusion image generation architectures.',
        lessons: [
          { id: 'dl-l-5', title: '3.1 Multimodal Learning with OpenAI CLIP', duration: '35:00' },
          { id: 'dl-l-6', title: '3.2 Multimodal AI Capstone Application', duration: '45:00' }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. COMING SOON TRACK (3 Courses)
  // =========================================================================
  {
    id: 'autonomous-ai-agents',
    slug: 'autonomous-ai-agents',
    title: 'Autonomous AI Agents & Multi-Agent Systems Engineering',
    category: 'Coming Soon',
    description: 'Architect collaborative multi-agent swarms, tool-use execution graphs, LangGraph, AutoGen, CrewAI, memory retrieval, and self-correcting agentic code generation systems.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    price: 49999,
    originalPrice: 74999,
    duration: '6 Months',
    lessons: 60,
    level: 'Advanced',
    rating: 5.0,
    students: 0,
    status: 'coming-soon',
    featured: true,
    skills: [
      'CrewAI',
      'LangGraph',
      'AutoGen',
      'Multi-Agent Swarms',
      'Tool Calling',
      'Memory Persistence',
      'Self-Reflection Loops'
    ],
    requirements: [
      'Strong Python programming and prior experience with LLM APIs.'
    ],
    whoIsItFor: [
      'AI researchers, autonomous system engineers, and tech founders building next-generation agent products.'
    ],
    modules: [
      {
        id: 'aaa-mod-1',
        title: 'Module 1 — Agent Architecture: Planning, Tools & Memory',
        description: 'Deconstruct ReAct reasoning, structured tool invocation, working memory, and episodic vector memory storage.',
        lessons: [
          { id: 'aaa-l-1', title: '1.1 Cognitive Architectures for Autonomous AI Agents', duration: '30:00', isPreview: true },
          { id: 'aaa-l-2', title: '1.2 State Graphs & Cyclical Workflows with LangGraph', duration: '38:00' }
        ]
      },
      {
        id: 'aaa-mod-2',
        title: 'Module 2 — Multi-Agent Collaboration & Role-Based Teams',
        description: 'Orchestrating agent collaboration with CrewAI and AutoGen: manager agents, critique agents, and tool specialist agents.',
        lessons: [
          { id: 'aaa-l-3', title: '2.1 CrewAI Hierarchical Processes & Delegation', duration: '40:00' },
          { id: 'aaa-l-4', title: '2.2 Human-in-the-Loop Interrupts & Guardrails', duration: '35:00' }
        ]
      },
      {
        id: 'aaa-mod-3',
        title: 'Module 3 — Self-Correction, Code Execution & Sandbox Deployment',
        description: 'Deploying agents inside secure execution sandboxes (E2B), automated error recovery, and autonomous research assistants.',
        lessons: [
          { id: 'aaa-l-5', title: '3.1 Safe Code Execution in Sandboxed Environments', duration: '36:00' },
          { id: 'aaa-l-6', title: '3.2 Autonomous Enterprise Research Agent Capstone', duration: '50:00' }
        ]
      }
    ]
  },
  {
    id: 'quantum-computing-cryptography',
    slug: 'quantum-computing-cryptography',
    title: 'Quantum Computing Algorithms & Quantum Cryptography',
    category: 'Coming Soon',
    description: 'Explore quantum superposition, entanglement, Qiskit programming, Grover and Shor algorithms, and post-quantum cryptographic standards (PQC) for enterprise data protection.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    price: 54999,
    originalPrice: 84999,
    duration: '8 Months',
    lessons: 72,
    level: 'Advanced',
    rating: 5.0,
    students: 0,
    status: 'coming-soon',
    featured: true,
    skills: [
      'Qiskit',
      'Quantum Circuits',
      'Superposition & Entanglement',
      'Shor & Grover Algorithms',
      'Post-Quantum Cryptography'
    ],
    requirements: [
      'Understanding of linear algebra, complex numbers, and basic Python.'
    ],
    whoIsItFor: [
      'Cryptography specialists, physicists, and software engineers preparing for quantum-era computing.'
    ],
    modules: [
      {
        id: 'qc-mod-1',
        title: 'Module 1 — Quantum Mechanics Foundations & Qiskit Circuits',
        description: 'Qubits, Bloch sphere representations, Pauli quantum logic gates, and creating Bell states in Qiskit.',
        lessons: [
          { id: 'qc-l-1', title: '1.1 Qubits, Superposition & Quantum Measurement', duration: '35:00', isPreview: true },
          { id: 'qc-l-2', title: '1.2 Quantum Gate Operations & Circuit Synthesis in Qiskit', duration: '40:00' }
        ]
      },
      {
        id: 'qc-mod-2',
        title: 'Module 2 — Core Quantum Algorithms (Grover, Shor & VQE)',
        description: 'Quantum phase estimation, quadratic database search with Grover algorithm, and prime factorization with Shor algorithm.',
        lessons: [
          { id: 'qc-l-3', title: '2.1 Grover Quantum Search Algorithm Implementation', duration: '45:00' },
          { id: 'qc-l-4', title: '2.2 Variational Quantum Eigensolver (VQE) for Chemistry', duration: '42:00' }
        ]
      },
      {
        id: 'qc-mod-3',
        title: 'Module 3 — Post-Quantum Cryptography & Quantum Key Distribution (QKD)',
        description: 'BB84 protocol, lattice-based cryptography (Kyber/Dilithium), and migrating classical enterprise security to quantum-resistant encryption.',
        lessons: [
          { id: 'qc-l-5', title: '3.1 Quantum Key Distribution (BB84) Simulation', duration: '38:00' },
          { id: 'qc-l-6', title: '3.2 NIST Post-Quantum Cryptography Implementation Capstone', duration: '48:00' }
        ]
      }
    ]
  },
  {
    id: 'enterprise-blockchain-zkp',
    slug: 'enterprise-blockchain-zkp',
    title: 'Enterprise Blockchain & Zero-Knowledge Proof Systems',
    category: 'Coming Soon',
    description: 'Build private and permissioned ledger architectures, zk-SNARK privacy circuits, smart contract auditing with Foundry, and scalable decentralized consensus infrastructure.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop',
    price: 44999,
    originalPrice: 69999,
    duration: '6 Months',
    lessons: 58,
    level: 'Advanced',
    rating: 5.0,
    students: 0,
    status: 'coming-soon',
    featured: false,
    skills: [
      'Zero-Knowledge Proofs (zk-SNARKs)',
      'Solidity & Circom',
      'Foundry Security Auditing',
      'Layer 2 Rollups',
      'Decentralized Identity'
    ],
    requirements: [
      'Solid programming background in Python, TypeScript, or Rust.'
    ],
    whoIsItFor: [
      'Senior engineers and security professionals building privacy-preserving enterprise Web3 applications.'
    ],
    modules: [
      {
        id: 'zkp-mod-1',
        title: 'Module 1 — Advanced Solidity & Smart Contract Security Auditing',
        description: 'Fuzz testing with Foundry, formal verification, reentrancy defense, and gas optimization.',
        lessons: [
          { id: 'zkp-l-1', title: '1.1 Advanced EVM Internals & Storage Layout', duration: '30:00', isPreview: true },
          { id: 'zkp-l-2', title: '1.2 Foundry Invariant Fuzzing & Static Analysis with Slither', duration: '38:00' }
        ]
      },
      {
        id: 'zkp-mod-2',
        title: 'Module 2 — Zero-Knowledge Mathematics & Circom Circuits',
        description: 'Polynomial commitments, R1CS constraint systems, Groth16 zk-SNARKs, and compiling circuits in Circom.',
        lessons: [
          { id: 'zkp-l-3', title: '2.1 Arithmetic Circuits & R1CS Formulations', duration: '42:00' },
          { id: 'zkp-l-4', title: '2.2 Building Private Proof of Membership in Circom', duration: '46:00' }
        ]
      },
      {
        id: 'zkp-mod-3',
        title: 'Module 3 — zk-Rollups & Enterprise Private Settlement Architecture',
        description: 'Integrating on-chain verifier contracts with off-chain zero-knowledge provers for private enterprise financial settlement.',
        lessons: [
          { id: 'zkp-l-5', title: '3.1 Layer 2 zk-Rollup Architecture & Sequencer Mechanics', duration: '40:00' },
          { id: 'zkp-l-6', title: '3.2 Privacy-Preserving Enterprise Settlement Capstone', duration: '48:00' }
        ]
      }
    ]
  }
];
