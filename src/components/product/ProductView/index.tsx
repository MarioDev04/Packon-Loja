"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowRight, Loader2, Check, ShoppingBag } from "lucide-react"; // Adicionei Check e ShoppingBag
import styles from "./productView.module.css";
import { formatPrice } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface ProductViewProps {
  product: any;
}

export default function ProductView({ product }: ProductViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { addItem, openCart } = useCartStore();

  // --- ESTADOS ---
  const [selectedImage, setSelectedImage] = useState(product.images.edges[0]?.node.url);
  const [qty, setQty] = useState(100); 
  
  // Estados de Loading e Feedback do Botão
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Estados de CEP
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingResult, setShippingResult] = useState<string | null>(null);

  // Estados de Variante
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);

  // Estados de Zoom
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // --- 1. INICIALIZAÇÃO INTELIGENTE ---
  useEffect(() => {
    const variantIdFromUrl = searchParams.get('variant');
    let targetVariant;

    if (variantIdFromUrl) {
      targetVariant = product.variants.edges.find((v: any) => v.node.id === variantIdFromUrl)?.node;
    }

    if (!targetVariant) {
      // Prioriza variante disponivel ou pega a primeira
      targetVariant = product.variants.edges.find((v: any) => v.node.availableForSale)?.node 
                      || product.variants.edges[0]?.node;
    }

    if (targetVariant) {
      setCurrentVariant(targetVariant);
      const newOptions: Record<string, string> = {};
      targetVariant.selectedOptions.forEach((opt: any) => {
        newOptions[opt.name] = opt.value;
      });
      setSelectedOptions(newOptions);

      // Só troca imagem se a variante tiver uma imagem específica diferente da capa
      if(targetVariant.image?.url) {
        setSelectedImage(targetVariant.image.url);
      }
    }
  }, [product, searchParams]);

  // --- 2. VERIFICAÇÃO DE OPÇÕES VÁLIDAS ---
  const isOptionValid = (optionName: string, value: string) => {
    return product.variants.edges.some(({ node }: any) => {
       const hasValue = node.selectedOptions.some((opt: any) => opt.name === optionName && opt.value === value);
       if (!hasValue) return false;

       // Verifica compatibilidade com as OUTRAS opções já selecionadas
       const isCompatible = node.selectedOptions.every((opt: any) => {
         if (opt.name === optionName) return true;
         return selectedOptions[opt.name] === opt.value;
       });

       return isCompatible && node.availableForSale;
    });
  };

  // --- 3. ANIMAÇÕES ---
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleImageChangeAnim = contextSafe((newUrl: string) => {
    if (newUrl === selectedImage) return;
    
    // Efeito suave de Crossfade
    gsap.to(mainImageRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => {
        setSelectedImage(newUrl);
        gsap.to(mainImageRef.current, { opacity: 1, scale: 1, duration: 0.3 });
      }
    });
  });

  // --- 4. ZOOM INTERATIVO ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)", 
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  // --- 5. HANDLERS ---
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    // Tenta achar variante exata
    const matchedVariant = product.variants.edges.find(({ node }: any) => {
      return node.selectedOptions.every((opt: any) => newOptions[opt.name] === opt.value);
    })?.node;

    if (matchedVariant) {
      setCurrentVariant(matchedVariant);
      if (matchedVariant.image?.url) handleImageChangeAnim(matchedVariant.image.url);

      // Atualiza URL sem reload
      const params = new URLSearchParams(searchParams.toString());
      params.set('variant', matchedVariant.id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
       // Fallback inteligente: se a combinação não existe, acha a primeira disponível com essa nova opção
       const fallbackVariant = product.variants.edges.find(({ node }: any) => {
             return node.selectedOptions.some((opt: any) => opt.name === optionName && opt.value === value) 
                     && node.availableForSale;
        })?.node;

        if (fallbackVariant) {
           const fallbackOptions: Record<string, string> = {};
           fallbackVariant.selectedOptions.forEach((opt: any) => fallbackOptions[opt.name] = opt.value);
           setSelectedOptions(fallbackOptions);
           setCurrentVariant(fallbackVariant);
           if (fallbackVariant.image?.url) handleImageChangeAnim(fallbackVariant.image.url);
           
           const params = new URLSearchParams(searchParams.toString());
           params.set('variant', fallbackVariant.id);
           router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }
  };

  const handleAddToCart = async () => {
    if (!currentVariant || !currentVariant.availableForSale || isAdding) return;
    
    setIsAdding(true);
    
    // Adiciona ao carrinho
    await addItem(currentVariant.id, qty);
    
    // UI Otimista: Feedback de Sucesso antes de abrir
    setIsAdding(false);
    setIsSuccess(true);
    
    setTimeout(() => {
        setIsSuccess(false);
        openCart(); 
    }, 800); // Espera 0.8s mostrando o "Sucesso" e abre o carrinho
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if(cep.length < 8) return;
    
    setCepLoading(true);
    setShippingResult(null);

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep.replace(/\D/g, '')}`);
        if (!response.ok) throw new Error("CEP não encontrado");
        
        const data = await response.json();
        const mockPrice = data.state === "SP" ? "R$ 15,90" : "R$ 28,50";
        const mockDays = data.state === "SP" ? "2 a 3" : "5 a 8";

        setShippingResult(`Frete para ${data.city}/${data.state}: ${mockPrice} (Chega em ${mockDays} dias úteis)`);
    } catch (error) {
        setShippingResult("CEP não encontrado ou inválido.");
    } finally {
        setCepLoading(false);
    }
  };

  if (!product) return null;

  const isAvailable = currentVariant?.availableForSale;

  return (
    <section className={styles.container} ref={containerRef}>
      
      <div className={styles.topSection}>
        
        {/* --- CONTAINER ESQUERDA (IMAGEM + ZOOM) --- */}
        <div className={styles.imageContainer}>
            <div 
                className={styles.mainImageWrapper}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
              <Image 
                ref={mainImageRef}
                src={selectedImage} 
                alt={product.title} 
                fill 
                priority
                className={styles.mainImage}
                style={zoomStyle}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className={styles.thumbnailsRow}>
              {product.images.edges.map(({ node }: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbBox} ${selectedImage === node.url ? styles.thumbActive : ''}`}
                  onClick={() => handleImageChangeAnim(node.url)}
                >
                  <Image src={node.url} alt="Thumb" fill className={styles.thumbImg} sizes="80px" />
                </div>
              ))}
            </div>
        </div>

        {/* --- CONTAINER DIREITA (STICKY INFOS) --- */}
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

            {/* --- CONTROLES --- */}
            <div className={styles.controlsRow}>
                
                {product.options.map((option: any) => (
                    option.name !== "Title" && (
                        <div key={option.name} className={styles.controlGroup}>
                            <span className={styles.controlLabel}>{option.name}</span>
                            <div className={styles.pillsWrapper}>
                                {option.values.map((value: string) => {
                                    const isActive = selectedOptions[option.name] === value;
                                    const isValid = isOptionValid(option.name, value);
                                    
                                    return (
                                        <button
                                            key={value}
                                            className={`
                                                ${styles.pillBtn} 
                                                ${isActive ? styles.pillBtnActive : ''}
                                                ${!isValid ? styles.pillBtnUnavailable : ''}
                                            `}
                                            onClick={() => handleOptionChange(option.name, value)}
                                            title={!isValid ? "Indisponível nesta combinação" : ""}
                                        >
                                            {value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                ))}

                {/* Seletor de Quantidade */}
                <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Quantidade</span>
                    <div className={styles.qtyPill}>
                        <button onClick={() => setQty(q => Math.max(100, q - 100))}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => setQty(q => q + 100)}>+</button> 
                    </div>
                </div>

            </div>

            {/* --- BOTÃO CARRINHO (Com UX Melhorada) --- */}
            <button 
                className={`
                  ${styles.addToCartBtn} 
                  ${isSuccess ? styles.btnSuccess : ''}
                `}
                onClick={handleAddToCart}
                disabled={!isAvailable || isAdding || isSuccess}
            >
                {/* Lógica de Ícones e Texto baseada no estado */}
                {isAdding ? (
                   <>
                     <Loader2 className={styles.spin} size={24}/>
                     <span>Adicionando...</span>
                   </>
                ) : isSuccess ? (
                   <>
                     <Check size={26} />
                     <span>Adicionado!</span>
                   </>
                ) : !isAvailable ? (
                   <span>Indisponível</span>
                ) : (
                   <>
                     <span>Adicionar ao carrinho</span>
                     <ShoppingBag size={24} />
                   </>
                )}
            </button>

            {/* --- FRETE --- */}
            <div className={styles.shippingSection}>
                <span className={styles.sectionLabel}>Consultar prazo e valor</span>
                <form onSubmit={handleCalculateShipping} className={styles.shippingForm}>
                    <input 
                        type="text" 
                        placeholder="Seu CEP" 
                        className={styles.shippingInput}
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        maxLength={9}
                    />
                    <button type="submit" className={styles.shippingBtn} disabled={cepLoading}>
                        {cepLoading ? <Loader2 className={styles.spin} size={18}/> : <ArrowRight size={18} />}
                    </button>
                </form>
                {shippingResult && (
                    <p className={styles.shippingResult}>
                        {shippingResult}
                    </p>
                )}
            </div>

        </div>
      </div>

      {/* --- SESSÃO ESPECIFICAÇÕES --- */}
      <ScrollReveal>
        <div className={styles.specsContainer}>
            <h2 className={styles.specsTitle}>Detalhes técnicos</h2>
            <div 
                className={styles.specsContent}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} 
            />
        </div>
      </ScrollReveal>

    </section>
  );
}