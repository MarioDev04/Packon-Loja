import { getProduct } from "@/lib/shopify";
import { notFound } from "next/navigation";
import ProductView from "@/components/product/ProductView";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// DEFINIÇÃO CORRETA DO TIPO PARA NEXT.JS 15
interface Props {
  params: Promise<{ handle: string }>;
}

// 1. Metadados (Com await)
export async function generateMetadata(props: Props) {
  const params = await props.params; // <--- OBRIGATÓRIO AGORA
  const product = await getProduct(params.handle);

  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.title} | Packon`,
    description: product.description ? product.description.substring(0, 150) : "Detalhes do produto",
  };
}

// 2. Página (Com await)
export default async function ProductPage(props: Props) {
  const params = await props.params; // <--- OBRIGATÓRIO AGORA
  const product = await getProduct(params.handle);

  if (!product) {
    notFound(); 
  }

  return (
    <main style={{ backgroundColor: "#020202", minHeight: "100vh" }}>
      <Header />
      <ProductView product={product} />
      <Footer />
    </main>
  );
}