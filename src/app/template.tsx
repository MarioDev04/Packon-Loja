// src/app/template.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./template.module.css";

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Garante que o scroll comece no topo (útil para Lenis + Transitions)
    window.scrollTo(0, 0);

    // ANIMAÇÃO DE ENTRADA "CINEMATOGRÁFICA"
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 40,            // Começa 40px abaixo
          filter: "blur(12px)", // Começa bem desfocado
          scale: 0.98,      // Levemente menor para dar profundidade
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.8,    // Tempo "premium" (nem muito rápido, nem lento)
          ease: "power3.out", // Curva suave no final
          delay: 0.1,       // Pequeno respiro para o navegador renderizar o layout
          clearProps: "all" // Limpa os estilos inline do GSAP ao terminar
        }
      );
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={styles.transitionContainer}>
      {children}
    </div>
  );
}