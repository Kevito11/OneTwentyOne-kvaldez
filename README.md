# onetwentyone - ICC

<p align="center">
  <strong>Sitio Web Oficial y Plataforma de Registro de la Conferencia de Jóvenes OneTwentyOne / Siervos Para Cristo</strong><br />
  <em>Iglesia de Convertidos a Cristo (ICC) — Santo Domingo, República Dominicana</em>
</p>

<p align="center">
  <a href="https://github.com/Kevito11/OneTwentyOne-kvaldez">
    <img src="https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge" alt="Status" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="https://vite.dev/">
    <img src="https://img.shields.io/badge/Vite-8.0-9063FF?style=for-the-badge&logo=vite" alt="Vite" />
  </a>
</p>

---

## 📄 Descripción

Este repositorio contiene la plataforma web oficial para el ministerio de jóvenes **OneTwentyOne (Siervos Para Cristo)** de la **Iglesia de Convertidos a Cristo (ICC)**. 

El sitio ha sido diseñado con una **estética monocromática (Black & White) de alto contraste** extremadamente elegante y moderna, inspirada en las tendencias de diseño de redes sociales de la juventud actual. Cuenta con un sistema interactivo de **registro completamente gratuito** que genera boletos virtuales dinámicos para los asistentes a la conferencia anual.

---

## ✨ Características Principales

*   🖤 **Diseño Premium Blanco y Negro (Minimalista)**: Interfaz de usuario sofisticada basada en negro absoluto (`#000000`), grises carbón, tipografía moderna y paneles con efecto de cristal templado (*glassmorphic panels*) con tenues halos blancos tridimensionales.
*   🎫 **Registro 100% Gratis con Boleto Virtual**: Formulario optimizado para la asistencia. Al completarse, genera dinámicamente en pantalla un boleto digital interactivo y futurista de cristal con:
    *   Código de entrada único del asistente (ej: `121-ICC-4839`).
    *   Código QR vectorial SVG animado.
    *   Indicadores de participación en talleres y almuerzo gratis.
    *   Botón integrado para **Imprimir boleto / Guardar como PDF** de manera optimizada y adaptada a hojas físicas.
*   📅 **Programa y Cronograma Dinámico**: Cronología por pestañas interactivas para visualizar detalladamente las plenarias, talleres especializados y noches de concierto del evento por días.
*   🕒 **Cuenta Regresiva en Tiempo Real**: Cronómetro responsivo de precisión que marca el tiempo exacto restante para el día de apertura de la conferencia.
*   📍 **Geolocalización & Ubicación Integrada**: Enlaces rápidos y visualizaciones interactivas de mapa que dirigen al usuario en un solo clic a la ubicación exacta del templo de la ICC en Google Maps.
*   📖 **Identidad & Historia Institucional**: Sección Nosotros que detalla la base bíblica del ministerio (**Filipenses 1:21**) y la valiosa historia de fe de la Iglesia de Convertidos a Cristo fundada en 1982 por el pastor Arq. José R. Mallén Malla.
*   📱 **100% Responsivo (Pixel-Perfect)**: Optimización milimétrica para móviles compactos (desde `320px` como iPhone SE) y de gran formato, incluyendo un menú desplegable vertical de tipo *Apple-style overlay*.

---

## 🛠️ Tecnologías Utilizadas

*   **Core**: HTML5, JavaScript (ES6+), React 19.
*   **Diseño & Estilos**: CSS3 Vanilla (Custom Properties, Flexbox, Grid, Media Queries de precisión).
*   **Enrutamiento**: React Router Dom v7.
*   **Iconos**: Lucide React v1 (compatibilidad universal garantizada para evitar errores de renderizado).
*   **Entorno de Desarrollo & Bundler**: Vite 8.

---

## 🚀 Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar este proyecto en tu computadora:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Kevito11/OneTwentyOne-kvaldez.git
cd OneTwentyOne-kvaldez
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
*Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver el resultado.*

### 4. Construir para producción
```bash
npm run build
```

---

## 📂 Estructura de Directorios

```text
├── public/                 # Recursos públicos y Favicon
├── src/
│   ├── assets/             # Imágenes y logos oficiales
│   ├── components/
│   │   └── layout/         # Componentes compartidos (Navbar, Footer)
│   ├── pages/
│   │   ├── Home/           # Página de Inicio (Expositores, Horarios, FAQ)
│   │   ├── About/          # Nosotros (Filipenses 1:21, Historia ICC)
│   │   ├── Activities/     # Reuniones semanales, células y cultos
│   │   └── Registration/   # Registro Gratis y Generación de Boleto QR
│   ├── App.jsx             # Enrutador principal de la aplicación
│   ├── index.css           # Tokens de diseño Blanco y Negro globales
│   └── main.jsx            # Punto de entrada de React
├── index.html              # Estructura del sitio e icono de la pestaña
├── package.json            # Metadatos del repositorio y dependencias
└── vite.config.js          # Configuración del servidor de desarrollo
```

---

## ⛪ Sobre la Iglesia
La **Iglesia de Convertidos a Cristo (ICC)** es una congregación comprometida con la sana doctrina y la predicación expositiva de la Palabra de Dios. Visita su página oficial para conocer más: [convertidosacristo.org](https://www.convertidosacristo.org/).
