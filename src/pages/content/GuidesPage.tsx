import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import type { Article, ArticleCategory } from '../../types/database';

type ArticleWithCategory = Article & { category: ArticleCategory | null };

const mockArticles: ArticleWithCategory[] = [
  {
    id: '1',
    author_id: null,
    category_id: '1',
    title: 'Guía completa para comprar tu primera propiedad',
    slug: 'guia-comprar-primera-propiedad',
    excerpt: 'Todo lo que necesitas saber antes de dar el gran paso. Desde la búsqueda hasta la escritura.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-01-15',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    views_count: 1250,
    seo_title: null,
    seo_description: null,
    category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
  },
  {
    id: '2',
    author_id: null,
    category_id: '2',
    title: '10 consejos para vender tu propiedad rápido',
    slug: '10-consejos-vender-rapido',
    excerpt: 'Estrategias probadas para acelerar la venta de tu inmueble sin sacrificar el precio.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/7578939/pexels-photo-7578939.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-01-10',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
    views_count: 890,
    seo_title: null,
    seo_description: null,
    category: { id: '2', name: 'Vender', slug: 'vender', description: null, order_index: 2, created_at: '' }
  },
  {
    id: '3',
    author_id: null,
    category_id: '3',
    title: 'Invertir en inmuebles: rentabilidad vs apreciación',
    slug: 'invertir-inmuebles-rentabilidad-apreciacion',
    excerpt: 'Analiza las dos estrategias principales de inversión inmobiliaria y elige la mejor para ti.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/7821485/pexels-photo-7821485.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-01-08',
    created_at: '2024-01-08',
    updated_at: '2024-01-08',
    views_count: 2100,
    seo_title: null,
    seo_description: null,
    category: { id: '3', name: 'Inversión', slug: 'inversion', description: null, order_index: 3, created_at: '' }
  },
  {
    id: '4',
    author_id: null,
    category_id: '4',
    title: '¿Cómo se tasa una propiedad?',
    slug: 'como-se-tasa-propiedad',
    excerpt: 'Entiende el proceso de tasación y los factores que determinan el valor de un inmueble.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/7641824/pexels-photo-7641824.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-01-05',
    created_at: '2024-01-05',
    updated_at: '2024-01-05',
    views_count: 750,
    seo_title: null,
    seo_description: null,
    category: { id: '4', name: 'Tasaciones', slug: 'tasaciones', description: null, order_index: 4, created_at: '' }
  },
  {
    id: '5',
    author_id: null,
    category_id: '5',
    title: 'Tendencias del mercado inmobiliario 2024',
    slug: 'tendencias-mercado-2024',
    excerpt: 'Análisis completo de las proyecciones y oportunidades del mercado para este año.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    views_count: 3200,
    seo_title: null,
    seo_description: null,
    category: { id: '5', name: 'Mercado', slug: 'mercado', description: null, order_index: 5, created_at: '' }
  },
  {
    id: '6',
    author_id: null,
    category_id: '1',
    title: 'Errores comunes al comprar departamento',
    slug: 'errores-comunes-comprar-departamento',
    excerpt: 'Evita estos errores frecuentes que cometen los compradores primerizos.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2023-12-20',
    created_at: '2023-12-20',
    updated_at: '2023-12-20',
    views_count: 1100,
    seo_title: null,
    seo_description: null,
    category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
  }
];

export default function GuidesPage() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<ArticleWithCategory[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || '');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: cats } = await supabase
      .from('article_categories')
      .select('*')
      .order('order_index');

    if (cats) {
      setCategories(cats as ArticleCategory[]);
    }

    const { data: arts } = await supabase
      .from('articles')
      .select('*, category:article_categories(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (arts && arts.length > 0) {
      setArticles(arts as ArticleWithCategory[]);
    } else {
      setArticles(mockArticles);
    }

    setLoading(false);
  }

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category?.slug === activeCategory)
    : articles;

  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Guías y Artículos
          </h1>
          <p className="text-brand-100 text-lg">
            Contenido de valor para tomar mejores decisiones inmobiliarias
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              activeCategory === ''
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay artículos en esta categoría</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function ArticleCard({ article }: { article: ArticleWithCategory }) {
  return (
    <Link
      to={`/guia/${article.slug}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div className="relative">
        <img
          src={article.cover_image || 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={article.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {article.category && (
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {article.category.name}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(article.published_at || article.created_at).toLocaleDateString('es-AR')}
            </span>
          </div>
          <span className="flex items-center text-brand-500 font-medium">
            Leer más
            <ChevronRight className="h-4 w-4 ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
