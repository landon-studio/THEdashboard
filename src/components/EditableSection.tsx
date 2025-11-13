import React, { useState, ReactNode } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface EditableSectionProps {
  sectionId: string;
  children: ReactNode;
  editComponent?: ReactNode;
  onSave?: (data: any) => void;
  className?: string;
}

export function EditableSection({ 
  sectionId, 
  children, 
  editComponent, 
  onSave, 
  className = "" 
}: EditableSectionProps) {
  const { isEditMode, editingSection, setEditingSection } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);

  const isCurrentlyEditing = isEditMode && editingSection === sectionId;

  const handleEditToggle = () => {
    if (isCurrentlyEditing) {
      setEditingSection(null);
      setIsEditing(false);
    } else {
      setEditingSection(sectionId);
      setIsEditing(true);
    }
  };

  const handleSave = (data?: any) => {
    if (onSave) {
      onSave(data);
    }
    setEditingSection(null);
    setIsEditing(false);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Edit Button - Only show when in edit mode */}
      {isEditMode && (
        <button
          onClick={handleEditToggle}
          className={`absolute -top-2 -right-2 z-10 p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            isCurrentlyEditing
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-white/20 dark:bg-black/30 text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-black/40'
          }`}
          title={isCurrentlyEditing ? 'Save changes' : 'Edit section'}
        >
          {isCurrentlyEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      )}

      {/* Content */}
      {isCurrentlyEditing && editComponent ? (
        <div className="animate-fade-in">
          {editComponent}
        </div>
      ) : (
        <div className={isEditMode ? 'hover:ring-2 hover:ring-purple-400/50 rounded-lg transition-all duration-200' : ''}>
          {children}
        </div>
      )}
    </div>
  );
}