import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Eye, Share2, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import type { Article, ArticleCategory } from '../../types/database';

type ArticleWithCategory = Article & { category: ArticleCategory | null };

const mockArticleContent = `
## Introducción

Comprar tu primera propiedad es uno de los pasos más importantes en la vida. Ya sea que estés buscando un lugar para vivir o una inversión, este proceso puede parecer abrumador al principio.

En esta guía completa, te llevaremos paso a paso por todo lo que necesitas saber para tomar una decisión informada y evitar errores comunes.

## 1. Define tu presupuesto

Antes de empezar a buscar propiedades, es fundamental tener claro cuánto puedes gastar. Considera:

- **Tus ahorros actuales**: ¿Cuánto tienes disponible para el pago inicial?
- **Tu capacidad de endeudamiento**: Las cuotas no deberían superar el 30% de tus ingresos mensuales.
- **Gastos adicionales**: Escritura, impuestos, comisiones y mudanza.

## 2. Investiga el mercado

No te apresures en la búsqueda. Tómate el tiempo de:

- Analizar diferentes zonas y sus precios promedio
- Comparar al menos 10-15 propiedades antes de decidir
- Entender las tendencias del mercado local

## 3. Verifica la documentación

Antes de ofertar, asegúrate de verificar:

- Título de propiedad limpio
- Planos aprobados
- Libre de deudas y gravámenes
- Certificado de dominio

## 4. Negocia con información

Un comprador informado tiene ventaja. Utiliza herramientas de valuación para conocer el precio justo y negocia con datos concretos.

## Conclusión

Comprar una propiedad es una decisión importante que requiere preparación. Siguiendo estos consejos, estarás mejor preparado para encontrar el inmueble ideal para ti.

¿Tienes dudas? Consulta con nuestros asesores para recibir orientación personalizada.
`;

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<ArticleWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

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
    } else {
      setArticle({
        id: '1',
        author_id: null,
        category_id: '1',
        title: 'Guía completa para comprar tu primera propiedad',
        slug: slug || 'guia-comprar-primera-propiedad',
        excerpt: 'Todo lo que necesitas saber antes de dar el gran paso.',
        content: mockArticleContent,
        cover_image: 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=1200',
        status: 'published',
        published_at: '2024-01-15',
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
        views_count: 1250,
        seo_title: null,
        seo_description: null,
        category: { id: '1', name: 'Comprar', slug: 'comprar', description: null, order_index: 1, created_at: '' }
      });
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
          <Link to="/guias" className="text-brand-500 hover:text-brand-600">
            Volver a guías
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen pt-20">
        <div className="relative">
          <div className="h-64 md:h-96 overflow-hidden">
            <img
              src={article.cover_image || 'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-4xl mx-auto">
              <Link
                to="/guias"
                className="inline-flex items-center text-white/80 hover:text-white mb-4"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Volver a guías
              </Link>

              {article.category && (
                <span className="bg-brand-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {article.category.name}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
                {article.title}
              </h1>

              <div className="flex items-center space-x-6 text-white/80 mt-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  {article.views_count} lecturas
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              {(article.content || mockArticleContent).split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('- **')) {
                  const match = line.match(/- \*\*(.+)\*\*: (.+)/);
                  if (match) {
                    return (
                      <p key={index} className="flex items-start my-2">
                        <span className="text-brand-500 mr-2">-</span>
                        <span><strong>{match[1]}</strong>: {match[2]}</span>
                      </p>
                    );
                  }
                }
                if (line.startsWith('- ')) {
                  return (
                    <p key={index} className="flex items-start my-2">
                      <span className="text-brand-500 mr-2">-</span>
                      <span>{line.replace('- ', '')}</span>
                    </p>
                  );
                }
                if (line.trim() === '') return <br key={index} />;
                return <p key={index} className="text-gray-700 my-4 leading-relaxed">{line}</p>;
              })}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">¿Te resultó útil este artículo?</p>
                  <p className="text-sm text-gray-500">Compártelo con alguien que lo necesite.</p>
                </div>
                <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Compartir</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-brand-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Necesitas ayuda personalizada?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestros asesores pueden guiarte en tu proceso de compra o venta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/informe-valor"
                className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors text-center"
              >
                Solicitar informe de valor
              </Link>
              <Link
                to="/propiedades"
                className="border border-brand-500 text-brand-500 px-6 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors text-center"
              >
                Ver propiedades
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
