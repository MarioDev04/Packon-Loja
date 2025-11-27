"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./hero.module.css";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  { id: 1, img: "/image4.png" },
  { id: 2, img: "/image5.png" },
  { id: 3, img: "/image6.png" },
  { id: 4, img: "/image2.png" },
  { id: 5, img: "/image7.png" },
  { id: 6, img: "/image8.png" },
  { id: 7, img: "/image9.png" },
];

const DATA = [...SLIDES, ...SLIDES, ...SLIDES, ...SLIDES, ...SLIDES, ...SLIDES]; 

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Refs para animação de entrada garantida
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    // --------------------------------------------------------
    // 1. ANIMAÇÃO DE ENTRADA (Intro Timeline)
    // --------------------------------------------------------
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Usando refs diretos para evitar que elementos "sumam" por erro de seletor
    if (titleRef.current && subtitleRef.current && carouselContainerRef.current && buttonRef.current) {
        
        tl.from(titleRef.current, {
          y: 50, // Pode reduzir um pouco o Y já que o layout é mais apertado
          opacity: 0,
          filter: "blur(10px)",
          duration: 1,
          delay: 0.2 // Reduzi o delay inicial para ser mais ágil
        })
        .from(subtitleRef.current, {
          y: 30,
          opacity: 0,
          filter: "blur(5px)",
          duration: 0.8
        }, "-=0.6")
        .from(carouselContainerRef.current, {
          y: 100,
          opacity: 0,
          scale: 0.95,
          duration: 1.2,
          ease: "power4.out"
        }, "-=0.6")
        .from(buttonRef.current, {
          y: 20,
          opacity: 0, // Se algo der errado, ele começa invisível, mas...
          duration: 0.6,
          clearProps: "all" // ...isso garante que ao final o GSAP limpe o estilo inline e ele reapareça
        }, "-=0.8");
    }

    // --------------------------------------------------------
    // 2. LÓGICA DO CARROSSEL 3D
    // --------------------------------------------------------
    const cards = cardsRef.current.filter(Boolean);
    if (cards.length === 0) return;

    const cardWidth = 280; 
    const gap = 0; 
    const spacing = cardWidth + gap; 
    const totalWidth = cards.length * spacing;

    const duration = 150; 

    const proxy = { x: 0 };
    
    gsap.to(proxy, {
      x: -totalWidth,
      duration: duration,
      ease: "none",
      repeat: -1
    });

    const wrapFunc = gsap.utils.wrap(0, totalWidth);

    const updateCards = () => {
      const centerX = window.innerWidth / 2;

      cards.forEach((card, i) => {
        if(!card) return;

        const rawX = (i * spacing) + proxy.x;
        const x = wrapFunc(rawX) - totalWidth / 2; 
        
        const visualX = x + (window.innerWidth / 2) + (cardWidth / 2);
        const distFromCenter = visualX - centerX;
        
        const val = distFromCenter / window.innerWidth;

        // Efeitos
        const rotateY = val * -85; 
        const translateZ = -250 + (Math.abs(val) * 1000);
        const zIndex = Math.round(translateZ + 2000);

        card.style.transform = `
          translate3d(${x}px, -50%, 0) 
          perspective(1250px) 
          translateZ(${translateZ}px) 
          rotateY(${rotateY}deg)
        `;
        card.style.zIndex = zIndex.toString();
        card.style.opacity = '1'; 
      });
    };

    gsap.ticker.add(updateCards);

    return () => {
      gsap.ticker.remove(updateCards);
    };

  }, { scope: containerRef });

  return (
    <section className={styles.heroSection} ref={containerRef}>
      <div className={styles.content}>
        <h1 className={styles.title} ref={titleRef}>
          A embalagem que vende<br />por você.
        </h1>
        <p className={styles.subtitle} ref={subtitleRef}>
          Embale com propósito: mais presença, mais valor percebido e mais vendas.
        </p>
      </div>

      <div className={styles.carouselContainer} ref={carouselContainerRef}>
        <div className={styles.cardsWrapper}> 
          {DATA.map((item, index) => (
            <div 
              key={index}
              className={styles.card}
              ref={(el) => { if (el) cardsRef.current[index] = el }}
            >
               <img src={item.img} alt="Embalagem" className={styles.cardImage} />
            </div>
          ))}
        </div>
      </div>

      <button className={styles.ctaButton} ref={buttonRef}>
        Faça seu orçamento <ArrowRight size={22} />
      </button>
    </section>
  );
}