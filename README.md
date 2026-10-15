# DevOps Resource Management Platform

A modern DevOps Resource Management Platform built to monitor and manage infrastructure resources, environment deployments, and related operational tasks.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (using [Mongoose](https://mongoosejs.com/) ODM)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication**: JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **UI/Charts**: [Recharts](https://recharts.org/) & [Lucide React Icons](https://lucide.dev/)

## Getting Started

First, configure your environment variables:

1. Copy `.env.example` to `.env.local`.
2. For local MongoDB, use this default connection string:

```bash
MONGODB_URI=mongodb://admin:admin@127.0.0.1:27017/devops-resource-management?authSource=admin
JWT_SECRET=your-secret-key
```

For Vercel deployment, set the same variable as:

```bash
MONGODB_URI=mongodb+srv://admin:admin@your-cluster.mongodb.net/devops-resource-management?retryWrites=true&w=majority
```

### Default local login

Use these credentials for local testing:

- Email: `admin@devopsplatform.local` or `admin`
- Password: `admin`

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
