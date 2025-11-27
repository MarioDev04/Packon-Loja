"use client";

import { useState, useRef } from "react";
import styles from "./categories.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const CATEGORIES = [
  { id: 1, name: "Stand-up", img: "/image4.png" },
  { id: 2, name: "Pouch",  img: "/image5.png" },
  { id: 3, name: "Vácuo",  img: "/image6.png" },
  { id: 4, name: "Laminada",  img: "/image7.png" },
  { id: 5, name: "Sustentável",  img: "/image8.png" },
  { id: 6, name: "Flow Pack",  img: "/image9.png" },
];

export default function Categories() {
  // Começa com o ID 1 ativo
  const [activeId, setActiveId] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLHeadingElement | null)[]>([]);

  const { contextSafe } = useGSAP({ scope: containerRef }, []);

  // Configuração Inicial (Roda apenas uma vez ao montar)
  useGSAP(() => {
    CATEGORIES.forEach((cat, idx) => {
      const isActive = cat.id === activeId;
      const panel = panelsRef.current[idx];
      const text = textsRef.current[idx];

      if (panel && text) {
        // Define estado inicial sem animar (set)
        gsap.set(panel, { flexGrow: isActive ? 4 : 1 });
        
        gsap.set(text, {
          top: isActive ? "15%" : "50%",
          rotate: isActive ? 0 : -90, // Usamos 'rotate' que é mais moderno que 'rotation'
          color: isActive ? "#ffffff" : "#fff" // Opcional: escurece um pouco os inativos
        });
      }
    });
  }, { scope: containerRef }); // Roda uma vez na montagem

  const handleClick = contextSafe((id: number) => {
    if (id === activeId) return;
    setActiveId(id);

    CATEGORIES.forEach((cat, idx) => {
      const isActive = cat.id === id;
      const panel = panelsRef.current[idx];
      const text = textsRef.current[idx];

      if (!panel || !text) return;

      // --- 1. Animação "Líquida" do Painel ---
      gsap.to(panel, {
        flexGrow: isActive ? 4 : 1,
        duration: 0.8,
        ease: "power3.inOut", // Suave no início e fim
        overwrite: "auto"
      });

      // --- 2. Animação "Líquida" do Texto ---
      // Aqui acontece a mágica: Rotação e Posição simultâneas
      gsap.to(text, {
        top: isActive ? "15%" : "50%",
        rotate: isActive ? 0 : -90,
        
        // Pequeno ajuste de cor para dar destaque ao ativo
        color: isActive ? "#ffffff" : "rgb(255,255,255)", 
        
        duration: 0.8,
        ease: "power3.inOut", // Sincronizado com o painel
        overwrite: "auto"
      });
    });
  });

  return (
    <section className={styles.section} ref={containerRef}>
      
      <ScrollReveal className={styles.header}>
        <h2 className={styles.title}>Categorias</h2>
      </ScrollReveal>

      <ScrollReveal className={styles.container} stagger={0.1}>
        {CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            // Removemos a classe 'active' do HTML para não causar conflito CSS vs GSAP
            className={styles.panel} 
            ref={(el) => { if (el) panelsRef.current[index] = el }}
            onClick={() => handleClick(cat.id)}
          >
            <div className={styles.imageWrapper}>
               <img src={cat.img} alt={cat.name} className={styles.bgImage} />
               <div className={styles.overlay}></div>
            </div>

            <h3 
              className={styles.floatingLabel}
              ref={(el) => { if (el) textsRef.current[index] = el }}
            >
              {cat.name}
            </h3>
            
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}