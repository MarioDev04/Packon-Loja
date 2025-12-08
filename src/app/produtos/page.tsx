import { getCollectionProducts } from "@/lib/shopify";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // Supondo que você tenha ou use o do layout root
import CatalogWrapper from "@/components/catalog/CatalogWrapper";
import styles from "@/components/catalog/catalog.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja | Packon",
  description: "Confira nossas embalagens de alta qualidade.",
};

export default async function CatalogPage() {
  // Busca produtos da coleção 'products' como solicitado
  // Ordenação inicial padrão do Shopify
  const products = await getCollectionProducts("products", "CREATED", true);

  return (
    <main className={styles.pageContainer}>
      <Header />
      
      {/* Passamos os dados para o componente Client-Side que gerencia filtros e animações */}
      <CatalogWrapper initialProducts={products} />
      
      <Footer />
    </main>
  );
}