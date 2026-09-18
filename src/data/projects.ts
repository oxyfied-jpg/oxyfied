export interface StudentProject {
  id: string;
  title: string;
  category: string;
  image: string;
  author: string;
  score: string;
  tech: string[];
  techSummary?: string;
  features: string[];
  courseSlug?: string;
  featured?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  summary?: string;
}

export const studentProjects: StudentProject[] = [
  {
    id: 'siem-log-parser',
    title: 'Automated SIEM Log Parser & Threat Monitor',
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    author: 'Liam Chen • SOC Analyst at CloudSec',
    score: '99/100 Mentor Approved',
    tech: ['Python', 'Splunk', 'Snort IDS', 'Regex', 'Elasticsearch'],
    techSummary: 'Python • Splunk',
    summary: 'High-throughput real-time security log parser and anomaly detection engine with instant alert dispatching to SOC analysts.',
    features: [
      'Real-time Log Parsing Engine',
      'Custom Snort IDS Alert Rules',
      'Automated Threat Ingestion',
      'Live SOC Incident Dashboard'
    ],
    courseSlug: 'soc-analyst-threat-intelligence',
    featured: true
  },
  {
    id: 'genai-rag-agent',
    title: 'Multi-Agent Enterprise RAG Knowledge System',
    category: 'AI / Machine Learning',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    author: 'Aarav Patel • AI Research Intern',
    score: '100/100 Mentor Approved',
    tech: ['LangChain', 'OpenAI', 'Pinecone', 'FastAPI', 'Next.js'],
    techSummary: 'LangChain • Pinecone',
    summary: 'Retrieval-Augmented Generation multi-agent reasoning system with vector semantic indexing and citation verification.',
    features: [
      'Hybrid Dense & Sparse Search',
      'Hallucination Guardrails & Eval',
      'Autonomous Tool-Calling Agents',
      'Sub-200ms Retrieval Latency'
    ],
    courseSlug: 'data-science-generative-ai',
    featured: true
  },
  {
    id: 'churn-ml-pipeline',
    title: 'Predictive Customer Churn ML Pipeline',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    author: 'Priya Sharma • BI Developer at FinTech Global',
    score: '98/100 Mentor Approved',
    tech: ['Scikit-Learn', 'Streamlit', 'Pandas', 'Seaborn', 'XGBoost'],
    techSummary: 'Scikit-Learn • Pandas',
    summary: 'End-to-end production churn prediction service with automated feature drift monitoring and retraining pipelines.',
    features: [
      'End-to-End ML Pipeline',
      'Streamlit Interactive UI',
      'Model Drift Monitoring',
      'Automated Retraining'
    ],
    courseSlug: 'data-science-generative-ai',
    featured: false
  },
  {
    id: 'vulnerability-audit',
    title: 'Corporate Network Vulnerability Audit & Defense Blueprint',
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    author: 'Marcus Vance • Security Engineer',
    score: '100/100 Mentor Approved',
    tech: ['Wireshark', 'Linux Bash', 'Nmap', 'NIST', 'Burp Suite'],
    techSummary: 'Wireshark • Nmap',
    summary: 'Full offensive network penetration assessment and defensive hardening blueprint adhering to NIST CSF controls.',
    features: [
      'Deep Packet Inspection',
      'NIST Hardening Blueprint',
      'Automated Exploit Scans',
      'Remediation Playbooks'
    ],
    courseSlug: 'cybersecurity-ethical-hacking',
    featured: false
  },
  {
    id: 'financial-analytics-kpi',
    title: 'Enterprise Financial Analytics KPI Dashboard',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    author: 'Alex Rivera • Data Analyst',
    score: '99/100 Mentor Approved',
    tech: ['Power BI', 'DAX', 'SQL', 'Excel', 'PostgreSQL'],
    techSummary: 'Power BI • DAX',
    summary: 'Automated executive financial analytics pipeline connecting multi-region ERP databases into real-time BI visualizations.',
    features: [
      'Executive KPI Metrics',
      'Complex DAX Formulations',
      'Multi-Source SQL Ingestion',
      'Automated Executive Reports'
    ],
    courseSlug: 'data-analytics-power-bi',
    featured: false
  },
  {
    id: 'cloud-devsecops-pipeline',
    title: 'Cloud DevSecOps & Runtime Threat Detection',
    category: 'Cloud & DevSecOps',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    author: 'Elena Rostova • DevSecOps Engineer',
    score: '100/100 Mentor Approved',
    tech: ['Kubernetes', 'Falco', 'AWS IAM', 'Trivy', 'Terraform'],
    techSummary: 'Kubernetes • Falco',
    summary: 'GitOps CI/CD workflow incorporating SAST/DAST container scans and Falco runtime behavioral anomaly monitoring in K8s.',
    features: [
      'CI/CD Shift-Left Security',
      'Falco Runtime Monitoring',
      'Kubernetes RBAC Guard',
      'Terraform IaC Hardening'
    ],
    courseSlug: 'cloud-security-devsecops',
    featured: false
  },
  {
    id: 'zero-trust-proxy',
    title: 'Zero-Trust Identity-Aware Microservices Gateway',
    category: 'Cybersecurity',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop',
    author: 'Tariq Al-Mansoor • Cloud Architect',
    score: '99/100 Mentor Approved',
    tech: ['Go', 'mTLS', 'OIDC / JWT', 'Envoy', 'Docker'],
    techSummary: 'Go • Envoy',
    summary: 'Mutual-TLS authenticated Zero-Trust access proxy evaluating context-aware user risk scores on every microservice request.',
    features: [
      'Strict Mutual TLS Encryption',
      'Context-Aware Policy Engine',
      'Dynamic Token Revocation',
      'Prometheus Telemetry Metrics'
    ],
    courseSlug: 'cybersecurity-ethical-hacking',
    featured: false
  },
  {
    id: 'computer-vision-safety',
    title: 'Edge AI Industrial Safety & Hazard Detector',
    category: 'AI / Machine Learning',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    author: 'Sophia Zhang • Computer Vision Engineer',
    score: '98/100 Mentor Approved',
    tech: ['PyTorch', 'YOLOv8', 'OpenCV', 'TensorRT', 'FastAPI'],
    techSummary: 'PyTorch • YOLOv8',
    summary: 'Real-time computer vision inference engine running on edge hardware detecting PPE violations and industrial safety perimeter breaches.',
    features: [
      '45+ FPS Real-Time Inference',
      'Custom PPE Dataset Training',
      'Zero-Latency Alert Triggers',
      'Edge Hardware Optimization'
    ],
    courseSlug: 'data-science-generative-ai',
    featured: false
  }
];
