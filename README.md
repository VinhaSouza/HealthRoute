# HealthRoute

HealthRoute é um aplicativo móvel desenvolvido com **React Native + Expo**, voltado para gerenciamento de domicílios, agendamento de visitas e acompanhamento de moradores.  

O aplicativo utiliza **Firebase** para autenticação e armazenamento de dados e inclui funcionalidades como:
- Cadastro e edição de domicílios.
- Cadastro, edição e remoção de moradores.
- Agendamento e acompanhamento de visitas.
- Dashboard de status de visitas pendentes e concluídas.
- Tela de mapa para visualização de domicílios.

---

## 💻 Tecnologias utilizadas

- React Native
- Expo (SDK 48+)
- Firebase (Firestore + Auth)
- EAS Build (para gerar APK)
- TailwindCSS / StyleSheet React Native

---

## 🚀 Instalação

### Pré-requisitos

- Node.js LTS (18 ou 20)
- npm ou yarn
- Expo CLI local (vem junto com `expo` no projeto)
- Conta na [Expo](https://expo.dev/)
- Conta no [Firebase](https://firebase.google.com/)

---

##  Instalando Dependências
```bash
npm install
# ou
yarn install
```
---
## Configurar Firebase

Crie um arquivo .env na raiz do projeto com as credenciais do seu projeto Firebase:

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

No arquivo src/services/firebase.js, certifique-se de importar essas variáveis

---
## 📱 Rodar o projeto local
```bash
npx expo start
```

Vai abrir o Expo Dev Tools no navegador.

Escaneie o QR code com o Expo Go no celular para testar

---
## 📦 Build para Android (APK)

Instale o EAS CLI localmente:

npm install --save-dev eas-cli


Faça login na sua conta Expo:

npx eas login


Inicie o build:

npx eas build --platform android --profile preview


Siga as instruções para criar um keystore ou usar o remoto.

Após concluído, você receberá um link para baixar o APK.

### Clonar o projeto

```bash
git clone https://github.com/VinhaSouza/HealthRoute.git
cd HealthRoute
