import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { PropertyImage } from '../../types/database';

interface PropertyImageUploadProps {
  propertyId?: string;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
  maxImages?: number;
}

export default function PropertyImageUpload({
  propertyId,
  images,
  onImagesChange,
  maxImages = 10
}: PropertyImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file, index) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} excede el tamaño máximo de 10MB`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        const newImage: PropertyImage = {
          id: `temp-${Date.now()}-${index}`,
          property_id: propertyId || 'temp',
          url: publicUrl,
          is_primary: images.length === 0 && index === 0,
          order_index: images.length + index,
          caption: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (propertyId) {
          const { data, error: dbError } = await supabase
            .from('property_images')
            .insert({
              property_id: propertyId,
              url: publicUrl,
              is_primary: newImage.is_primary,
              order_index: newImage.order_index,
              caption: null
            })
            .select()
            .single();

          if (dbError) throw dbError;
          return data as PropertyImage;
        }

        return newImage;
      });

      const newImages = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newImages]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Error al subir imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (imageToRemove: PropertyImage) => {
    try {
      const fileName = imageToRemove.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('property-images')
          .remove([fileName]);
      }

      if (propertyId && !imageToRemove.id.startsWith('temp-')) {
        await supabase
          .from('property_images')
          .delete()
          .eq('id', imageToRemove.id);
      }

      const updatedImages = images.filter(img => img.id !== imageToRemove.id);

      if (imageToRemove.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true;
        if (propertyId && !updatedImages[0].id.startsWith('temp-')) {
          await supabase
            .from('property_images')
            .update({ is_primary: true })
            .eq('id', updatedImages[0].id);
        }
      }

      onImagesChange(updatedImages);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Error al eliminar la imagen');
    }
  };

  const handleSetPrimary = async (image: PropertyImage) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === image.id
    }));

    if (propertyId) {
      await Promise.all(
        updatedImages
          .filter(img => !img.id.startsWith('temp-'))
          .map(img =>
            supabase
              .from('property_images')
              .update({ is_primary: img.is_primary })
              .eq('id', img.id)
          )
      );
    }

    onImagesChange(updatedImages);
  };

  const handleUpdateCaption = async (image: PropertyImage, caption: string) => {
    const updatedImages = images.map(img =>
      img.id === image.id ? { ...img, caption: caption || null } : img
    );

    if (propertyId && !image.id.startsWith('temp-')) {
      await supabase
        .from('property_images')
        .update({ caption: caption || null })
        .eq('id', image.id);
    }

    onImagesChange(updatedImages);
  };

  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];

    updatedImages.forEach((img, idx) => {
      img.order_index = idx;
    });

    if (propertyId) {
      await Promise.all(
        updatedImages
          .filter(img => !img.id.startsWith('temp-'))
          .map(img =>
            supabase
              .from('property_images')
              .update({ order_index: img.order_index })
              .eq('id', img.id)
          )
      );
    }

    onImagesChange(updatedImages);
  };

  const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          <ImageIcon className="inline h-4 w-4 mr-1" />
          Fotos de la propiedad
        </label>
        <span className="text-xs text-gray-500">
          {images.length} / {maxImages} imágenes
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedImages.map((image, index) => (
          <div key={image.id} className="relative group border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <img
              src={image.url}
              alt={image.caption || `Imagen ${index + 1}`}
              className="w-full h-48 object-cover"
            />

            <div className="absolute top-2 right-2 flex gap-2">
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image)}
                  className="bg-white text-yellow-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-50"
                  title="Establecer como principal"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              {image.is_primary && (
                <div className="bg-yellow-500 text-white p-2 rounded-full">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(image)}
                className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Eliminar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(index, 'up')}
                  className="bg-white text-gray-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Mover arriba"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
              )}
              {index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(index, 'down')}
                  className="bg-white text-gray-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Mover abajo"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="p-3 bg-gray-50">
              <input
                type="text"
                value={image.caption || ''}
                onChange={(e) => handleUpdateCaption(image, e.target.value)}
                placeholder="Descripción de la imagen (opcional)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Subiendo...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Agregar fotos</span>
                <span className="text-xs text-gray-400 mt-1">Hasta 10MB por imagen</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>Las fotos de alta calidad ayudan a vender más rápido. {maxImages === 25 ? 'Límite máximo: 25 elementos multimedia en total.' : `Puedes subir hasta ${maxImages} imágenes.`}</p>
        <p>Haz clic en la estrella para marcar la foto principal. Usa las flechas para reordenar las imágenes.</p>
      </div>
    </div>
  );
}
