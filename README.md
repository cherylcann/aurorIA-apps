# ✨ AurorIA — Interactive AI Experiences

<p align="center">
  <img src="https://i.imgur.com/8ayGylo.png" alt="AurorIA" width="180">
</p>

<h3 align="center">
  Explora nuevas formas de interactuar con la tecnología.
</h3>

<p align="center">
  Experiencias interactivas impulsadas por visión por computadora e inteligencia artificial, directamente desde tu navegador y utilizando únicamente tus manos.
</p>

<p align="center">
  <a href="https://playauroria.netlify.app/">
    <strong>🚀 Explorar AurorIA</strong>
  </a>
  ·
  <a href="https://github.com/cherylcann/aurorIA-apps">
    Código fuente
  </a>
</p>

---

## 🧠 Sobre el proyecto

**AurorIA** es un proyecto experimental que explora las posibilidades de la inteligencia artificial y la visión por computadora dentro del navegador.

Mediante el reconocimiento de manos en tiempo real, permite interactuar con diferentes experiencias digitales sin necesidad de utilizar un teclado, mouse o controles físicos.

El proyecto combina tecnologías web con modelos de detección de manos para transformar movimientos físicos en interacciones digitales.

## 🎮 Experiencias disponibles

| Experiencia | Descripción |
|:--|:--|
| 🎸 **Guitar Hero IA** | Juego de ritmo donde debes atrapar notas utilizando gestos de pellizco en el aire. |
| 🎨 **Pizarra Mágica IA** | Convierte la punta de tu dedo en un pincel digital para dibujar libremente. |
| 🖐️ **Esqueleto de Manos IA** | Visualiza los puntos anatómicos y movimientos de tus manos en tiempo real. |

## ⚙️ Tecnologías

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js" alt="HTML, CSS y JavaScript">
</p>

- **HTML5:** estructura y contenido de las aplicaciones.
- **CSS3:** diseño, interfaces adaptables y estilos visuales.
- **JavaScript:** lógica e interacciones en tiempo real.
- **MediaPipe Tasks Vision:** detección y seguimiento de manos.
- **Canvas API:** representación gráfica y visualización de resultados.
- **WebRTC / MediaDevices API:** acceso a la cámara del dispositivo.

## ✨ Características

- Reconocimiento de manos en tiempo real.
- Detección de hasta dos manos mediante el modelo Hand Landmarker.
- Interacción mediante gestos y movimientos naturales.
- Procesamiento visual directamente desde el navegador.
- Interfaces con modo claro y oscuro.
- Experiencias interactivas sin instalaciones adicionales.

## 🚀 Ejecutar localmente

No necesitas instalar dependencias mediante npm para ejecutar la versión actual del proyecto.

**1. Clona el repositorio:**

```bash
git clone https://github.com/cherylcann/aurorIA-apps.git
```

**2. Accede al directorio:**

```bash
cd aurorIA-apps
```

**3. Abre el proyecto mediante un servidor local.**

Puedes utilizar la extensión Live Server de Visual Studio Code y abrir `index.html`.

**4. Permite el acceso a la cámara.**

Cuando el navegador solicite permisos, autoriza el acceso a la cámara para utilizar las experiencias interactivas.

> [!IMPORTANT]
> El acceso a la cámara requiere un contexto seguro (HTTPS o localhost). También necesitas una cámara funcional y una conexión a Internet para cargar los recursos de MediaPipe desde sus CDN.

## 📁 Estructura del proyecto

```text
aurorIA-apps/
├── index.html
├── guitar.html
├── pizarra.html
├── esqueleto.html
├── css/
│   ├── index.css
│   ├── guitar.css
│   ├── pizarra.css
│   └── esqueleto.css
├── js/
│   ├── index.js
│   ├── guitar.js
│   ├── pizarra.js
│   └── esqueleto.js
└── README.md
```

## 🔬 Objetivo

AurorIA nace como una exploración de las posibilidades de la inteligencia artificial aplicada al desarrollo web.

El objetivo es experimentar con tecnologías de visión por computadora y desarrollar experiencias que permitan interactuar con sistemas digitales de una manera más natural e intuitiva.

## 👨‍💻 Autor

**Cherylcann**

Desarrollador interesado en programación, desarrollo de software e inteligencia artificial.

- GitHub: [@cherylcann](https://github.com/cherylcann)
- Web: [cherylcann.fly.dev](https://cherylcann.fly.dev/)
- Proyecto: [playauroria.netlify.app](https://playauroria.netlify.app/)

---

<p align="center">
  Hecho con curiosidad, código y bastante pasión. ✨
</p>
