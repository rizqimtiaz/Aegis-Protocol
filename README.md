# 🛡️ Aegis Protocol: Decentralized Visual Forensics

> A web3-enabled spatial forensics platform for digital imagery. As generative AI makes it harder to distinguish real from fake, Aegis acts as a cryptographic source of truth.

<img width="1898" height="843" alt="image" src="https://github.com/user-attachments/assets/929fd212-f6ae-47f5-8783-3eaa33111741" />


## 📖 Concept

Aegis allows users to upload high-resolution images to a cyberpunk-themed dashboard. Behind the scenes:
1. The image data is sent to an elite AI model (Anthropic's Vision model via Vercel AI SDK).
2. The AI acts as an expert digital forensic analyst, scanning for impossible geometry, lighting inconsistencies, and synthetic artifacts.
3. It outputs a **Trust Score** and precise spatial coordinates of suspicious regions.
4. The frontend renders an interactive, glowing heatmap overlay directly on the image using the HTML5 Canvas API.
5. The user can "Solidify" the report by generating a perceptual hash of the image and logging it onto a Solidity smart contract to create an immutable proof-of-analysis.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router) & React
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **Web3**: Wagmi & Viem (Ethereum interactions)
- **AI Integration**: Vercel AI SDK (`ai` package) with Anthropic Claude 3.5 Sonnet
- **Smart Contract**: Solidity
- **Image Processing**: HTML5 Canvas API

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Node.js installed on your machine.
- Node.js (v18+)
- npm or yarn

### 2. Environment Setup

Create an `.env.local` file in the root directory and add your API keys:

```env
# Required for AI Forensics
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Installation

Run the following command to install the necessary dependencies:

```bash
npm install
```

### 4. Running the Development Server

Start the application on your local machine:

```bash

---

## 💻 Project Structure

```text
├── app/
│   ├── api/analyze-image/route.ts  # AI API route parsing image data and returning Zod schema
│   ├── layout.tsx                 # Root layout with Web3 providers
│   ├── page.tsx                   # Main Dashboard UI
│   └── globals.css                # Global CSS variables & Cyberpunk styling
├── components/
│   ├── ForensicCanvas.tsx         # HTML5 Canvas mapping relative coordinates into UI overlays
│   ├── UploadZone.tsx             # Drag-and-drop imagery upload component
│   └── Web3Provider.tsx           # Wagmi context provider
├── contracts/
│   └── AegisRegistry.sol          # Decentralized registry smart contract
├── lib/
│   └── utils.ts                   # Perceptual hashing and Tailwind CSS class merger
├── tailwind.config.ts             # Custom CSS theme configs
├── next.config.mjs
└── package.json
```

<!-- metadata: xde6oh6b45 -->
<!-- metadata: 5m4egr6zsr -->
<!-- metadata: mky0if82lf -->
---

## 🧠 AI Integration Mechanics

The `app/api/analyze-image/route.ts` leverages `generateObject` from the Vercel AI SDK alongside a strict Zod schema. This ensures the Vision model doesn't just output text, but provides structured bounding box variables (`xMin`, `yMin`, `xMax`, `yMax`) relative to the image size (0.0 - 1.0).

These relative coordinates are safely parsed within the `<ForensicCanvas />` component, adapting to aspect ratios to accurately highlight visual anomalies with a glowing cyberpunk aesthetic.

---

## 🔒 Smart Contract

The core smart contract logic is provided in `contracts/AegisRegistry.sol`. 
It ensures that you can take the generated `imageHash`, the `trustScore`, and store it persistently on the blockchain to verify that an image was fact-checked at a specific point in time. 

*(Note: You will need to deploy this contract via Hardhat, Foundry, or Remix to connect it fully to a live network, and update the `CONTRACT_ADDRESS` constant in `app/page.tsx`)*

---

## 📝 License

This project is open-source and available under the MIT License.
