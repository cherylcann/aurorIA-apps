const htmlElement = document.documentElement;
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");
        
        const themeBtnW = document.getElementById("themeBtnW");
        const themeBtnMobile = document.getElementById("themeBtnMobile");

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
