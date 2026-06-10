# EchoGraph

**Voice-accessible math graph sonification tool for STEM education.**  
Speak or type a math expression, see a live graph, and hear the function as sound — sweeping your cursor across the graph produces pitch changes that map to y-values.

Built with React, Vite, Groq (LLaMA 3.3 70B) for natural language → math parsing, mathjs for computation, Tone.js for audio synthesis, and a neobrutalism design system.

## Features

- **Voice & text input** — dictate "graph y = x squared from 0 to 10" or type it
- **Graph sonification** — move your pointer to hear the function played as notes (frequency mapped to y-value)
- **Natural language parsing** — Groq extracts the mathematical expression, bounds, and step from plain English
- **Read aloud** — speech synthesis reads the explanation of the function
- **Neobrutalism UI** — bold borders, heavy contrast, flat surfaces, accessible by default

## Quick Start

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier works)

### Local Development