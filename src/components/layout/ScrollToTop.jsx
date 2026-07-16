import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Inyectar un estilo temporal para forzar scroll instantáneo global
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Ir al inicio de la página inmediatamente (0ms)
    window.scrollTo(0, 0);

    // 3. Forzar un reflow para que el navegador ejecute el scroll en este preciso instante
    document.documentElement.offsetHeight;

    // 4. Eliminar el estilo temporal para restaurar el comportamiento original de la página
    style.remove();
  }, [pathname]);

  return null;
};

export default ScrollToTop;
