// src/components/catalog/CatalogWrapper.tsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./catalog.module.css";
import { formatPrice } from "@/utils/format";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomSelect from "./CustomSelect"; // Certifique-se de que este arquivo existe na mesma pasta

interface CatalogWrapperProps {
  initialProducts: any[];
}

export default function CatalogWrapper({ initialProducts }: CatalogWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS ---
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortOption, setSortOption] = useState<string>("recent");
  
  // Lista de produtos filtrados que será exibida
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  // --- 1. Extração Dinâmica de Tipos de Embalagem ---
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    initialProducts.forEach(({ node }) => {
      if (node.productType) {
        types.add(node.productType);
      }
    });
    // Garante que "Todos" seja sempre a primeira opção
    return ["Todos", ...Array.from(types)];
  }, [initialProducts]);

  // --- 2. Cálculo do Preço Máximo Real (Para o Slider) ---
  const limitPrice = useMemo(() => {
    let max = 0;
    initialProducts.forEach(({ node }) => {
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      if (price > max) max = price;
    });
    // Se não tiver preço, define um padrão de 100 só para não quebrar
    return Math.ceil(max) || 100;
  }, [initialProducts]);
  
  // Atualiza o filtro de preço inicial para o máximo possível ao carregar
  useEffect(() => { 
    setMaxPrice(limitPrice); 
  }, [limitPrice]);

  // --- 3. Cálculo da Porcentagem para o Slider (Visual) ---
  // Isso cria o efeito da barra branca preenchendo a barra transparente
  const progressPercent = limitPrice > 0 ? (maxPrice / limitPrice) * 100 : 0;

  // --- LÓGICA DE FILTRAGEM E ORDENAÇÃO ---
  const handleFilter = () => {
    // 1. Filtra
    let result = initialProducts.filter(({ node }) => {
      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      
      const matchesType = selectedType === "Todos" || node.productType === selectedType;
      const matchesPrice = price <= maxPrice;
      
      return matchesType && matchesPrice;
    });

    // 2. Ordena
    if (sortOption === "price_asc") {
      result.sort((a, b) => 
        parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount)
      );
    } else if (sortOption === "price_desc") {
      result.sort((a, b) => 
        parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount)
      );
    }
    // "recent" mantém a ordem original do array (que veio do Shopify)

    // 3. Animação de Saída dos Cards Antigos -> Atualização -> Entrada dos Novos
    const cards = document.querySelectorAll(`.${styles.card}`);
    
    if (cards.length > 0) {
      gsap.to(cards, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setFilteredProducts(result);
          // O useGSAP abaixo detectará a mudança no filteredProducts e fará a entrada
        }
      });
    } else {
      // Se não tinha cards (estava vazio), apenas atualiza
      setFilteredProducts(result);
    }
  };

  // --- ANIMAÇÃO DE ENTRADA (Sempre que a lista muda) ---
  useGSAP(() => {
    gsap.fromTo(`.${styles.card}`, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.05, 
        ease: "power2.out",
        clearProps: "all" 
      }
    );
  }, { scope: containerRef, dependencies: [filteredProducts] });

  // Opções para o Select Customizado
  const sortOptions = [
    { label: "Mais recentes", value: "recent" },
    { label: "Menor preço", value: "price_asc" },
    { label: "Maior preço", value: "price_desc" }
  ];

  return (
    <div className={styles.contentWrapper} ref={containerRef}>
      
      {/* --- SIDEBAR (FILTROS) --- */}
      <aside className={styles.sidebar}>
        
        {/* 1. ORDENAR POR (Select Customizado que Expande) */}
        <div className={styles.filterGroup}>
          <label className={styles.filterTitle}>Ordenar por:</label>
          {/* Componente que criamos anteriormente */}
          <CustomSelect 
            options={sortOptions} 
            value={sortOption} 
            onChange={setSortOption} 
          />
        </div>

        {/* 2. TIPOS DE EMBALAGEM (Botões Pills) */}
        <div className={styles.filterGroup}>
          <label className={styles.filterTitle}>Tipos de embalagem:</label>
          <div className={styles.typesList}>
            {availableTypes.map((type) => (
              <button
                key={type}
                className={`${styles.typeButton} ${selectedType === type ? styles.typeButtonActive : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 3. PREÇO (Slider Customizado Transparente/Branco) */}
        <div className={styles.filterGroup}>
          <div className={styles.priceHeader}>
             <label className={styles.filterTitle}>Preço:</label>
          </div>
          
          <div className={styles.priceFilterContainer}>
             <span className={styles.priceLabelMin}>{formatPrice(maxPrice.toString())}</span>
             
             {/* INPUT RANGE CUSTOMIZADO */}
             <input 
                type="range" 
                min="0" 
                max={limitPrice} 
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className={styles.rangeInput}
                style={{
                  // CRUCIAL: Isso cria o preenchimento branco dinâmico
                  backgroundImage: `linear-gradient(to right, #ffffff ${progressPercent}%, transparent ${progressPercent}%)`
                }}
             />
             
             {/* Opcional: Mostra o valor máximo ao lado se quiser, ou deixa só a label abaixo */}
          </div>
        </div>

        {/* 4. BOTÃO DE AÇÃO (Filtra de verdade) */}
        <button className={styles.filterButton} onClick={handleFilter}>
          Filtrar
        </button>

      </aside>

      {/* --- GRID DE PRODUTOS --- */}
      <div className={styles.productsGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(({ node }: any) => {
             const image = node.images.edges[0]?.node;
             const price = node.priceRange.minVariantPrice;

             return (
               <Link href={`/produtos/${node.handle}`} key={node.id} className={styles.card}>
                 
                 {/* Imagem do Produto */}
                 <div className={styles.imageWrapper}>
                   {image ? (
                     <Image 
                       src={image.url} 
                       alt={image.altText || node.title}
                       fill
                       sizes="(max-width: 768px) 100vw, 33vw"
                       className={styles.productImage}
                     />
                   ) : (
                     <div style={{width:'100%', height:'100%', background:'#111', borderRadius: '20px'}}></div>
                   )}
                 </div>
                 
                 {/* Informações */}
                 <div className={styles.info}>
                    <h3 className={styles.productTitle}>{node.title}</h3>
                    <p className={styles.productPrice}>
                      {formatPrice(price.amount, price.currencyCode)}
                    </p>
                    <button className={styles.buyButton}>
                      Comprar
                    </button>
                 </div>
               </Link>
             )
          })
        ) : (
          <div className={styles.noResults}>
            <p>Nenhum produto encontrado com esses filtros.</p>
          </div>
        )}
      </div>

    </div>
  );
}