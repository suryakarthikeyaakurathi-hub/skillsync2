import { Student, Project, Community, ChatThread, Message } from './types';

export const ME_PROFILE: Student = {
  id: 'me',
  name: 'Suryakarthikeya Akurathi',
  email: 'suryakarthikeyaakurathi@gmail.com',
  university: 'Academic Institute of Technology',
  major: 'Computer Science & Artificial Intelligence',
  year: 'Junior Year',
  bio: 'Building future-ready Web & Mobile applications. Specialized in TypeScript, React, and Full-Stack Engineering. Passionate about AI integrations and student collaboration networks.',
  avatar: 'SA',
  skills: ['TypeScript', 'React', 'Tailwind CSS', 'Vite', 'Express', 'Firebase', 'Data Modeling', 'API Integration'],
  interests: ['Artificial Intelligence', 'PWA Development', 'Hackathons', 'Product Management'],
  availability: 'Available'
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@stanford.edu',
    university: 'Stanford University',
    major: 'Artificial Intelligence',
    year: 'Senior Year',
    bio: 'Deep learning researcher interested in NLP and generative agents. Looking for frontend collaborators to build interfaces for model playgrounds.',
    avatar: 'SJ',
    skills: ['Python', 'PyTorch', 'NextJS', 'HuggingFace', 'FastAPI'],
    interests: ['AI Research', 'NLP', 'Model Evaluation', 'Startups'],
    availability: 'Available',
    matchScore: 96
  },
  {
    id: 's2',
    name: 'Jin-Woo Park',
    email: 'jinwoo.park@mit.edu',
    university: 'MIT',
    major: 'Computer Science',
    year: 'Sophomore Year',
    bio: 'Competitive programmer and backend enthusiast. Love designing high-throughput API endpoints and distributed computing services.',
    avatar: 'JP',
    skills: ['Go', 'Rust', 'Docker', 'PostgreSQL', 'Redis'],
    interests: ['Systems Programming', 'Distributed Systems', 'Blockchain'],
    availability: 'Part-time',
    matchScore: 89
  },
  {
    id: 's3',
    name: 'Maya Lin',
    email: 'm.lin@gatech.edu',
    university: 'Georgia Tech',
    major: 'Human-Computer Interaction',
    year: 'Junior Year',
    bio: 'UI/UX Designer & Researcher. I bridge the gap between human curiosity and technical feasibility. Looking for mobile dev partners.',
    avatar: 'ML',
    skills: ['Figma', 'UI Design', 'User Research', 'React Native', 'Tailwind CSS'],
    interests: ['Interaction Design', 'Accessibility', 'Mobile Apps'],
    availability: 'Available',
    matchScore: 92
  },
  {
    id: 's4',
    name: 'Alex Chen',
    email: 'alex.chen@berkeley.edu',
    university: 'UC Berkeley',
    major: 'Data Science & Business',
    year: 'Senior Year',
    bio: 'Fintech enthusiast, analyzing financial microtransactions with PySpark and scikit-learn. Seeking developers for a startup hackathon.',
    avatar: 'AC',
    skills: ['Python', 'Pandas', 'SQL', 'Tableau', 'Financial Modeling'],
    interests: ['Fintech', 'SaaS startups', 'Quantitative Analysis'],
    availability: 'Busy',
    matchScore: 81
  },
  {
    id: 's5',
    name: 'Emily Watson',
    email: 'emily.w@oxford.ac.uk',
    university: 'University of Oxford',
    major: 'Computational Biology',
    year: 'PhD Candidate',
    bio: 'Analyzing genomics data sets using custom machine learning algorithms. Seeking developers for open-source science apps.',
    avatar: 'EW',
    skills: ['R Studio', 'Python', 'Machine Learning', 'Data Viz', 'Git'],
    interests: ['Genomics', 'Bioinformatics', 'Open Source', 'Medical Tech'],
    availability: 'Available',
    matchScore: 78
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Aegis: Decentralized Identity for Students',
    description: 'A Web3 identity verification framework allowing students to safely verify academic achievement & university credentials while preserving privacy.',
    creatorId: 's2',
    creatorName: 'Jin-Woo Park',
    creatorAvatar: 'JP',
    skillsNeeded: ['Go', 'Solidarity', 'React', 'Tailwind CSS'],
    category: 'Blockchain & Privacy',
    status: 'In Progress',
    membersCount: 3,
    openRolesCount: 2,
    createdAt: '2 days ago'
  },
  {
    id: 'p2',
    title: 'Pulse: AI Medical Scribe Desktop App',
    description: 'An AI-powered application designed for doctors to record consult notes, process summaries via local LLMs, and push formatted data to hospital dashboards.',
    creatorId: 's1',
    creatorName: 'Sarah Jenkins',
    creatorAvatar: 'SJ',
    skillsNeeded: ['Python', 'FastAPI', 'React', 'Tailwind CSS', 'Electron'],
    category: 'Healthcare & AI',
    status: 'Idea',
    membersCount: 1,
    openRolesCount: 3,
    createdAt: '5 days ago'
  },
  {
    id: 'p3',
    title: 'SustainaChain: campus carbon offsetting tracker',
    description: 'A mobile-first gamified app prompting university students to track and offset everyday carbon footprints, earning rewards at local campus venues.',
    creatorId: 's3',
    creatorName: 'Maya Lin',
    creatorAvatar: 'ML',
    skillsNeeded: ['React Native', 'Figma', 'NodeJS', 'PostgreSQL'],
    category: 'Sustainability',
    status: 'In Progress',
    membersCount: 4,
    openRolesCount: 1,
    createdAt: '1 week ago'
  },
  {
    id: 'p4',
    title: 'NoteSphere: Collaborative Graph Notes',
    description: 'A Markdown text editor that links notes together in a dynamic graph layout, allowing peer study groups to collaboratively structure subject knowledge.',
    creatorId: 'me',
    creatorName: 'Suryakarthikeya Akurathi',
    creatorAvatar: 'SA',
    skillsNeeded: ['TypeScript', 'React', 'D3.js', 'WebSockets', 'Tailwind CSS'],
    category: 'Education Tech',
    status: 'Idea',
    membersCount: 1,
    openRolesCount: 4,
    createdAt: 'Today'
  }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'Hackathon Crusaders',
    description: 'A dedicated guild of developers, designers, and pitchers coordinating elite submissions for global student hackathons and venture challenges.',
    category: 'Academic & Hackathons',
    memberCount: 342,
    postsCount: 128,
    iconName: 'Trophy'
  },
  {
    id: 'c2',
    name: 'AI & Generative Agents Laboratory',
    description: 'Discussing the latest papers in LLMs, reinforcement learning, auto-gpt wrappers, prompt security, and vector storage index layouts.',
    category: 'Research & Tech',
    memberCount: 512,
    postsCount: 247,
    iconName: 'Cpu'
  },
  {
    id: 'c3',
    name: 'Creative Product UI Guild',
    description: 'Sharing critiques of landing pages, micro-interactions, layout guidelines, color psychology, and wireframe prototypes built inside Figma.',
    category: 'Art & UI Design',
    memberCount: 189,
    postsCount: 65,
    iconName: 'Palette'
  },
  {
    id: 'c4',
    name: 'SaaS Builder Collective',
    description: 'For student builders launching profitable side hustles, browser extensions, and Indie Hacker assets during university semesters.',
    category: 'Business & Startups',
    memberCount: 271,
    postsCount: 112,
    iconName: 'Rocket'
  }
];

export const MOCK_THREADS: ChatThread[] = [
  {
    id: 't1',
    participantName: 'Sarah Jenkins',
    participantAvatar: 'SJ',
    participantRole: 'AI & ML Researcher',
    lastMessage: 'Awesome, let me check the draft specifications of NoteSphere!',
    lastMessageTime: '3:24 PM',
    unreadCount: 2
  },
  {
    id: 't2',
    participantName: 'Maya Lin',
    participantAvatar: 'ML',
    participantRole: 'UI/UX Designer',
    lastMessage: 'Let’s hop on a call tomorrow at noon to discuss wireframe prototypes.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 't3',
    participantName: 'Jin-Woo Park',
    participantAvatar: 'JP',
    participantRole: 'Full-Stack Developer',
    lastMessage: 'The database API endpoints are now fully containerized.',
    lastMessageTime: 'May 27',
    unreadCount: 0
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  't1': [
    {
      id: 'm1',
      senderId: 's1',
      senderName: 'Sarah Jenkins',
      senderAvatar: 'SJ',
      text: 'Hi Suryakarthikeya! I came across your profile in the Discover tab. Your focus on React and TypeScript is exactly what I am looking for.',
      timestamp: '3:15 PM',
      isMe: false
    },
    {
      id: 'm2',
      senderId: 'me',
      senderName: 'Suryakarthikeya Akurathi',
      senderAvatar: 'SA',
      text: 'Hey Sarah! Thanks for reaching out. I was actually reading about your Pulse medical scribe project, and it sounds incredibly impactful! I’d love to collaborate on configuring a lightning-fast React client.',
      timestamp: '3:18 PM',
      isMe: true
    },
    {
      id: 'm3',
      senderId: 's1',
      senderName: 'Sarah Jenkins',
      senderAvatar: 'SJ',
      text: 'That would be fantastic. I am also very interested in your NoteSphere graph project. I think we can easily model notes as embeddings and link them automatically.',
      timestamp: '3:22 PM',
      isMe: false
    },
    {
      id: 'm4',
      senderId: 's1',
      senderName: 'Sarah Jenkins',
      senderAvatar: 'SJ',
      text: 'Awesome, let me check the draft specifications of NoteSphere!',
      timestamp: '3:24 PM',
      isMe: false
    }
  ],
  't2': [
    {
      id: 'm2_1',
      senderId: 'me',
      senderName: 'Suryakarthikeya Akurathi',
      senderAvatar: 'SA',
      text: 'Hi Maya, did you review the onboarding layout flow to make sure the contrast matches AAA accessibility specs?',
      timestamp: '4:01 PM',
      isMe: true
    },
    {
      id: 'm2_2',
      senderId: 's3',
      senderName: 'Maya Lin',
      senderAvatar: 'ML',
      text: 'Yes! It looks very high-contrast and tactile. Mobile tap targets are fully compliant at 48px.',
      timestamp: '4:10 PM',
      isMe: false
    },
    {
      id: 'm2_3',
      senderId: 's3',
      senderName: 'Maya Lin',
      senderAvatar: 'ML',
      text: 'Let’s hop on a call tomorrow at noon to discuss wireframe prototypes.',
      timestamp: 'Yesterday',
      isMe: false
    }
  ],
  't3': [
    {
      id: 'm3_1',
      senderId: 's2',
      senderName: 'Jin-Woo Park',
      senderAvatar: 'JP',
      text: 'I just finished compiling the Go backend microservice. It is extremely fast, less than 15ms response times.',
      timestamp: 'May 27, 2:10 PM',
      isMe: false
    },
    {
      id: 'm3_2',
      senderId: 'me',
      senderName: 'Suryakarthikeya Akurathi',
      senderAvatar: 'SA',
      text: 'That is crazy fast! Let’s hook up the PostgreSQL instance with pooling enabled.',
      timestamp: 'May 27, 2:15 PM',
      isMe: true
    },
    {
      id: 'm3_3',
      senderId: 's2',
      senderName: 'Jin-Woo Park',
      senderAvatar: 'JP',
      text: 'The database API endpoints are now fully containerized.',
      timestamp: 'May 27',
      isMe: false
    }
  ]
};
