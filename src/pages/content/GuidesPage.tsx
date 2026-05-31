import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import type { Article, ArticleCategory } from '../../types/database';

type ArticleWithCategory = Article & { category: ArticleCategory | null };

const mockArticles: ArticleWithCategory[] = [
  {
    id: '1',
    author_id: null,
    category_id: '1',
    title: 'Guia completa para comprar tu primer departamento en Buenos Aires',
    slug: 'guia-comprar-primera-propiedad',
    excerpt: 'Desde la busqueda en Palermo hasta la firma de la escritura: todo lo que necesitas saber para comprar en CABA sin sorpresas.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-03-15',
    created_at: '2024-03-15',
    updated_at: '2024-03-15',
    views_count: 3250,
    seo_title: null,
    seo_description: null,
    category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
  },
  {
    id: '2',
    author_id: null,
    category_id: '2',
    title: 'Como vender tu propiedad rapido en el mercado porteno actual',
    slug: '10-consejos-vender-rapido',
    excerpt: 'Estrategias probadas para posicionar tu inmueble en un mercado competitivo y cerrar la operacion en menos de 90 dias.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-03-10',
    created_at: '2024-03-10',
    updated_at: '2024-03-10',
    views_count: 1890,
    seo_title: null,
    seo_description: null,
    category: { id: '2', name: 'Vender', slug: 'vender', description: null, order_index: 2, created_at: '' }
  },
  {
    id: '3',
    author_id: null,
    category_id: '3',
    title: 'Invertir en inmuebles en Argentina: rentabilidad en dolares vs pesos',
    slug: 'invertir-inmuebles-rentabilidad-apreciacion',
    excerpt: 'Analisis de las dos estrategias principales de inversion inmobiliaria en el contexto economico argentino y la dolarizacion del mercado.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-03-08',
    created_at: '2024-03-08',
    updated_at: '2024-03-08',
    views_count: 4100,
    seo_title: null,
    seo_description: null,
    category: { id: '3', name: 'Inversion', slug: 'inversion', description: null, order_index: 3, created_at: '' }
  },
  {
    id: '4',
    author_id: null,
    category_id: '4',
    title: 'Como se tasa una propiedad en Argentina: metodos y factores clave',
    slug: 'como-se-tasa-propiedad',
    excerpt: 'Entiende el proceso de tasacion, los factores que determinan el valor por metro cuadrado y como comparar con propiedades similares.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/7578939/pexels-photo-7578939.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-03-05',
    created_at: '2024-03-05',
    updated_at: '2024-03-05',
    views_count: 1750,
    seo_title: null,
    seo_description: null,
    category: { id: '4', name: 'Tasaciones', slug: 'tasaciones', description: null, order_index: 4, created_at: '' }
  },
  {
    id: '5',
    author_id: null,
    category_id: '5',
    title: 'Mercado inmobiliario 2024: tendencias y oportunidades en Buenos Aires',
    slug: 'tendencias-mercado-2024',
    excerpt: 'Barrios en crecimiento, precios por zona y proyecciones para el ano: un analisis completo del mercado porteno.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/2085998/pexels-photo-2085998.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-03-01',
    created_at: '2024-03-01',
    updated_at: '2024-03-01',
    views_count: 5200,
    seo_title: null,
    seo_description: null,
    category: { id: '5', name: 'Mercado', slug: 'mercado', description: null, order_index: 5, created_at: '' }
  },
  {
    id: '6',
    author_id: null,
    category_id: '1',
    title: 'Errores comunes al comprar departamento en Recoleta y Palermo',
    slug: 'errores-comunes-comprar-departamento',
    excerpt: 'Los 8 errores mas frecuentes que cometen los compradores primerizos en los barrios mas demandados de CABA.',
    content: '',
    cover_image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    status: 'published',
    published_at: '2024-02-20',
    created_at: '2024-02-20',
    updated_at: '2024-02-20',
    views_count: 2100,
    seo_title: null,
    seo_description: null,
    category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
  }
];

function getReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(4, Math.ceil(words / 200));
}

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

  const featuredArticle = filteredArticles.length > 0
    ? filteredArticles.reduce((max, a) => a.views_count > max.views_count ? a : max, filteredArticles[0])
    : null;

  const remainingArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase mb-4 block">
              Centro de conocimiento
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-content leading-tight mb-5">
              Guias y Articulos
            </h1>
            <p className="text-content-muted text-lg leading-relaxed">
              Contenido experto sobre el mercado inmobiliario argentino.
              Informacion practica para compradores, vendedores e inversores en Buenos Aires.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-1 border-b border-gray-200 mb-10 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeCategory === ''
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-content-muted hover:text-content-secondary hover:border-gray-300'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeCategory === cat.slug
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-content-muted hover:text-content-secondary hover:border-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 text-brand-500 animate-spin" />
              <span className="text-sm text-content-muted">Cargando articulos...</span>
            </div>
          </div>
        ) : (
          <>
            {featuredArticle && (
              <FeaturedArticleCard article={featuredArticle} />
            )}

            {remainingArticles.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {remainingArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-5">
              <BookOpen className="h-7 w-7 text-content-light" />
            </div>
            <p className="text-content-secondary font-medium mb-1">No hay articulos en esta categoria</p>
            <p className="text-content-muted text-sm">Pronto publicaremos nuevo contenido</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FeaturedArticleCard({ article }: { article: ArticleWithCategory }) {
  const readingTime = getReadingTime(article.content || article.excerpt || '');

  return (
    <Link
      to={`/guia/${article.slug}`}
      className="group block"
    >
      <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-elegant-lg transition-all duration-300">
        <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
          <img
            src={article.cover_image || 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800'}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider">
                {article.category.name}
              </span>
            )}
            <span className="text-xs text-content-light">|</span>
            <span className="text-xs text-content-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min de lectura
            </span>
          </div>

          <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-content leading-snug mb-4 group-hover:text-brand-500 transition-colors duration-200">
            {article.title}
          </h2>

          <p className="text-content-muted leading-relaxed mb-6 line-clamp-3">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <time className="text-sm text-content-light">
              {new Date(article.published_at || article.created_at).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span className="flex items-center gap-2 text-sm font-medium text-brand-500 group-hover:gap-3 transition-all duration-200">
              Leer articulo
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: ArticleWithCategory }) {
  const readingTime = getReadingTime(article.content || article.excerpt || '');

  return (
    <Link
      to={`/guia/${article.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-elegant hover:border-gray-200 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={article.cover_image || 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {article.category && (
            <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider">
              {article.category.name}
            </span>
          )}
          <span className="text-xs text-content-light">|</span>
          <span className="text-xs text-content-muted flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
        </div>

        <h3 className="font-serif text-lg font-semibold text-content leading-snug mb-3 group-hover:text-brand-500 transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-content-muted leading-relaxed line-clamp-2 mb-4">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <time className="text-xs text-content-light">
            {new Date(article.published_at || article.created_at).toLocaleDateString('es-AR', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
          <span className="flex items-center gap-1.5 text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Leer
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
