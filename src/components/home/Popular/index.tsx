"use client";

import styles from "./popular.module.css";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PRODUCTS = [
  { id: 1, name: "stand-up pouch", price: "R$ 189,90", img: "/stand-up.png" },
  { id: 2, name: "stand-up pouch", price: "R$ 99,90", img: "/stand-up.png" },
  { id: 3, name: "stand-up pouch", price: "R$ 129,90", img: "/stand-up.png" },
  { id: 4, name: "stand-up pouch", price: "R$ 89,90", img: "/stand-up.png" },
  { id: 5, name: "stand-up pouch", price: "R$ 49,90", img: "/stand-up.png" },
  { id: 6, name: "stand-up pouch", price: "R$ 19,90", img: "/stand-up.png" },
  { id: 7, name: "stand-up pouch", price: "R$ 69,90", img: "/stand-up.png" },
  { id: 8, name: "stand-up pouch", price: "R$ 79,90", img: "/stand-up.png" },
  { id: 9, name: "stand-up pouch", price: "R$ 59,90", img: "/stand-up.png" },
];

export default function Popular() {
  return (
    <section className={styles.popularSection}>
      
      <ScrollReveal className={styles.header}>
        <h2 className={styles.title}>Produtos em destaque</h2>
      </ScrollReveal>

      {/* Aplicamos o ScrollReveal diretamente no Grid */}
      <ScrollReveal className={styles.gridContainer} stagger={0.1}>
        {PRODUCTS.map((product) => (
          <div key={product.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img src={product.img} alt={product.name} className={styles.productImg} />
            </div>

            <div className={styles.info}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.price}>{product.price}</p>
            </div>

            <button className={styles.buyButton}>
              Comprar
            </button>
          </div>
        ))}
      </ScrollReveal>

    </section>
  );
}