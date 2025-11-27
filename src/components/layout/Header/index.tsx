"use client";

import { useRef } from "react";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import styles from "./header.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // 1. Definição Inicial (Set):
    // Garante que o elemento esteja centralizado horizontalmente (xPercent: -50)
    // E invisível/acima da tela antes de começar
    gsap.set(headerRef.current, {
      xPercent: -50, // Substitui o translateX(-50%) do CSS
      y: -150,       // Sobe 150px (fora da tela)
      autoAlpha: 0   // Opacity: 0 + Visibility: hidden (evita bugs de clique)
    });

    // 2. Animação (To):
    // Desce para a posição original (y: 0) mantendo o centro
    gsap.to(headerRef.current, {
      y: 0,
      autoAlpha: 1, // Restaura opacidade e visibilidade
      duration: 1.2,
      ease: "power4.out",
      delay: 0.2
    });
  }, { scope: headerRef });

  return (
    <header className={styles.header} ref={headerRef}>
      <div className={styles.logo}><img src="/logo.png" alt="Logo" /></div>
      
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Início</Link>
        <Link href="/produtos" className={styles.navLink}>Produtos</Link>
        <Link href="/quem-somos" className={styles.navLink}>Quem somos</Link>
        <Link href="/contato" className={styles.navLink}>Contato</Link>
      </nav>

      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <input type="text" className={styles.searchInput} />
          <Search size={18} color="#a1a1a1" />
        </div>
        <ShoppingCart className={styles.icon} size={24} />
      </div>
    </header>
  );
}