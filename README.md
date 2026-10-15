# DevOps Resource Management Platform

A modern, high-performance DevOps Resource Management Platform built to monitor and manage cloud infrastructure resources, environments, deployments, resource allocation requests, incidents, and security audit logs.

## 🚀 Live Demo & Deployment
- **Deployment URL**: [https://devops-resurce-maangement-system.vercel.app](https://devops-resurce-maangement-system.vercel.app)
- **Zero-Config Ready**: Runs out-of-the-box on Vercel with zero database setup required (Mock / Demo Mode)!

---

## ⚡ Default Demo Credentials (1-Click Login)

The platform includes built-in demo credentials for all standard roles. You can click any of the 1-Click Demo Login cards on `/login` or enter:

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **👑 System Administrator** | `admin` or `admin@devopsplatform.local` | `admin` | Full system access, User management, Settings, Approvals, Provisioning |
| **🛠️ DevOps Engineer** | `devops` or `devops-eng@devopsplatform.local` | `admin` | Resources, Deployments, Incidents, Requesting new infrastructure |
| **📋 Project Manager** | `pm` or `pm-lead@devopsplatform.local` | `admin` | Review & approve/reject resource requests, Audit logs |
| **👁️ Viewer / Auditor** | `viewer` or `viewer@devopsplatform.local` | `admin` | Read-only telemetry, overview stats, audit logs |

---

## 🛠️ Architecture & Dual-Mode Database Support

The platform automatically detects database availability:
1. **Cloud / Zero-DB Mode (Default)**:
   - When no external MongoDB cluster is configured, the platform automatically activates its high-fidelity in-memory database store with pre-seeded environments, virtual servers, database clusters, containers, deployment pipelines, incidents, and audit trails.
2. **Persistent MongoDB Atlas Mode (Optional)**:
   - Simply configure `MONGODB_URI` in Vercel Project Settings or `.env.local` to switch seamlessly to live MongoDB cloud persistence.

---

## 📦 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Dark/Light Theme Provider
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) with in-memory fallback store
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Authentication**: Signed JWT tokens (`jsonwebtoken`) & Edge Web Crypto signature verification
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Icons & Motion**: [Lucide Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/), & GSAP

---

## 💻 Local Development

1. Clone repository and install dependencies:
```bash
npm install
```

2. (Optional) Configure `.env.local`:
```bash
JWT_SECRET=devops-resource-platform-secret-key-2026
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) and sign in using `admin` / `admin`.
