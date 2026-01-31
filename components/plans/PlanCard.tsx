"use client";

import { Plan } from '@/services/planService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlanCardProps {
  plan: Plan;
  userRole?: string;
  onEdit?: (plan: Plan) => void;
  onDelete?: (planId: string) => void;
  onSelect?: (plan: Plan) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function PlanCard({ 
  plan, 
  userRole, 
  onEdit, 
  onDelete, 
  onSelect, 
  isSelected = false,
  showActions = true 
}: PlanCardProps) {
  const isAdmin = userRole === 'admin';
  const isClientOrPartner = userRole === 'client' || userRole === 'partner';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`relative overflow-hidden transition-all duration-300 ${
          isSelected 
            ? 'ring-2 ring-blue-500 shadow-lg' 
            : 'hover:shadow-lg border-gray-200'
        }`}
        style={{ borderTopColor: plan.color }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: plan.color }}
        />
        
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {plan.display_name}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {plan.description}
              </CardDescription>
            </div>
            {isSelected && (
              <Badge variant="default" className="bg-blue-500">
                Current Plan
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="mb-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {plan.formatted_price}
              </span>
              <span className="text-gray-600 ml-2">
                / {plan.duration_days} days
              </span>
            </div>
          </div>

          {plan.features && plan.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Features:</h4>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {typeof feature === 'string' ? feature : JSON.stringify(feature)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              {isClientOrPartner && onSelect && (
                <Button 
                  onClick={() => onSelect(plan)}
                  className="flex-1 cursor-pointer"
                  variant={isSelected ? "outline" : "default"}
                  disabled={isSelected}
                >
                  {isSelected ? 'Current Plan' : 'Select Plan'}
                </Button>
              )}
              
              {isAdmin && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(plan)}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(plan.id)}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}