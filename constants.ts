import { Quiz } from './types';

export const QUIZZES: Quiz[] = [
  {
    id: 'password_security',
    name: "Password Security",
    questions: [
      {
        id: 1,
        category: "Password Security",
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
        category: "Password Security",
        question: "Which of these is the strongest password?",
        options: [
          "Password123!",
          "MyDogFido2024",
          "R#8k&Zp@w!q2v$J9",
          "qwertyuiop",
        ],
        correctAnswer: "R#8k&Zp@w!q2v$J9",
      },
       {
        id: 3,
        category: "Password Security",
        question: "An individual calls you claiming to be from IT support and asks for your password to fix an issue. How should you respond?",
        options: [
          "Provide your password, as they are from IT",
          "Ask them for their name and employee ID first",
          "Refuse the request and report the call to the official IT department using a known number",
          "Give them a temporary password",
        ],
        correctAnswer: "Refuse the request and report the call to the official IT department using a known number",
      },
    ],
  },
  {
    id: 'data_protection',
    name: "Data Protection",
    questions: [
       {
        id: 4,
        category: "Data Protection",
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
        id: 5,
        category: "Data Protection",
        question: "What does a 'clean desk policy' primarily help prevent?",
        options: [
          "Making the office look messy",
          "Losing your coffee mug",
          "Unauthorized access to sensitive information left on a desk",
          "Forgetting your tasks for the day",
        ],
        correctAnswer: "Unauthorized access to sensitive information left on a desk",
      },
      {
        id: 6,
        category: "Data Protection",
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
    id: 'product_knowledge',
    name: "Product Knowledge",
    questions: [
      {
        id: 7,
        category: "Product Knowledge",
        question: "What is the core function of our 'SecureFlow' VPN product?",
        options: [
          "To block all incoming emails",
          "To create a secure, encrypted connection to the company network",
          "To automatically back up all files to the cloud",
          "To monitor employee productivity",
        ],
        correctAnswer: "To create a secure, encrypted connection to the company network",
      },
      {
        id: 8,
        category: "Product Knowledge",
        question: "Which feature of 'DataGuard' software helps prevent unauthorized data sharing?",
        options: [
          "File compression",
          "Spell check",
          "Data Loss Prevention (DLP) policies",
          "Customizable color themes",
        ],
        correctAnswer: "Data Loss Prevention (DLP) policies",
      },
      {
        id: 9,
        category: "Product Knowledge",
        question: "A client reports a suspected phishing email. Which product should they use to analyze and report it?",
        options: [
          "SecureFlow VPN",
          "PhishFinder AI",
          "DataGuard",
          "PasswordVault",
        ],
        correctAnswer: "PhishFinder AI",
      }
    ]
  }
];