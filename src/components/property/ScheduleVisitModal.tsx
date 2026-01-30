import { useState } from 'react';
import { X, Calendar, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Property } from '../../types/database';

interface ScheduleVisitModalProps {
  property: Property;
  onClose: () => void;
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Por la mañana', value: 'morning' },
  { id: 'midday', label: 'Al mediodía', value: 'midday' },
  { id: 'afternoon', label: 'Por la tarde', value: 'afternoon' }
];

export default function ScheduleVisitModal({ property, onClose }: ScheduleVisitModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visitDate: '',
    timeSlots: [] as string[]
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visitDate: '',
    timeSlots: ''
  });

  const getNext7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
      });
    }

    return days;
  };

  const validateStep1 = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      visitDate: '',
      timeSlots: ''
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const validateStep2 = () => {
    const newErrors = { ...errors, visitDate: '', timeSlots: '' };

    if (!formData.visitDate) {
      newErrors.visitDate = 'Selecciona una fecha';
    }
    if (formData.timeSlots.length === 0) {
      newErrors.timeSlots = 'Selecciona al menos un horario';
    }

    setErrors(newErrors);
    return !newErrors.visitDate && !newErrors.timeSlots;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const toggleTimeSlot = (timeSlot: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(timeSlot)
        ? prev.timeSlots.filter(slot => slot !== timeSlot)
        : [...prev.timeSlots, timeSlot]
    }));
    setErrors(prev => ({ ...prev, timeSlots: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setLoading(true);

    try {
      const { data: appointmentData, error } = await supabase
        .from('visit_appointments')
        .insert({
          property_id: property.id,
          user_id: user?.id || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          visit_date: formData.visitDate,
          time_slots: formData.timeSlots,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (appointmentData) {
        await supabase.from('leads').insert({
          property_id: property.id,
          user_id: user?.id || null,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          lead_type: 'property_inquiry',
          status: 'new',
          message: `Visita agendada para el ${new Date(formData.visitDate).toLocaleDateString('es-AR')} - Horarios: ${formData.timeSlots.join(', ')}`
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Hubo un error al agendar la visita. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-elegant max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-content mb-2">Visita Agendada</h3>
          <p className="text-content-muted">Te contactaremos pronto para confirmar tu visita.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-elegant max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-content">Agendar Visita</h2>
            <p className="text-content-muted text-sm mt-1">Paso {step} de 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-content-muted" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-brand-500 text-white' : 'bg-surface-secondary text-content-muted'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              step >= 2 ? 'bg-brand-500' : 'bg-surface-secondary'
            }`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-brand-500 text-white' : 'bg-surface-secondary text-content-muted'
            }`}>
              2
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-content mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      setErrors({ ...errors, firstName: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-content mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      setErrors({ ...errors, lastName: '' });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                    placeholder="Pérez"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-content mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="juan.perez@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-content mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-brand-500`}
                  placeholder="+54 911 6451 9421"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-all flex items-center space-x-2"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-content mb-3">
                  Selecciona una fecha *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {getNext7Days().map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, visitDate: day.date });
                        setErrors({ ...errors, visitDate: '' });
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.visitDate === day.date
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-brand-500" />
                          <span className="font-medium text-content capitalize">{day.label}</span>
                        </div>
                        {formData.visitDate === day.date && (
                          <Check className="h-5 w-5 text-brand-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.visitDate && (
                  <p className="text-red-500 text-sm mt-2">{errors.visitDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-content mb-3">
                  Selecciona horarios (selección múltiple) *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleTimeSlot(slot.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.timeSlots.includes(slot.value)
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-brand-500" />
                          <span className="font-medium text-content">{slot.label}</span>
                        </div>
                        {formData.timeSlots.includes(slot.value) && (
                          <Check className="h-5 w-5 text-brand-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.timeSlots && (
                  <p className="text-red-500 text-sm mt-2">{errors.timeSlots}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-content-muted hover:text-content transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Volver</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Agendando...' : 'Confirmar Visita'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
