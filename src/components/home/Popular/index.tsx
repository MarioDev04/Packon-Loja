"use client";

import styles from "./popular.module.css";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/utils/format";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore"; // <--- Importamos a store

// Tipagem atualizada com Variants
interface ProductNode {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        url: string;
        altText: string;
      };
    }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
      };
    }[];
  };
}

interface PopularProps {
  products: {
    node: ProductNode;
  }[];
}

export default function Popular({ products }: PopularProps) {
  const { addItem, openCart } = useCartStore(); // <--- Pegamos as funções

  if (!products || products.length === 0) {
    return null; 
  }

  const handleAddToCart = async (variantId: string) => {
    // 1. Adiciona ao carrinho
    await addItem(variantId, 1);
    // 2. Abre o carrinho para mostrar que funcionou (Opcional, mas recomendado)
    openCart(); 
  };

  return (
    <section className={styles.popularSection}>
      
      <ScrollReveal className={styles.header}>
        <h2 className={styles.title}>Produtos em destaque</h2>
      </ScrollReveal>

      <ScrollReveal className={styles.gridContainer} stagger={0.1}>
        {products.map(({ node: product }) => {
          const image = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;
          
          // Pegamos a primeira variante disponível (Padrão)
          const firstVariant = product.variants?.edges[0]?.node;
          const isAvailable = firstVariant?.availableForSale;

          return (
            <div key={product.id} className={styles.card}>
              <Link href={`/produtos/${product.handle}`} className={styles.imageContainer}>
                 {image ? (
                    <img 
                      src={image.url} 
                      alt={image.altText || product.title} 
                      className={styles.productImg} 
                    />
                 ) : (
                   <div className={styles.productImg} style={{background: '#222', width: '100%', height: '100%'}} />
                 )}
              </Link>

              <div className={styles.info}>
                <h3 className={styles.productName}>{product.title}</h3>
                <p className={styles.price}>
                  {formatPrice(price.amount, price.currencyCode)}
                </p>
              </div>

              <button 
                className={styles.buyButton}
                onClick={() => firstVariant && handleAddToCart(firstVariant.id)}
                disabled={!isAvailable} // Desativa se não tiver estoque
                style={{ opacity: isAvailable ? 1 : 0.5, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
              >
                {isAvailable ? 'Comprar' : 'Indisponível'}
              </button>
            </div>
          );
        })}
      </ScrollReveal>

    </section>
  );
}