import { Quiz } from './types';

export const PASSING_PERCENTAGE = 70;

export const QUIZZES: Quiz[] = [
  {
    id: 'password_security',
    name: "Password & Account Security",
    questions: [
      {
        id: 1,
        category: "Password & Account Security",
        question: "What is the primary purpose of Multi-Factor Authentication (MFA)?",
        options: [
          "To make passwords longer",
          "To add an extra layer of security beyond just a password",
          "To share your account with a colleague safely",
          "To automatically change your password every month",
        ],
        correctAnswer: "To add an extra layer of security beyond just a password",
      },
      {
        id: 2,
        category: "Password & Account Security",
        question: "Which of these is the strongest password?",
        options: [
          "Password123!",
          "MyDogFido2024",
          "R#8k&Zp@w!q2v$J9",
          "qwertyuiop",
        ],
        correctAnswer: "R#8k&Zp@w!q2v$J9",
      },
    ],
  },
  {
    id: 'data_protection_handling',
    name: "Data Protection & Handling",
    questions: [
       {
        id: 3,
        category: "Data Protection & Handling",
        question: "Where should you store confidential company files?",
        options: [
          "On your personal Google Drive",
          "In your email drafts folder",
          "In company-approved cloud storage or network drives",
          "On a USB stick you keep on your desk",
        ],
        correctAnswer: "In company-approved cloud storage or network drives",
      },
       {
        id: 4,
        category: "Data Protection & Handling",
        question: "What does 'data classification' help you do?",
        options: [
          "Delete old files automatically",
          "Understand the sensitivity of data and how to handle it",
          "Share files more quickly with anyone",
          "Encrypt your entire hard drive",
        ],
        correctAnswer: "Understand the sensitivity of data and how to handle it",
      },
    ]
  },
  {
    id: 'email_communication_security',
    name: "Email & Communication Security",
    questions: [
      {
        id: 5,
        category: "Email & Communication Security",
        question: "You receive an unexpected email with a link to reset your password. What should you do?",
        options: [
          "Click the link and reset your password immediately",
          "Forward the email to the IT department, then delete it",
          "Ignore and delete the email without clicking the link",
          "Reply to ask if the sender is legitimate",
        ],
        correctAnswer: "Ignore and delete the email without clicking the link",
      },
    ]
  },
  {
    id: 'device_internet_usage',
    name: "Device & Internet Usage",
    questions: [
      {
        id: 6,
        category: "Device & Internet Usage",
        question: "Why is it risky to use public Wi-Fi without a VPN for work?",
        options: [
          "It can be slow and unreliable",
          "Attackers on the same network can intercept your data",
          "It uses up your mobile data plan",
          "It is always safe if the Wi-Fi has a password",
        ],
        correctAnswer: "Attackers on the same network can intercept your data",
      },
    ]
  },
  {
    id: 'physical_security',
    name: "Physical Security",
    questions: [
      {
        id: 7,
        category: "Physical Security",
        question: "What does a 'clean desk policy' primarily help prevent?",
        options: [
          "Making the office look messy",
          "Losing your coffee mug",
          "Unauthorized access to sensitive information left on a desk",
          "Forgetting your tasks for the day",
        ],
        correctAnswer: "Unauthorized access to sensitive information left on a desk",
      },
    ]
  },
  {
    id: 'incident_reporting',
    name: "Incident Reporting",
    questions: [
      {
        id: 8,
        category: "Incident Reporting",
        question: "You accidentally click on a suspicious link in an email. What should be your immediate next step?",
        options: [
          "Disconnect your computer from the network and report it to IT immediately",
          "Run a virus scan and hope for the best",
          "Delete the email and don't tell anyone",
          "Restart your computer",
        ],
        correctAnswer: "Disconnect your computer from the network and report it to IT immediately",
      },
    ]
  },
  {
    id: 'social_engineering_awareness',
    name: "Social Engineering Awareness",
    questions: [
      {
        id: 9,
        category: "Social Engineering Awareness",
        question: "An individual calls you claiming to be from IT support and asks for your password to fix an issue. How should you respond?",
        options: [
          "Provide your password, as they are from IT",
          "Ask them for their name and employee ID first",
          "Refuse the request and report the call to the official IT department using a known number",
          "Give them a temporary password",
        ],
        correctAnswer: "Refuse the request and report the call to the official IT department using a known number",
      },
    ]
  },
  {
    id: 'acceptable_use_compliance',
    name: "Acceptable Use & Compliance",
    questions: [
      {
        id: 10,
        category: "Acceptable Use & Compliance",
        question: "Is it acceptable to use your company email for personal activities like online shopping?",
        options: [
          "Yes, as long as it's not excessive",
          "Only for emergencies",
          "No, company resources should be used for business purposes only",
          "Yes, it is more secure than a personal email",
        ],
        correctAnswer: "No, company resources should be used for business purposes only",
      },
    ]
  },
  {
    id: 'remote_work_byod',
    name: "Remote Work & BYOD",
    questions: [
      {
        id: 11,
        category: "Remote Work & BYOD",
        question: "When working from home, which of the following is most important for security?",
        options: [
          "Having a comfortable chair",
          "Using a secure Wi-Fi network with a strong password",
          "Taking breaks every hour",
          "Having a large monitor",
        ],
        correctAnswer: "Using a secure Wi-Fi network with a strong password",
      },
    ]
  },
  {
    id: 'backup_recovery_awareness',
    name: "Backup & Recovery Awareness",
    questions: [
      {
        id: 12,
        category: "Backup & Recovery Awareness",
        question: "What is the primary reason for regularly backing up company data?",
        options: [
          "To free up space on your computer",
          "To ensure data can be recovered in case of loss or corruption",
          "To comply with email retention policies",
          "To make files easier to search",
        ],
        correctAnswer: "To ensure data can be recovered in case of loss or corruption",
      },
    ]
  }
];