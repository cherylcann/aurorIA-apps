import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/+esm";

        const video = document.getElementById("webcam");
        const canvas = document.getElementById("output_canvas");
        const ctx = canvas.getContext("2d");
        const textoEstado = document.getElementById("estado");

        const rangoBarra = document.getElementById("text-size");
        const colorBarra = document.getElementById("text-color");
        const dedoSelect = document.getElementById("font-family");
        const limpiar = document.getElementById("limpiar");

        const htmlElement = document.documentElement;
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");
        const themeBtnW = document.getElementById("themeBtnW");
        const themeBtnMobile = document.getElementById("themeBtnMobile");

        function ajustarResolucionCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        window.addEventListener('resize', ajustarResolucionCanvas);
        ajustarResolucionCanvas();

        function updateBackground(range) {
            const min = Number(range.min) || 0;
            const max = Number(range.max) || 100;
            const value = Number(range.value);

            const progress = ((value - min) / (max - min)) * 100;
            const background = getComputedStyle(range).getPropertyValue('--input-background').trim();

            range.style.background = `linear-gradient(to right, #58a6ff ${progress}%, ${background} ${progress}%)`;
        }

        rangoBarra.addEventListener('input', () => updateBackground(rangoBarra));
        updateBackground(rangoBarra);

        function cambiarTema() {
            const temaActual = htmlElement.getAttribute('data-theme');
            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', nuevoTema);

            const textoHtml = nuevoTema === 'light' 
                ? '<i class="fa-solid fa-moon" style="margin-right: 5px;"></i> Modo Oscuro' 
                : '<i class="fa-solid fa-sun" style="margin-right: 5px;"></i> Modo Claro';

            if (themeBtnW) themeBtnW.innerHTML = textoHtml;
            if (themeBtnMobile) themeBtnMobile.innerHTML = textoHtml;

            updateBackground(rangoBarra);
        }

        if (themeBtnW) themeBtnW.addEventListener('click', cambiarTema);
        if (themeBtnMobile) themeBtnMobile.addEventListener('click', cambiarTema);

        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            if (navLinks.classList.contains('active')) {
                menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                document.body.style.overflow = 'hidden';
            } else {
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = 'auto';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = 'auto';
            });
        });

        let handLandmarker = undefined;
        let ultimaHoraVideo = -1;

        let trazos = [];
        let trazoActual = null;

        let renderWidth = 0, renderHeight = 0, offsetX = 0, offsetY = 0;

        async function inicializarModeloIA() {
            try {
                const visionWasm = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
                );

                handLandmarker = await HandLandmarker.createFromOptions(visionWasm, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });

                textoEstado.textContent = "🟢 IA lista. Iniciando cámara...";
                iniciarCamara();
            } catch (error) {
                textoEstado.textContent = "❌ Error al cargar el modelo de IA.";
                console.error(error);
            }
        }

        function iniciarCamara() {
            navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
                .then((stream) => {
                    video.srcObject = stream;

                    video.onloadeddata = () => {
                        ajustarResolucionCanvas();
                        textoEstado.textContent = "🎨 ¡Pizarra Activa! Junta los dedos para pintar";
                        buclePrincipal();
                    };
                }).catch((err) => {
                    textoEstado.textContent = "❌ Error de cámara.";
                    console.log(err);
                });
        }

        function calcularYDibujarVideoCubierto(video, ctx, canvas) {
            const vWidth = video.videoWidth;
            const vHeight = video.videoHeight;
            const cWidth = canvas.width;
            const cHeight = canvas.height;

            const vRatio = vWidth / vHeight;
            const cRatio = cWidth / cHeight;

            if (vRatio > cRatio) {
                renderHeight = cHeight;
                renderWidth = cHeight * vRatio;
                offsetX = (cWidth - renderWidth) / 2;
                offsetY = 0;
            } else {
                renderWidth = cWidth;
                renderHeight = cWidth / vRatio;
                offsetX = 0;
                offsetY = (cHeight - renderHeight) / 2;
            }

            ctx.drawImage(video, offsetX, offsetY, renderWidth, renderHeight);
        }

        let line = 5;
        let lineGuardar = 10;
        let color = "#58a6ff";
        let dedo = 8;

        function buclePrincipal() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            calcularYDibujarVideoCubierto(video, ctx, canvas);

            ctx.lineWidth = lineGuardar;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            for (const trazo of trazos) {
                if (trazo.length < 2) continue;
                ctx.beginPath();
                ctx.lineWidth = trazo.tamaño;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = trazo.color;
                ctx.moveTo(trazo.puntos[0].x, trazo.puntos[0].y);

                for (let i = 1; i < trazo.puntos.length; i++) {
                    ctx.lineTo(trazo.puntos[i].x, trazo.puntos[i].y);
                }
                ctx.stroke();
            }

            if (trazoActual && trazoActual.puntos.length > 1) {
                ctx.beginPath();
                ctx.lineWidth = trazoActual.tamaño;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = trazoActual.color;
                ctx.moveTo(trazoActual.puntos[0].x, trazoActual.puntos[0].y);
                for (let i = 1; i < trazoActual.puntos.length; i++) {
                    ctx.lineTo(trazoActual.puntos[i].x, trazoActual.puntos[i].y);
                }
                ctx.stroke();
            }

            if (handLandmarker && video.currentTime !== ultimaHoraVideo) {
                ultimaHoraVideo = video.currentTime;
                let tiempoActualMs = performance.now();

                const resultados = handLandmarker.detectForVideo(video, tiempoActualMs);

                if (resultados.landmarks && resultados.landmarks.length > 0) {
                    const puntosMano = resultados.landmarks[0];
                    const dedoElegido = puntosMano[dedo];
                    const dedoPulgar = puntosMano[4];

                    const x = offsetX + (dedoElegido.x * renderWidth);
                    const y = offsetY + (dedoElegido.y * renderHeight);

                    const dx = (dedoElegido.x - dedoPulgar.x) * renderWidth;
                    const dy = (dedoElegido.y - dedoPulgar.y) * renderHeight;
                    const distancia = Math.sqrt(dx * dx + dy * dy);

                    if (distancia < 40) {
                        textoEstado.textContent = "Dibujando...";

                        if (!trazoActual) {
                            trazoActual = {
                                puntos: [],
                                color: colorBarra.value,
                                tamaño: lineGuardar
                            };
                        }

                        trazoActual.puntos.push({ x, y });

                        ctx.beginPath();
                        ctx.arc(x, y, line, 0, 2 * Math.PI);
                        ctx.fillStyle = trazoActual.color;
                        ctx.fill();
                    } else {
                        textoEstado.textContent = "Moviendo pincel";
                        if (trazoActual) {
                            trazos.push(trazoActual);
                            trazoActual = null;
                        }

                        ctx.beginPath();
                        ctx.arc(x, y, line, 0, 2 * Math.PI);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = "#ffffff";
                        ctx.stroke();
                    }
                } else {
                    textoEstado.textContent = "Buscando tu mano...";
                    if (trazoActual) {
                        trazos.push(trazoActual);
                        trazoActual = null;
                    }
                }
            }

            requestAnimationFrame(buclePrincipal);
        }

        inicializarModeloIA();

        rangoBarra.addEventListener("input", () => {
            const size_value = document.getElementById("size-value");
            line = rangoBarra.value;
            lineGuardar = rangoBarra.value * 2;
            size_value.textContent = `${rangoBarra.value} px`;
        });

        colorBarra.addEventListener("input", () => {
            const color_value = document.getElementById("color-value");
            color = colorBarra.value;
            color_value.textContent = colorBarra.value;
        });

        dedoSelect.addEventListener("change", () => {
            dedo = dedoSelect.value;
        });

        limpiar.addEventListener("click", () => {
            trazos = [];
        });
