import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, Eye, Clock, Share2, Copy, Loader2, ArrowRight } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import type { Article, ArticleCategory } from '../../types/database';

type ArticleWithCategory = Article & { category: ArticleCategory | null };

const mockArticleContent = `## Introduccion

Comprar tu primera propiedad en Buenos Aires es uno de los pasos mas importantes en la vida. Ya sea que estes buscando un departamento en Palermo, Belgrano o Recoleta, este proceso puede parecer abrumador al principio.

En esta guia completa, te llevaremos paso a paso por todo lo que necesitas saber para tomar una decision informada y evitar errores comunes en el mercado inmobiliario porteno.

## 1. Define tu presupuesto en dolares

Antes de empezar a buscar propiedades, es fundamental tener claro cuanto podes gastar. El mercado argentino opera mayoritariamente en dolares estadounidenses para operaciones de compraventa. Considera:

- **Tus ahorros actuales**: Cuanto tenes disponible para el pago inicial (en Argentina, la mayoria de las operaciones son al contado).
- **Costos de escrituracion**: Generalmente entre el 3% y 5% del valor de la propiedad, incluyendo honorarios del escribano, impuestos y sellados.
- **Gastos adicionales**: Comision inmobiliaria (entre 3% y 4%), mudanza, y eventuales refacciones.

## 2. Investiga el mercado porteno

No te apresures en la busqueda. Tomate el tiempo de:

- Analizar diferentes barrios y sus precios promedio por metro cuadrado
- Comparar al menos 10-15 propiedades antes de decidir
- Entender las tendencias del mercado local y la diferencia entre precio publicado y precio de cierre
- Consultar informes de valuacion para tener referencias objetivas

## 3. Verifica la documentacion

Antes de hacer una oferta, asegurate de verificar con tu escribano:

- Titulo de propiedad limpio y sin inhibiciones
- Planos aprobados por el GCBA
- Libre de deudas de expensas, ABL e impuestos
- Certificado de dominio e inhibiciones actualizado
- Estado del consorcio y reglamento de copropiedad

## 4. Negocia con informacion

Un comprador informado tiene ventaja. Utiliza herramientas de valuacion para conocer el precio justo del metro cuadrado en la zona y negocia con datos concretos. En el mercado actual, es comun obtener descuentos del 5% al 15% sobre el precio publicado.

## 5. El proceso de compra paso a paso

Una vez que encontraste tu propiedad ideal:

- **Reserva**: Entrega de una senal (generalmente entre USD 1.000 y USD 5.000) para sacar la propiedad del mercado.
- **Boleto de compraventa**: Firma del boleto con entrega del 30% del valor total. Este documento es vinculante.
- **Escritura**: Firma ante escribano publico. Se entrega el saldo restante y se formaliza la transferencia de dominio.

## Conclusion

Comprar una propiedad en Buenos Aires es una decision importante que requiere preparacion y conocimiento del mercado local. Siguiendo estos consejos, estaras mejor preparado para encontrar el inmueble ideal.

Tenes dudas? Consulta con nuestros asesores para recibir orientacion personalizada sobre tu busqueda.`;

const mockRelatedArticles: ArticleWithCategory[] = [
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
  },
  {
    id: '4',
    author_id: null,
    category_id: '4',
    title: 'Como se tasa una propiedad en Argentina: metodos y factores clave',
    slug: 'como-se-tasa-propiedad',
    excerpt: 'Entiende el proceso de tasacion y los factores que determinan el valor por metro cuadrado.',
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
  }
];

function getReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(4, Math.ceil(words / 200));
}

function extractHeadings(content: string): { id: string; text: string }[] {
  const lines = content.split('\n');
  return lines
    .filter(line => line.startsWith('## '))
    .map(line => {
      const text = line.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return { id, text };
    });
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<ArticleWithCategory | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  async function fetchArticle() {
    const { data, error } = await supabase
      .from('articles')
      .select('*, category:article_categories(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      setArticle(data as ArticleWithCategory);
      fetchRelated(data.category_id, data.id);
    } else {
      setArticle({
        id: '1',
        author_id: null,
        category_id: '1',
        title: 'Guia completa para comprar tu primer departamento en Buenos Aires',
        slug: slug || 'guia-comprar-primera-propiedad',
        excerpt: 'Desde la busqueda en Palermo hasta la firma de la escritura: todo lo que necesitas saber para comprar en CABA.',
        content: mockArticleContent,
        cover_image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200',
        status: 'published',
        published_at: '2024-03-15',
        created_at: '2024-03-15',
        updated_at: '2024-03-15',
        views_count: 3250,
        seo_title: null,
        seo_description: null,
        category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
      });
      setRelatedArticles(mockRelatedArticles);
    }
    setLoading(false);
  }

  async function fetchRelated(categoryId: string | null, currentId: string) {
    if (!categoryId) {
      setRelatedArticles(mockRelatedArticles);
      return;
    }

    const { data } = await supabase
      .from('articles')
      .select('*, category:article_categories(*)')
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .neq('id', currentId)
      .order('views_count', { ascending: false })
      .limit(2);

    if (data && data.length > 0) {
      setRelatedArticles(data as ArticleWithCategory[]);
    } else {
      setRelatedArticles(mockRelatedArticles);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 text-brand-500 animate-spin" />
            <span className="text-sm text-content-muted">Cargando articulo...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-semibold text-content mb-4">Articulo no encontrado</h1>
          <Link to="/guias" className="text-brand-500 hover:text-brand-600 font-medium">
            Volver a guias
          </Link>
        </div>
      </Layout>
    );
  }

  const content = article.content || mockArticleContent;
  const readingTime = getReadingTime(content);
  const headings = extractHeadings(content);

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <div className="pt-24 pb-8 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-sm text-content-muted mb-8">
              <Link to="/" className="hover:text-brand-500 transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/guias" className="hover:text-brand-500 transition-colors">Guias</Link>
              {article.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link
                    to={`/guias?cat=${article.category.slug}`}
                    className="hover:text-brand-500 transition-colors"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
            </nav>

            {article.category && (
              <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-4 block">
                {article.category.name}
              </span>
            )}

            <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-content leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-sm text-content-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(article.published_at || article.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readingTime} min de lectura
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.views_count.toLocaleString('es-AR')} lecturas
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {article.cover_image && (
            <div className="aspect-[21/9] rounded-xl overflow-hidden mb-10">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_220px] gap-12">
            <article className="min-w-0">
              <div className="prose-custom">
                {content.split('\n').map((line, index) => {
                  if (line.startsWith('## ')) {
                    const text = line.replace('## ', '');
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <h2 key={index} id={id} className="text-xl font-serif font-semibold text-content mt-10 mb-4 scroll-mt-24">
                        {text}
                      </h2>
                    );
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.+)\*\*: (.+)/);
                    if (match) {
                      return (
                        <div key={index} className="flex items-start gap-3 my-3 pl-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2.5 shrink-0" />
                          <p className="text-content-secondary leading-relaxed">
                            <strong className="text-content font-medium">{match[1]}</strong>: {match[2]}
                          </p>
                        </div>
                      );
                    }
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={index} className="flex items-start gap-3 my-3 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2.5 shrink-0" />
                        <p className="text-content-secondary leading-relaxed">{line.replace('- ', '')}</p>
                      </div>
                    );
                  }
                  if (line.trim() === '') return <div key={index} className="h-4" />;
                  return (
                    <p key={index} className="text-content-secondary leading-[1.8] my-4">
                      {line}
                    </p>
                  );
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-content-muted">Compartir este articulo</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 text-[#25D366] rounded-lg text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-secondary text-content-muted rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Share2 className="h-4 w-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">
                    En este articulo
                  </h4>
                  <nav className="space-y-2">
                    {headings.map(heading => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="block text-sm text-content-muted hover:text-brand-500 transition-colors leading-snug py-1 border-l-2 border-gray-100 pl-3 hover:border-brand-500"
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </div>

        <div className="bg-brand-500 py-12 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-serif font-semibold text-white mb-2">
                  Necesitas ayuda personalizada?
                </h3>
                <p className="text-brand-200">
                  Nuestros asesores pueden guiarte en tu proceso de compra o venta en Buenos Aires.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/informe-valor"
                  className="bg-white text-brand-600 px-6 py-3 rounded-lg font-semibold hover:bg-accent-50 transition-colors text-center whitespace-nowrap"
                >
                  Informe de valor
                </Link>
                <Link
                  to="/propiedades"
                  className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center whitespace-nowrap"
                >
                  Ver propiedades
                </Link>
              </div>
            </div>
          </div>
        </div>

        {relatedArticles.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-2xl font-semibold text-content">Articulos relacionados</h3>
              <Link
                to="/guias"
                className="text-sm font-medium text-brand-500 flex items-center gap-1 hover:gap-2 transition-all"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map(related => (
                <Link
                  key={related.id}
                  to={`/guia/${related.slug}`}
                  className="group flex gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-elegant hover:border-gray-200 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={related.cover_image || 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    {related.category && (
                      <span className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-1">
                        {related.category.name}
                      </span>
                    )}
                    <h4 className="font-medium text-content group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
