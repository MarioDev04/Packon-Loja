"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./categories.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: 1, name: "Stand-up", img: "/image4.png" },
  { id: 2, name: "Stand-up",  img: "/image5.png" },
  { id: 3, name: "Stand-up",  img: "/image6.png" },
  { id: 4, name: "Stand-up",  img: "/image7.png" },
  { id: 5, name: "Stand-up",  img: "/image8.png" },
  { id: 6, name: "Stand-up",  img: "/image9.png" },
];

export default function Categories() {
  const [activeId, setActiveId] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const verticalTextRef = useRef<(HTMLDivElement | null)[]>([]);
  const expandedContentRef = useRef<(HTMLDivElement | null)[]>([]);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleClick = contextSafe((id: number) => {
    if (id === activeId) return;
    setActiveId(id);

    // 1. Accordion Effect
    panelsRef.current.forEach((panel, idx) => {
      if (!panel) return;
      const isActive = CATEGORIES[idx].id === id;

      gsap.to(panel, {
        flexGrow: isActive ? 4 : 1,
        duration: 0.8,
        ease: "power3.inOut"
      });
    });

    // 2. Text Animations
    CATEGORIES.forEach((_, idx) => {
      const isActive = CATEGORIES[idx].id === id;
      const vText = verticalTextRef.current[idx];
      const eContent = expandedContentRef.current[idx];

      if (isActive) {
        // ABRINDO: Esconde texto do topo, mostra conteúdo do fundo
        gsap.to(vText, { opacity: 0, duration: 0.3 });
        
        // Stagger interno para titulo, desc e botão
        gsap.to(eContent, { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          delay: 0.35, 
          ease: "power2.out" 
        });
      } else {
        // FECHANDO: Mostra texto do topo, esconde conteúdo do fundo
        gsap.to(vText, { 
            opacity: 1, 
            duration: 0.5, 
            delay: 0.4 
        });
        
        gsap.to(eContent, { 
            opacity: 0, 
            y: 20, 
            duration: 0.3 
        });
      }
    });
  });

  // Setup Inicial
  useEffect(() => {
    CATEGORIES.forEach((cat, idx) => {
      const isActive = cat.id === activeId;
      const panel = panelsRef.current[idx];
      const vText = verticalTextRef.current[idx];
      const eContent = expandedContentRef.current[idx];

      if(panel) gsap.set(panel, { flexGrow: isActive ? 4 : 1 });
      if(vText) gsap.set(vText, { opacity: isActive ? 0 : 1 });
      if(eContent) gsap.set(eContent, { opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 });
    });
  }, []);

  return (
    <section className={styles.section} ref={containerRef}>
      
      <ScrollReveal className={styles.header}>
        <h2 className={styles.title}>
          Categorias
        </h2>
      </ScrollReveal>

      <ScrollReveal className={styles.container} stagger={0.1}>
        {CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            className={`${styles.panel} ${activeId === cat.id ? styles.active : ''}`}
            ref={(el) => { if (el) panelsRef.current[index] = el }}
            onClick={() => handleClick(cat.id)}
          >
            {/* Imagem + Overlay de Sombra */}
            <div className={styles.imageWrapper}>
               <img src={cat.img} alt={cat.name} className={styles.bgImage} />
               {/* A sombra gradiente está aqui: */}
               <div className={styles.overlay}></div>
            </div>

            {/* Texto Vertical (Topo) - Visível quando FECHADO */}
            <div 
                className={styles.verticalLabel}
                ref={(el) => { if (el) verticalTextRef.current[index] = el }}
            >
                {cat.name}
            </div>

            {/* Conteúdo Expandido (Fundo) - Visível quando ABERTO */}
            <div 
                className={styles.expandedContent}
                ref={(el) => { if (el) expandedContentRef.current[index] = el }}
            >
                <h3 className={styles.categoryTitle}>{cat.name}</h3>
            </div>
            
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}