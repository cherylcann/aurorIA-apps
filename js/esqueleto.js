import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/+esm";

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

        function cambiarTema() {
            const temaActual = htmlElement.getAttribute('data-theme');
            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', nuevoTema);

            const textoHtml = nuevoTema === 'light' 
                ? '<i class="fa-solid fa-moon" style="margin-right: 5px;"></i> Modo Oscuro' 
                : '<i class="fa-solid fa-sun" style="margin-right: 5px;"></i> Modo Claro';

            if (themeBtnW) themeBtnW.innerHTML = textoHtml;
            if (themeBtnMobile) themeBtnMobile.innerHTML = textoHtml;
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

        const inputPointColor = document.getElementById("point-color");
        const pointColorValue = document.getElementById("point-color-value");
        const inputLineColor = document.getElementById("line-color");
        const lineColorValue = document.getElementById("line-color-value");

        let punto = "#58a6ff";
        let linea = "#ffffff";

        inputPointColor.addEventListener("input", (e) => {
            pointColorValue.textContent = e.target.value;
            punto = e.target.value;
        });

        inputLineColor.addEventListener("input", (e) => {
            lineColorValue.textContent = e.target.value;
            linea = e.target.value;
        });

        const video = document.getElementById("webcam");
        const canvas = document.getElementById("output_canvas");
        const ctx = canvas.getContext("2d");
        const textoEstado = document.getElementById("estado");

        let handLandmarker = undefined;
        let ultimaHoraVideo = -1;

        let renderWidth = 0, renderHeight = 0, offsetX = 0, offsetY = 0;

        const conexiones_mano = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
        ];

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
                console.log(error);
            }
        }

        function iniciarCamara() {
            navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
                .then((stream) => {
                    video.srcObject = stream;

                    video.onloadeddata = () => {
                        ajustarResolucionCanvas();
                        textoEstado.textContent = "🟢 Cámara y IA activas, muestra tu mano.";
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

            if (handLandmarker && video.currentTime !== ultimaHoraVideo) {
                ultimaHoraVideo = video.currentTime;
                let tiempoActualMs = performance.now();

                const resultados = handLandmarker.detectForVideo(video, tiempoActualMs);

                if (resultados.landmarks && resultados.landmarks.length > 0) {
                    resultados.landmarks.forEach((puntosMano) => {
                        ctx.strokeStyle = linea;
                        ctx.lineWidth = 4;

                        conexiones_mano.forEach(([inicio, fin]) => {
                            const p1 = puntosMano[inicio];
                            const p2 = puntosMano[fin];

                            const x1 = offsetX + (p1.x * renderWidth);
                            const y1 = offsetY + (p1.y * renderHeight);
                            const x2 = offsetX + (p2.x * renderWidth);
                            const y2 = offsetY + (p2.y * renderHeight);

                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        });

                        ctx.fillStyle = punto;

                        puntosMano.forEach((puntoMano) => {
                            const x = offsetX + (puntoMano.x * renderWidth);
                            const y = offsetY + (puntoMano.y * renderHeight);

                            ctx.beginPath();
                            ctx.arc(x, y, 6, 0, 2 * Math.PI);
                            ctx.fill();
                        });
                    });

                    textoEstado.textContent = "Manos detectadas";
                } else {
                    textoEstado.textContent = "Buscando manos...";
                }
            }

            requestAnimationFrame(buclePrincipal);
        }

        inicializarModeloIA();
