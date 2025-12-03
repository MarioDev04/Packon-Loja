"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Minus, Plus, ArrowRight } from "lucide-react";
import styles from "./productView.module.css";
import { formatPrice } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ProductViewProps {
  product: any;
}

export default function ProductView({ product }: ProductViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const { addItem, openCart } = useCartStore();

  // --- ESTADOS ---
  const [selectedImage, setSelectedImage] = useState(product.images.edges[0]?.node.url);
  const [qty, setQty] = useState(500); 
  const [loading, setLoading] = useState(false);
  const [cep, setCep] = useState("");
  const [shippingResult, setShippingResult] = useState<string | null>(null);

  // Variantes
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    const initialVariant = product.variants.edges.find((v: any) => v.node.availableForSale)?.node 
                           || product.variants.edges[0]?.node;

    if (initialVariant) {
      const initialOptions: Record<string, string> = {};
      initialVariant.selectedOptions.forEach((opt: any) => {
        initialOptions[opt.name] = opt.value;
      });
      setSelectedOptions(initialOptions);
      setCurrentVariant(initialVariant);
      if(initialVariant.image?.url) {
        setSelectedImage(initialVariant.image.url);
      }
    }
  }, [product]);

  // --- ANIMAÇÃO DE TROCA DE IMAGEM ---
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleImageClick = contextSafe((newUrl: string) => {
    if (newUrl === selectedImage) return;

    gsap.to(mainImageRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        setSelectedImage(newUrl);
        gsap.to(mainImageRef.current, { opacity: 1, duration: 0.2 });
      }
    });
  });

  // --- HANDLERS ---
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const matchedVariant = product.variants.edges.find(({ node }: any) => {
      return node.selectedOptions.every((opt: any) => {
        return newOptions[opt.name] === opt.value;
      });
    })?.node;

    setCurrentVariant(matchedVariant || null);
  };

  const handleAddToCart = async () => {
    if (!currentVariant || !currentVariant.availableForSale) return;
    setLoading(true);
    await addItem(currentVariant.id, qty);
    setLoading(false);
    openCart(); 
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if(cep.length < 8) return;
    setShippingResult("Calculando...");
    setTimeout(() => {
        setShippingResult("Frete Grátis - Chega em 3 dias");
    }, 1000);
  };

  if (!product) return null;

  return (
    <section className={styles.container} ref={containerRef}>
      
      <div className={styles.topSection}>
        
        {/* --- CONTAINER ESQUERDA (IMAGEM) --- */}
        <div className={styles.imageContainer}>
            <div className={styles.mainImageWrapper}>
              <Image 
                ref={mainImageRef}
                src={selectedImage} 
                alt={product.title} 
                fill 
                priority
                className={styles.mainImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className={styles.thumbnailsRow}>
              {product.images.edges.map(({ node }: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbBox} ${selectedImage === node.url ? styles.thumbActive : ''}`}
                  onClick={() => handleImageClick(node.url)}
                >
                  <Image src={node.url} alt="Thumb" fill className={styles.thumbImg} sizes="80px" />
                </div>
              ))}
            </div>
        </div>

        {/* --- CONTAINER DIREITA (INFOS) --- */}
        <div className={styles.infoContainer}>
            
            <h1 className={styles.title}>{product.title}</h1>
            
            <div className={styles.priceWrapper}>
                <span className={styles.priceValue}>
                {currentVariant 
                    ? formatPrice(currentVariant.price.amount, currentVariant.price.currencyCode)
                    : "..."
                }
                </span>
            </div>

            {/* --- LINHA DE CONTROLE (OPÇÕES + QUANTIDADE) --- */}
            {/* O flex-wrap aqui garante que fiquem na mesma linha e quebrem se precisar */}
            <div className={styles.controlsRow}>
                
                {/* 1. Opções do Shopify (Ex: Expessura) */}
                {product.options.map((option: any) => (
                    option.name !== "Title" && (
                        <div key={option.name} className={styles.controlGroup}>
                            <span className={styles.controlLabel}>{option.name}:</span>
                            <div className={styles.pillsWrapper}>
                                {option.values.map((value: string) => {
                                    const isActive = selectedOptions[option.name] === value;
                                    return (
                                        <button
                                            key={value}
                                            className={`${styles.pillBtn} ${isActive ? styles.pillBtnActive : ''}`}
                                            onClick={() => handleOptionChange(option.name, value)}
                                        >
                                            {value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                ))}

                {/* 2. Seletor de Quantidade (Agora é irmão das opções) */}
                <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Quantidade:</span>
                    <div className={styles.qtyPill}>
                        <button onClick={() => setQty(q => Math.max(100, q - 100))}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(q => q + 100)} className={styles.hiddenBtn}>+</button> 
                        {/* Nota: No design parece ser um botão único "- 500 +", 
                            mas funcionalmente precisamos de áreas de clique. 
                            Fiz um ajuste visual no CSS para parecer um bloco só. */}
                    </div>
                </div>

            </div>

            {/* --- FRETE --- */}
            <div className={styles.shippingSection}>
                <span className={styles.sectionLabel}>Calcular frete</span>
                <form onSubmit={handleCalculateShipping} className={styles.shippingForm}>
                    <input 
                        type="text" 
                        placeholder="Insira seu cep..." 
                        className={styles.shippingInput}
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        maxLength={9}
                    />
                    <button type="submit" className={styles.shippingBtn}>
                        Calcular <ArrowRight size={16} />
                    </button>
                </form>
                {shippingResult && <p className={styles.shippingResult}>{shippingResult}</p>}
            </div>

            {/* --- BOTÃO CARRINHO --- */}
            <button 
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={!currentVariant?.availableForSale || loading}
            >
                {loading ? "Adicionando..." : "Adicionar no carrinho"}
                {!loading && <ArrowRight size={26} />}
            </button>

        </div>
      </div>

    </section>
  );
}