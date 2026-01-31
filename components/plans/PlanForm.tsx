"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { CreatePlanData, Plan } from '@/services/planService';
import { X, Plus, Loader2 } from 'lucide-react';

interface PlanFormProps {
  plan?: Plan;
  onSubmit: (data: CreatePlanData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlanForm({ plan, onSubmit, onCancel, isLoading = false }: PlanFormProps) {
  const [formData, setFormData] = useState<CreatePlanData>({
    name: plan?.name || '',
    display_name: plan?.display_name || '',
    description: plan?.description || '',
    price: plan?.price || '',
    duration_days: plan?.duration_days || 30,
    features: plan?.features || [],
    color: plan?.color || '#3B82F6',
  });

  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Plan Name</Label>
              <input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., basic-plan"
                required
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-sm font-medium text-gray-700">Display Name</Label>
              <input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="e.g., Basic Plan"
                required
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Plan description..."
              rows={3}
              required
              className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
              <input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="29.99"
                required
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration_days" className="text-sm font-medium text-gray-700">Duration (Days)</Label>
              <input
                id="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                min="1"
                required
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color</Label>
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none h-12 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Features</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none placeholder-gray-500"
                />
              </div>
              <Button type="button" onClick={addFeature} size="sm" className="mb-1 cursor-pointer">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.features.length > 0 && (
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{typeof feature === 'string' ? feature : JSON.stringify(feature)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 flex items-center gap-2 cursor-pointer">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>
    </div>
  );
}