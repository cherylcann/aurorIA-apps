import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/+esm";

        const video = document.getElementById("webcam");
        const canvas = document.getElementById("output_canvas");
        const ctx = canvas.getContext("2d");
        const textoEstado = document.getElementById("estado");

        const htmlElement = document.documentElement;
        const selectDedo = document.getElementById("font-family");
        const options = document.querySelectorAll('.select');

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

        options.forEach(option => {
            const input = option.querySelector('input[type="range"]');
            const span = option.querySelector('.option-heading span');

            updateBackground(input);

            input.addEventListener('input', () => {
                updateBackground(input);

                if (input.id == "number-size") {
                    span.textContent = input.value;
                    num_carriles = input.value;
                    notas = [];
                } else if (input.id == "altura-size") {
                    span.textContent = `${input.value}%`;
                    y_linea_meta = 30 + (input.value / 100) * (canvas.height - 60);
                } else if (input.id == "velocidad-size") {
                    span.textContent = `${input.value}seg`;
                    velocidad_notas = (canvas.height * 0.08) / input.value;
                } else if (input.id == "tiempo-size") {
                    span.textContent = `${input.value / 10}seg`;
                    intervalo_spawn = input.value * 100;
                }
            });
        });

        function updateBackground(range) {
            const min = Number(range.min) || 0;
            const max = Number(range.max) || 100;
            const value = Number(range.value);

            const progress = ((value - min) / (max - min)) * 100;
            const background = getComputedStyle(range).getPropertyValue('--input-background').trim();

            range.style.background = `linear-gradient(to right, #58a6ff ${progress}%, ${background} ${progress}%)`;
        }

        function cambiarTema() {
            const temaActual = htmlElement.getAttribute('data-theme');
            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', nuevoTema);

            const textoHtml = nuevoTema === 'light' 
                ? '<i class="fa-solid fa-moon" style="margin-right: 5px;"></i> Modo Oscuro' 
                : '<i class="fa-solid fa-sun" style="margin-right: 5px;"></i> Modo Claro';

            if (themeBtnW) themeBtnW.innerHTML = textoHtml;
            if (themeBtnMobile) themeBtnMobile.innerHTML = textoHtml;

            document.querySelectorAll('input[type="range"]').forEach(range => updateBackground(range));
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

        let num_carriles = 4;
        const colores_carriles = ["#ff4757", "#2ed573", "#ffa502", "#1e90ff", "#e056fd", "#00d2d3", "#f9ca24", "#ff6b81"];
        let y_linea_meta = 400;
        const radio_bola = 22;

        let notas = [];
        let puntaje = 0;
        let combo = 0;
        let ultimoTiempoSpawneo = 0;
        let intervalo_spawn = 1500;
        let velocidad_notas = 4;

        let renderWidth = 0, renderHeight = 0, offsetX = 0, offsetY = 0;

        function crearNota() {
            const carril = Math.floor(Math.random() * num_carriles);
            notas.push({
                carril: carril,
                x: carril * (canvas.width / num_carriles) + (canvas.width / num_carriles) / 2,
                y: -radio_bola,
                destruida: false
            });
        }

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
                    numHands: 2
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
                        y_linea_meta = canvas.height * 0.85;
                        textoEstado.textContent = "¡Empieza el juego! Pellizca las bolas al llegar abajo.";
                        buclePrincipal();
                    };
                }).catch((err) => {
                    textoEstado.textContent = "❌ Error de cámara.";
                    console.error(err);
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

        function buclePrincipal() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            calcularYDibujarVideoCubierto(video, ctx, canvas);

            for (let i = 0; i < num_carriles; i++) {
                const xInicio = i * (canvas.width / num_carriles);

                ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
                ctx.lineWidth = 2;
                ctx.strokeRect(xInicio, 0, (canvas.width / num_carriles), canvas.height);

                ctx.fillStyle = colores_carriles[i];
                ctx.globalAlpha = 0.25;
                ctx.fillRect(xInicio + 10, y_linea_meta - 25, (canvas.width / num_carriles) - 20, 50);
                ctx.globalAlpha = 1;

                ctx.strokeStyle = colores_carriles[i];
                ctx.lineWidth = 3;
                ctx.strokeRect(xInicio + 10, y_linea_meta - 25, (canvas.width / num_carriles) - 20, 50);
            }

            let tiempoActual = performance.now();

            if (tiempoActual - ultimoTiempoSpawneo > intervalo_spawn) {
                crearNota();
                ultimoTiempoSpawneo = tiempoActual;
            }

            for (let i = notas.length - 1; i >= 0; i--) {
                const nota = notas[i];
                nota.y += velocidad_notas;

                ctx.beginPath();
                ctx.arc(nota.x, nota.y, radio_bola, 0, 2 * Math.PI);
                ctx.fillStyle = colores_carriles[nota.carril];
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();

                if (nota.y > canvas.height + radio_bola) {
                    combo = 0;
                    notas.splice(i, 1);
                }
            }

            if (handLandmarker && video.currentTime !== ultimaHoraVideo) {
                ultimaHoraVideo = video.currentTime;
                let tiempoActualMs = performance.now();

                const resultados = handLandmarker.detectForVideo(video, tiempoActualMs);
                const indexDedoSeleccionado = parseInt(selectDedo.value);

                if (resultados.landmarks && resultados.landmarks.length > 0) {
                    for (let puntosMano of resultados.landmarks) {
                        const dedoSeleccionado = puntosMano[indexDedoSeleccionado];
                        const dedoPulgar = puntosMano[4];

                        const cursorX = offsetX + (dedoSeleccionado.x * renderWidth);
                        const cursorY = offsetY + (dedoSeleccionado.y * renderHeight);

                        const dx = (dedoSeleccionado.x - dedoPulgar.x) * renderWidth;
                        const dy = (dedoSeleccionado.y - dedoPulgar.y) * renderHeight;
                        const distancia = Math.sqrt(dx * dx + dy * dy);

                        let haceClick = distancia < 40;

                        ctx.beginPath();
                        ctx.arc(cursorX, cursorY, 16, 0, 2 * Math.PI);
                        ctx.fillStyle = haceClick ? "#ff3366" : "#58a6ff";
                        ctx.fill();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#ffffff";
                        ctx.stroke();

                        if (haceClick) {
                            for (let i = notas.length - 1; i >= 0; i--) {
                                const nota = notas[i];
                                const distCursorNota = Math.hypot(cursorX - nota.x, cursorY - nota.y);

                                if (distCursorNota < radio_bola + 25 && Math.abs(nota.y - y_linea_meta) < 65) {
                                    puntaje += 100 + (combo * 10);
                                    combo++;
                                    notas.splice(i, 1);

                                    ctx.beginPath();
                                    ctx.arc(nota.x, nota.y, radio_bola + 15, 0, 2 * Math.PI);
                                    ctx.strokeStyle = "#ffffff";
                                    ctx.lineWidth = 4;
                                    ctx.stroke();
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            textoEstado.textContent = `⭐ Puntaje: ${puntaje} | 🔥 Combo: x${combo}`;

            requestAnimationFrame(buclePrincipal);
        }

        inicializarModeloIA();
