"use client";

import { useRef, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  // Refs para as linhas do menu hamburguer
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { contextSafe } = useGSAP(() => {
    // 1. Animação de Entrada Inicial (Mantida do seu original)
    gsap.set(headerRef.current, {
      xPercent: -50,
      y: -150,
      autoAlpha: 0 
    });

    gsap.to(headerRef.current, {
      y: 0,
      autoAlpha: 1,
      duration: 1.2,
      ease: "power4.out",
      delay: 0.2
    });

    // 2. Criar a timeline do Menu Mobile (Pausada inicialmente)
    // Essa timeline expande o header e anima os itens internos
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });

    if (headerRef.current && mobileContentRef.current && line1Ref.current && line2Ref.current && line3Ref.current) {
        
        // A. Animação do Ícone (Vira X)
        tl.to(line2Ref.current, { scaleX: 0, opacity: 0, duration: 0.2 }, 0)
          .to(line1Ref.current, { y: 9, rotate: 45, duration: 0.3 }, 0)
          .to(line3Ref.current, { y: -9, rotate: -45, duration: 0.3 }, 0);

        // B. Expansão do Header
        tl.to(headerRef.current, {
            height: "auto", // GSAP calcula a altura necessária
            borderRadius: "32px", // Fica um pouco menos redondo expandido pra caber melhor
            backgroundColor: "rgba(20, 20, 20, 0.95)", // Mais opaco para leitura
            duration: 0.6,
            ease: "power3.inOut"
        }, 0);

        // C. Entrada do Conteúdo (Stagger)
        // Selecionamos os filhos diretos do container mobile para animar
        const mobileItems = mobileContentRef.current.children;
        tl.fromTo(mobileItems, 
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5 },
            "-=0.3"
        );
    }

    tlRef.current = tl;

  }, { scope: headerRef });

  const toggleMenu = contextSafe(() => {
    if (!tlRef.current) return;
    
    if (!isMenuOpen) {
        setIsMenuOpen(true);
        tlRef.current.play();
    } else {
        setIsMenuOpen(false);
        tlRef.current.reverse();
    }
  });

  return (
    <header className={styles.header} ref={headerRef}>
      
      {/* --- TOP BAR: Logo e Hamburger (Sempre visíveis ou controlados por CSS) --- */}
      <div className={styles.topBar}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/logo.png" 
                alt="Logo Conceito" 
                fill 
                priority 
                sizes="120px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </Link>

          {/* Botão Hamburger (Só aparece no mobile via CSS) */}
          <button className={styles.hamburger} onClick={toggleMenu} aria-label="Menu">
              <span ref={line1Ref} className={styles.line}></span>
              <span ref={line2Ref} className={styles.line}></span>
              <span ref={line3Ref} className={styles.line}></span>
          </button>
      </div>
      
      {/* --- DESKTOP NAV & ACTIONS (Somem no mobile via CSS) --- */}
      <nav className={styles.desktopNav}>
        <Link href="/" className={styles.navLink}>Início</Link>
        <Link href="/produtos" className={styles.navLink}>Produtos</Link>
        <Link href="/quem-somos" className={styles.navLink}>Quem somos</Link>
        <Link href="/contato" className={styles.navLink}>Contato</Link>
      </nav>

      <div className={styles.desktopActions}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Buscar..." 
            aria-label="Buscar produtos"
          />
          <button className={styles.iconButton} aria-label="Pesquisar">
             <Search size={18} color="#a1a1a1" />
          </button>
        </div>
        <button className={styles.cartButton} aria-label="Carrinho">
          <ShoppingCart className={styles.cartIcon} size={26} />
        </button>
      </div>

      {/* --- MOBILE CONTENT (Expande para baixo) --- */}
      <div className={styles.mobileContent} ref={mobileContentRef}>
          
          {/* 1. Busca */}
          <div className={styles.mobileSearch}>
              <Search size={20} color="#fff" />
              <input type="text" placeholder="O que você procura?" />
          </div>

          {/* 2. Carrinho (Com texto e ícone) */}
          <button className={styles.mobileCartBtn}>
              <ShoppingCart size={32} />
              <span>Carrinho</span>
              
          </button>

          {/* 3. Navegação Vertical */}
          <nav className={styles.mobileNav}>
            <Link href="/" className={styles.mobileNavLink} onClick={toggleMenu}>Início</Link>
            <Link href="/produtos" className={styles.mobileNavLink} onClick={toggleMenu}>Produtos</Link>
            <Link href="/quem-somos" className={styles.mobileNavLink} onClick={toggleMenu}>Quem somos</Link>
            <Link href="/contato" className={styles.mobileNavLink} onClick={toggleMenu}>Contato</Link>
          </nav>
      </div>

    </header>
  );
}