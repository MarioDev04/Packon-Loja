// src/lib/shopify.ts

// 1. COLOQUE O DOMÍNIO SEM "HTTPS://" E SEM BARRA NO FINAL
// Exemplo correto: "packon-embalagens.myshopify.com"
const domain = "packon-loja.myshopify.com"; 

// 2. COLOQUE O TOKEN DIRETAMENTE AQUI
// O token correto do Storefront GERALMENTE NÃO começa com "shpat_"
const storefrontAccessToken = "55073988932b2d76f69be99f047c8853";

async function ShopifyData(query: string, variables = {}) {
  const URL = `https://${domain}/api/2024-01/graphql.json`;

  // Vamos ver no terminal exatamente o que está sendo montado
  console.log("--- DEBUG SHOPIFY ---");
  console.log("Tentando conectar em:", URL);
  console.log("Usando Token (inicio):", storefrontAccessToken.substring(0, 5) + "...");

  const options = {
    endpoint: URL,
    method: "POST",
    headers: {
      // Importante: Este cabeçalho SÓ ACEITA tokens da Storefront API
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  };

  try {
    const response = await fetch(URL, options);
    const data = await response.json();

    if (data.errors) {
      console.error("❌ A Shopify Rejeitou:", JSON.stringify(data.errors, null, 2));
      throw new Error("Erro de API Shopify");
    }
    
    return data;
  } catch (error) {
    console.error("❌ Erro de Rede/Fetch:", error);
    throw error;
  }
}
// ... resto do arquivo igual

// --- FUNÇÕES DE BUSCA ---

// 1. Buscar produtos para a sessão "Popular" (Pode ser uma coleção específica)
export async function getProductsInCollection(handle: string) {
  const query = `
  {
    collectionByHandle(handle: "${handle}") {
      title
      products(first: 9) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            # IMAGENS: Trazemos a URL para substituir no componente
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            # VARIANTES: Necessário para o botão "Comprar"
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const response = await ShopifyData(query);
    // Verificação de segurança
    if (!response.data.collectionByHandle) {
        return [];
    }
    return response.data.collectionByHandle.products.edges;
  } catch (e) {
    console.log("Erro na busca da coleção:", e);
    return []; 
  }
}
// 2. Buscar todas as coleções para a sessão "Categories"
export async function getAllCollections() {
  const query = `
  {
    collections(first: 6) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }`;

  const response = await ShopifyData(query);
  return response.data.collections.edges ? response.data.collections.edges : [];
}

// 3. Buscar um produto específico (Para a página de produto futura)
// src/lib/shopify.ts

export async function getProduct(handle: string) {
  const query = `
  {
    productByHandle(handle: "${handle}") {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      
      # Opções como "Cor", "Tamanho", "Espessura"
      options {
        name
        values
      }

      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }

      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }

      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            # Mapeamento das opções para esta variante
            selectedOptions {
              name
              value
            }
            image {
              url
            }
          }
        }
      }
    }
  }
  `;

  const response = await ShopifyData(query);
  return response.data.productByHandle ? response.data.productByHandle : null;
}

// ... (seu código anterior continua igual)

// --- MUTAÇÕES DO CARRINHO ---

// 1. Criar um carrinho novo
export async function createCart() {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  try {
    const response = await ShopifyData(query);
    
    // Se a Shopify devolver erro ou não vier o cart, não quebra o site
    if (!response?.data?.cartCreate?.cart) {
        console.error("Falha ao criar carrinho na Shopify:", response);
        return null; 
    }
    
    return response.data.cartCreate.cart;
  } catch (error) {
    console.error("Erro fatal ao tentar criar carrinho:", error);
    return null; // Retorna null para o Zustand lidar sem travar a tela
  }
}

// 2. Adicionar item ao carrinho
// ... (Mantenha createCart igual) ...

// 2. Adicionar item ao carrinho (ATUALIZADO)
export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const query = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  # ADICIONADO AQUI:
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
  `;

  const variables = { cartId, lines };
  const response = await ShopifyData(query, variables);
  return response.data.cartLinesAdd.cart;
}

// 3. Recuperar carrinho existente (ATUALIZADO)
export async function getCart(cartId: string) {
  const query = `
  {
    cart(id: "${cartId}") {
      id
      checkoutUrl
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                # ADICIONADO AQUI:
                selectedOptions {
                  name
                  value
                }
                product {
                  title
                  handle
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  const response = await ShopifyData(query);
  return response.data.cart;
}

// 4. Remover item do carrinho (ATUALIZADO)
export async function removeLinesFromCart(cartId: string, lineIds: string[]) {
  const query = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  # ADICIONADO AQUI:
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
  `;

  const variables = { cartId, lineIds };
  const response = await ShopifyData(query, variables);
  return response.data.cartLinesRemove.cart;
}

// 5. Atualizar quantidade (ATUALIZADO)
export async function updateLinesInCart(cartId: string, lines: { id: string; quantity: number }[]) {
  const query = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  # ADICIONADO AQUI:
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  }
  `;

  const variables = { cartId, lines };
  const response = await ShopifyData(query, variables);
  return response.data.cartLinesUpdate.cart;
}