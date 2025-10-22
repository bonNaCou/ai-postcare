# 💜 AI PostCare — Asistente Inteligente para Pacientes Postquirúrgicos

> Proyecto Final del Máster en Inteligencia Artificial Generativa e Innovación  
> Autora: **Sherry Cyprian**  
> Fecha: Octubre 2025  
> Proyecto desarrollado con **Next.js**, **Firebase**, **TensorFlow.js** y **IA Generativa**

---

## 🩺 Descripción del Proyecto

**AI PostCare** es una aplicación web inteligente para pacientes que se están recuperando de cirugías bariátricas (como la manga gástrica).  
La app ofrece seguimiento diario, recordatorios personalizados, generación de consejos con IA, y comunicación médico-paciente en tiempo real.

---

## 🎯 Objetivos

- Facilitar el seguimiento postoperatorio mediante IA Generativa  
- Detectar patrones de dolor, ánimo e hidratación  
- Ofrecer recomendaciones personalizadas basadas en datos reales  
- Permitir comunicación y gestión entre pacientes y doctores  
- Promover una recuperación más segura y acompañada  

---

## 🧩 Funcionalidades Principales

### 👩🏾‍⚕️ **Panel del Paciente**
- Registro automático en Firebase Auth y Firestore  
- Cálculo de IMC y progreso de pérdida de peso  
- Detección de fase de recuperación (5 fases)  
- Seguimiento de dolor, ánimo e hidratación  
- Recordatorios inteligentes (agua, comida, medicación)  
- **Exportar progreso a PDF**  
- Asistente IA empático (multilingüe, con tono humano)  

### 👨🏻‍⚕️ **Panel del Doctor**
- Listado de pacientes con estados de recuperación  
- Subida de informes médicos (Firebase Storage)  
- Descarga de reportes en PDF  
- Chat y resumen inteligente con IA  
- Integración con métricas agregadas mediante Cloud Functions  

### 🧠 **IA y Machine Learning**
- Modelo TensorFlow.js para correlación dolor-ánimo  
- Generador de consejos personalizados (`aiTipsGenerator.ts`)  
- Asistente de voz multilingüe (Español,Gallego,Francés, Inglés, Pidgin-Nigeriano,Yoruba,Igbo,Hausa, Chino entre otros.. )  
- Aprendizaje federado simulado mediante funciones de nube  

---

## ⚙️ Stack Tecnológico

| Categoría | Tecnología |
|------------|-------------|
| Frontend | Next.js 15 (TypeScript + Tailwind CSS) |
| Backend | Firebase (Auth + Firestore + Storage + Functions) |
| IA Generativa | ChatGPT / Gemini / TensorFlow.js |
| Multilenguaje | i18next + react-i18next + browser-language-detector |
| No-Code | Make.com / Glide (para prototipo MVP) |
| Otros | jsPDF + html2canvas + Chart.js + ESLint + Netlify / Firebase Hosting |

---

## 🚀 Instalación y Uso

```bash
# Clonar repositorio
git clone https://github.com/sherrycyprian/ai-postcare.git
cd ai-postcare

# Instalar dependencias
npm install

# Variables de entorno (crear archivo .env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxxx

# Ejecutar en desarrollo
npm run dev
>>>>>>> accbb641e4909f93d3e4fd2d27c97ab047b9656f
