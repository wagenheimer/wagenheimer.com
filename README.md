# 🚀 wagenheimer.com

> The personal portfolio and digital playground of **Cezar Wagenheimer**.
> Built with **.NET 10 Blazor Web App**, **Tailwind CSS v4**, and **Unity/WebGL** concepts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-10.0-purple)
![Blazor](https://img.shields.io/badge/Blazor-Web%20App-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-cyan)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)

## 🌟 Overview

This project is a modern, high-performance web application designed to showcase a Full Stack Developer & Game Creator's portfolio. It combines the SEO benefits of **Server-Side Rendering (SSR)** with the interactivity of **Client-Side WebAssembly (WASM)**.

The site features a custom **Breakout-style game** embedded directly in the Hero section, a Markdown-based **Blog Engine**, and a fully responsive **Glassmorphism UI**.

## ✨ Key Features

- **🚀 .NET 10 Powered**: Leveraging the latest performance and syntax improvements of the .NET ecosystem.
- **🎮 Interactive Game**: A custom JavaScript/Canvas game engine integrated with Blazor, featuring particle systems, audio synthesis, and physics.
- **📝 Markdown Engine**: Highly optimized blog and game showcase based on `Markdig`. No database required.
- **🔐 Integrated Admin**: Full-featured administrative dashboard to manage content and moderate comments.
- **🎨 Tailwind CSS v4**: A modern design system featuring a deep slate palette, glassmorphism effects, and professional typography.
- **🌍 Localization**: Native .NET localization (`IStringLocalizer`) supporting English and Portuguese.

## 🛠️ Tech Stack

- **Framework**: .NET 10 Blazor Web App (Interactive Auto)
- **Styling**: Tailwind CSS v4 (Minified via PostCSS/Node.js)
- **Content**: Markdown + Frontmatter (Markdig)
- **Persistence**: Flat-file JSON (Comments, High Scores, Settings)
- **Deployment**: Docker & Docker Compose (Coolify/Hostinger compatible)

## 🏗️ Internal Architecture

### 🔑 Admin & Authentication
The application includes a secure administrative area at `/admin`.
- **Authentication**: Custom cookie-based authentication configured in `Program.cs`.
- **Login**: Accessed via `/admin/login`.
- **Features**:
  - **Dashboard**: Overview of site activity.
  - **Post Editor**: Real-time Markdown editor with live preview.
  - **Comment Moderation**: Approve or delete user comments before they go public.
  - **Game Management**: Configure featured games and titles.

### 📝 Content Management
Content is managed via Markdown files, making the site extremely fast and easy to backup/version.
- **Blog Posts**: Located in `WagenheimerDotCom/_posts/`. Supports YAML frontmatter for metadata (slug, title, date).
- **Games**: Managed in `WagenheimerDotCom/_games/`.
- **Data persistence**: Dynamic data like High Scores and Comments are stored as JSON in the `WagenheimerDotCom/_data/` directory.

### 🌍 Localization
Fully localized using standard .NET `.resx` files located in the `Resources/` folder.
- Supports runtime language switching.
- SEO-friendly URL structure for different languages.

## 🚀 Getting Started

### Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/) (required for Tailwind CSS build steps)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/wagenheimer/wagenheimer.com.git
   cd wagenheimer.com
   dotnet restore
   npm install
   ```

2. **Development**
   Run the included watcher script for hot-reload and Tailwind compilation:
   ```powershell
   .\start-dev.ps1
   ```

### 🐳 Deployment

The project is optimized for **Coolify** or standard Docker environments:

```bash
docker compose up -d --build
```
The build process handles everything from CSS minification to the final .NET publish.

## 📂 Project Structure

```
WagenheimerDotCom/
├── Components/          # Blazor Components & Pages
├── Resources/           # Localization (.resx)
├── Services/            # Business Logic & Blog Engine
├── Styles/              # Tailwind CSS Source (app.css)
├── wwwroot/             # Static Assets & Compiled CSS
├── _posts/              # Markdown blog content
├── Dockerfile           # Production build definition
└── docker-compose.yaml  # Deployment orchestration
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Powered by .NET 10** | Created by [Cezar Wagenheimer](https://wagenheimer.com)
