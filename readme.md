# 🏰 Projeto Clash Royale Stats - API com Análises de Jogo

Este projeto é uma API desenvolvida com **Node.js + TypeScript + MongoDB**, que simula um sistema de batalhas inspirado no Clash Royale, com foco em estatísticas de desempenho para balanceamento de jogo.

---

## 📊 Funcionalidades

- Cadastro de **Jogadores**, **Cartas**, **Decks** e **Batalhas**
- Sistema completo de **batalhas registradas** com vencedores e detalhes
- Diversas **consultas estatísticas** para auxiliar no balanceamento do jogo

---

## 🚀 Tecnologias Utilizadas

- [Node.js (Express)]
- [TypeScript]
- [MongoDB]
- [Mongoose]
- [dotenv]

## 🧪 Como Rodar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/clash_royale.git
cd clash_royale
```

### 2. Instalar dependências
```bash
npm i
```

### 3. Configurar o .env
 Crie um arquivo .env na raiz com:
 ```bash
MONGO_URI=mongodb://localhost:27017/clash_royale
PORT=3000
```
Ou utilize sua string personalizada do MongoDB Atlas.

### 4. Rodar a API

```bash
npm run dev
```

### 5. Rodar o seed
```bash
npm run seed
```

### 6. Executar uma das consultas
```bash
npx ts-node src/queries/consulta_1.ts
```
Troque consulta_1.ts por qualquer uma das análises desejadas.

## 🧠 Consultas Implementadas

### 1. % de vitórias/derrotas com carta específica

### 2. % de vitórias por deck

### 3. Derrotas com combo de cartas

### 4. Vitórias com diferença de troféus

### 5. Cartas com maior taxa de vitória

### 6. Decks invictos

### 7. Média de troféus por nível

### 8. Cartas mais usadas em decks

### 9. Duração média das batalhas

