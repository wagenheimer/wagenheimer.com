# 🚀 wagenheimer.com

> The personal portfolio and digital playground of **Cezar Wagenheimer**.
> Built with **.NET 8 Blazor Web App**, **Tailwind CSS v4**, and **Unity WebGL** concepts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![Blazor](https://img.shields.io/badge/Blazor-Web%20App-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-cyan)

## 🌟 Overview

This project is a modern, high-performance web application designed to showcase a Full Stack Developer & Game Creator's portfolio. It combines the SEO benefits of **Server-Side Rendering (SSR)** with the interactivity of **Client-Side WebAssembly (WASM)**.

The site features a custom **Breakout-style game** embedded directly in the Hero section, a Markdown-based **Blog Engine**, and a fully responsive **Glassmorphism UI**.

## ✨ Key Features

-   ** Hybrid Rendering**: Utilizes Blazor's Auto render mode for instant initial load (SSR) and seamless interactivity.
-   **🎮 Interactive Game**: A custom JavaScript/Canvas game engine integrated with Blazor, featuring particle systems, audio synthesis, and physics.
-   **📝 Markdown Blog**: Built-in blog engine using `Markdig` with YAML frontmatter support. No database required – just drop `.md` files in `_posts`.
-   **🎨 Enterprise Modern Theme**: A custom Tailwind CSS v4 design system featuring a deep slate palette, glassmorphism effects, and professional typography.
-   **🌍 Localization**: Native .NET localization (`IStringLocalizer`) supporting English and Portuguese (pt-BR).
-   **📱 Fully Responsive**: Optimized for Mobile, Tablet, and Desktop with touch controls for the game.

## 🛠️ Tech Stack

-   **Framework**: .NET 8 Blazor Web App
-   **Languages**: C#, JavaScript, HTML5, CSS3
-   **Styling**: Tailwind CSS v4 (configured via CSS variables)
-   **Icons**: Lucide Icons & Devicon
-   **Blog Parsing**: Markdig
-   **Hosting**: Docker / Coolify (Linux)

## 🚀 Getting Started

### Prerequisites

-   [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
-   [Node.js](https://nodejs.org/) (for Tailwind CSS compilation)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/wagenheimer/wagenheimer.com.git
    cd wagenheimer.com
    ```

2.  **Restore dependencies**
    ```bash
    dotnet restore
    npm install
    ```

3.  **Run the local development server**
    We've included a PowerShell script to automate the Tailwind watcher and .NET hot reload:
    ```powershell
    .\start-dev.ps1
    ```
    *Or run manually:*
    ```bash
    npm run watch:css
    dotnet watch run --project WagenheimerDotCom/WagenheimerDotCom.csproj
    ```

4.  **Access the site**
    Open `http://localhost:5275` in your browser.

## 📂 Project Structure

```
WagenheimerDotCom/
├── Components/
│   ├── Layout/          # MainLayout, NavMenu
│   ├── Pages/
│   │   ├── Blog/        # Blog Index and Detail pages
│   │   └── Home.razor   # Main Landing Page
│   └── _Imports.razor
├── Resources/           # Localization files (.resx)
├── Services/            # MarkdownBlogService, etc.
├── Styles/
│   └── app.css          # Main Tailwind CSS source
├── wwwroot/
│   ├── css/             # Compiled CSS
│   ├── js/              # Game engine (game.js)
│   └── images/
├── _posts/              # Markdown blog posts
└── Program.cs           # DI and App Configuration
```

## 📝 Managing Content

### Adding a Blog Post
Create a new `.md` file in `WagenheimerDotCom/_posts/`:

```markdown
---
title: "My New Post"
date: "2025-12-24"
description: "A brief summary for the card preview."
tags: ["dotnet", "blazor"]
slug: "my-new-post"
---

# Hello World
Write your content here using standard Markdown...
```

### Localizing Text
Edit the resource files in `WagenheimerDotCom/Resources/`:
-   `SharedResource.en.resx` (English)
-   `SharedResource.pt.resx` (Portuguese)

## 🎨 Customization

The theme is defined in `Styles/app.css` using CSS variables:

```css
:root {
    --color-obsidian: #0f172a;
    --color-brand-violet: #3b82f6;
    --color-brand-cyan: #0ea5e9;
}
```

To rebuild CSS after changes:
```bash
npm run build:css
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Powered by .NET Blazor** | Created by [Cezar Wagenheimer](https://wagenheimer.com)
