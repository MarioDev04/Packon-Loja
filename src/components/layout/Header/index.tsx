"use client";

import { useRef } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Importando Image otimizado
import styles from "./header.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Mantive sua lógica GSAP original pois ela está correta para centralização
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
  }, { scope: headerRef });

  return (
    <header className={styles.header} ref={headerRef}>
      {/* 1. Logo agora é clicável e otimizado */}
      <Link href="/" className={styles.logoLink}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/logo.png" 
            alt="Logo Conceito" 
            fill // Ocupa o wrapper pai
            priority // Carregamento instantâneo
            sizes="120px"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </Link>
      
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Início</Link>
        <Link href="/produtos" className={styles.navLink}>Produtos</Link>
        <Link href="/quem-somos" className={styles.navLink}>Quem somos</Link>
        <Link href="/contato" className={styles.navLink}>Contato</Link>
      </nav>

      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Buscar..." // Boa prática de UX
            aria-label="Buscar produtos"
          />
          <button className={styles.iconButton} aria-label="Pesquisar">
             <Search size={18} color="#a1a1a1" />
          </button>
        </div>

        {/* Botão semântico para o carrinho */}
        <button className={styles.cartButton} aria-label="Carrinho de compras">
          <ShoppingCart className={styles.cartIcon} size={26} />
          {/* Opcional: Badge de contagem poderia vir aqui no futuro */}
        </button>
      </div>
    </header>
  );
}