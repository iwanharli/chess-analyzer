# ♟️ Antigravity Chess AI (Chess Analyzer)

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Stockfish](https://img.shields.io/badge/Stockfish-18_WASM-white?style=for-the-badge&logo=chess.com&logoColor=black)](https://stockfishchess.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0+-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Antigravity Chess AI** is a state-of-the-art web-based chess analysis and simulation platform. Built with a focus on high performance and premium aesthetics, it combines the power of **Stockfish 18 WASM** with a modern Vue 3 interface to provide grandmaster-level insights in your browser.

![Chess AI Simulator Preview](https://raw.githubusercontent.com/iwanharli/chess-analyzer/main/preview.png) *(Note: Placeholder for actual preview image)*

## 🌟 Key Features

### 🧠 Advanced Engine Analysis
- **Stockfish 18 Integration**: Leverages the latest Stockfish engine running directly in your browser via WebAssembly (WASM).
- **Multi-PV Support**: Analyze up to 5 best move variations simultaneously with depth, evaluation, and predicted variations.
- **Visual Move Suggestions**: Best moves are highlighted directly on the board with interactive arrows and highlights.
- **Dynamic Evaluation Bar**: Real-time visual representation of the position's balance.

### 🎮 Flexible Simulation Modes
- **Practice Mode**: Play manually and get instant feedback on your moves.
- **AI Opponent**: Challenge the computer as either White or Black.
- **AI vs AI**: Watch the engine play against itself to study opening theories and endgame techniques.
- **Undo/Flip functionality**: Seamlessly experiment with different lines and perspectives.

### 📊 Tactical HUD & Metadata
- **Real-time Material Score**: Automatic calculation of piece values to track who is leading.
- **Move History**: Complete history using Standard Algebraic Notation (SAN).
- **PGN Export/Import**: Easily save your games or import existing PGNs for deep analysis.
- **Professional Sound Effects**: High-quality audio feedback for moves, captures, checks, and game results.

### 🎨 Premium Design System
- **Glassmorphism UI**: A sleek, translucent interface designed for focus and modern aesthetic appeal.
- **Responsive Layout**: Three-column dashboard optimized for large displays and productivity.
- **Confetti Rewards**: Celebratory animations for checkmates and victories.

## 🛠️ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API + Script Setup)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Engine**: [Stockfish 18 WASM](https://github.com/official-stockfish/Stockfish)
- **Chess Logic**: [Chess.js](https://github.com/jhlywa/chess.js)
- **Board UI**: [Chessboard.js](https://chessboardjs.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with Modern Flexbox/Grid

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.19.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iwanharli/chess-analyzer.git
   cd chess-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```text
├── src/
│   ├── components/      # UI Components (ChessBoard, EngineStatus, etc.)
│   ├── stores/          # Pinia stores for game state and engine logic
│   ├── services/        # Stockfish worker and Sound service
│   ├── assets/          # Static assets and sounds
│   └── App.vue          # Main application layout
├── public/
│   ├── engines/         # Stockfish WASM worker files
│   └── css/             # Third-party CSS (chessboard.js)
└── index.html           # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by [iwanharli](https://github.com/iwanharli)
