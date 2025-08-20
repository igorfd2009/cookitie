import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ShoppingCart, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const products: Product[] = [
  {
    id: 'palha-italiana',
    name: 'Palha Italiana',
    description: 'Pedaços macios com chocolate e doce de leite. Tamanho: porção individual.',
    price: 6.00,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'cookie',
    name: 'Cookie',
    description: 'Cookie grande, crocante por fora e macio por dentro.',
    price: 7.00,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'cake-pop',
    name: 'Cake Pop',
    description: 'Bolinha decorada, ideal como mimo individual.',
    price: 4.50,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300&h=300&fit=crop&crop=center'
  },
  {
    id: 'biscoito-amantegado',
    name: 'Biscoito Amantegado',
    description: 'Clássico amanteigado, perfeito com chá.',
    price: 5.00,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop&crop=center'
  }
];

export function Products() {
  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="products" className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="mb-3 md:mb-4 text-gray-800 text-2xl md:text-3xl">Nossos Doces Artesanais</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Cada produto é feito com muito carinho e ingredientes selecionados. Reserve já o seu favorito!
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <ImageWithFallback
                  src={product.image}
                  alt={`${product.name} - Cookite`}
                  className="w-full h-32 md:h-48 object-cover"
                  width={300}
                  height={300}
                />
                <Badge className="absolute top-1 md:top-2 right-1 md:right-2 bg-[var(--color-cookite-blue)] text-white text-xs">
                  {product.stock}
                </Badge>
              </div>
              <CardContent className="p-3 md:p-4">
                <h3 className="mb-1 md:mb-2 text-gray-800 text-sm md:text-base">{product.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="mb-3 md:mb-4">
                  <p className="text-lg md:text-2xl font-bold text-[var(--color-cookite-blue)]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-gray-500">Com desconto</p>
                </div>
                <Button 
                  onClick={scrollToReservation}
                  className="w-full bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-xl text-xs md:text-sm py-2"
                >
                  <Plus size={14} className="mr-1.5" />
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button 
            onClick={scrollToReservation}
            size="lg"
            className="bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-2xl px-8 py-3 text-base md:text-lg"
          >
            <ShoppingCart size={20} className="mr-2" />
            Fazer Reserva Completa
          </Button>
        </div>
      </div>
    </section>
  );
}