import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { CheckCircle2, Home, Users, Heart, Settings, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  houseInfo: {
    name: string;
    address: string;
    moveInDate: string;
  };
  roommates: {
    name: string;
    email: string;
    isApproved: boolean;
  }[];
  pet: {
    name: string;
    type: string;
    breed: string;
    age: string;
    notes: string;
  };
  initialRules: string[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    autoSyncCalendar: boolean;
  };
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    houseInfo: {
      name: '',
      address: '',
      moveInDate: ''
    },
    roommates: [
      { name: '', email: '', isApproved: false }
    ],
    pet: {
      name: '',
      type: '',
      breed: '',
      age: '',
      notes: ''
    },
    initialRules: [],
    preferences: {
      notifications: true,
      darkMode: false,
      autoSyncCalendar: true
    }
  });

  const steps = [
    { icon: Home, title: 'Welcome', description: 'Let\'s set up your house information' },
    { icon: Users, title: 'Roommates', description: 'Add your fellow housemates' },
    { icon: Heart, title: 'Pet Care', description: 'Tell us about your furry friend' },
    { icon: Settings, title: 'House Rules', description: 'Establish some basic guidelines' },
    { icon: CheckCircle2, title: 'Preferences', description: 'Customize your experience' }
  ];

  const defaultRules = [
    'Clean up after yourself in common areas',
    'Respect quiet hours (10 PM - 8 AM)',
    'Ask before having overnight guests',
    'Split shared expenses equally',
    'Take turns with household chores',
    'Keep the thermostat between 68-72°F',
    'No smoking inside the house',
    'Communicate about issues directly and respectfully'
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateData = (section: keyof OnboardingData, newData: any) => {
    setData(prev => ({
      ...prev,
      [section]: newData
    }));
  };

  const addRoommate = () => {
    updateData('roommates', [...data.roommates, { name: '', email: '', isApproved: false }]);
  };

  const updateRoommate = (index: number, field: string, value: string | boolean) => {
    const newRoommates = [...data.roommates];
    newRoommates[index] = { ...newRoommates[index], [field]: value };
    updateData('roommates', newRoommates);
  };

  const removeRoommate = (index: number) => {
    if (data.roommates.length > 1) {
      updateData('roommates', data.roommates.filter((_, i) => i !== index));
    }
  };

  const toggleRule = (rule: string) => {
    const currentRules = data.initialRules;
    if (currentRules.includes(rule)) {
      updateData('initialRules', currentRules.filter(r => r !== rule));
    } else {
      updateData('initialRules', [...currentRules, rule]);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return data.houseInfo.name.trim() && data.houseInfo.address.trim();
      case 1:
        return data.roommates.some(r => r.name.trim() && r.email.trim());
      case 2:
        return true; // Pet info is optional
      case 3:
        return true; // Rules are optional
      case 4:
        return true; // Preferences have defaults
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">Welcome to Your Roommate Dashboard! 🏠</h2>
              <p className="text-muted-foreground">
                Let's start by setting up some basic information about your living situation.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="houseName">House/Apartment Name</Label>
                <Input
                  id="houseName"
                  placeholder="e.g., The Palace, 123 Main Street House"
                  value={data.houseInfo.name}
                  onChange={(e) => updateData('houseInfo', { ...data.houseInfo, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street, City, State"
                  value={data.houseInfo.address}
                  onChange={(e) => updateData('houseInfo', { ...data.houseInfo, address: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="moveInDate">Move-in Date (Optional)</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={data.houseInfo.moveInDate}
                  onChange={(e) => updateData('houseInfo', { ...data.houseInfo, moveInDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">Add Your Roommates 👥</h2>
              <p className="text-muted-foreground">
                Let's add the people you're living with. They'll be able to use the dashboard too!
              </p>
            </div>
            
            <div className="space-y-4">
              {data.roommates.map((roommate, index) => (
                <Card key={index} className="p-4 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Roommate Name"
                        value={roommate.name}
                        onChange={(e) => updateRoommate(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={roommate.email}
                        onChange={(e) => updateRoommate(index, 'email', e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`approved-${index}`}
                          checked={roommate.isApproved}
                          onCheckedChange={(checked) => updateRoommate(index, 'isApproved', checked as boolean)}
                        />
                        <Label htmlFor={`approved-${index}`} className="text-sm">
                          This person can manage house settings and send messages
                        </Label>
                      </div>
                    </div>
                    {data.roommates.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRoommate(index)}
                        className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
              
              <Button
                onClick={addRoommate}
                variant="outline"
                className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
              >
                + Add Another Roommate
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">Tell Us About Your Pet! 🐕</h2>
              <p className="text-muted-foreground">
                We'll help you keep track of pet care, walks, and vet appointments.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName">Pet Name</Label>
                  <Input
                    id="petName"
                    placeholder="e.g., Kepler"
                    value={data.pet.name}
                    onChange={(e) => updateData('pet', { ...data.pet, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="petType">Type</Label>
                  <Input
                    id="petType"
                    placeholder="e.g., Dog, Cat, etc."
                    value={data.pet.type}
                    onChange={(e) => updateData('pet', { ...data.pet, type: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="petBreed">Breed</Label>
                  <Input
                    id="petBreed"
                    placeholder="e.g., Golden Retriever"
                    value={data.pet.breed}
                    onChange={(e) => updateData('pet', { ...data.pet, breed: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="petAge">Age</Label>
                  <Input
                    id="petAge"
                    placeholder="e.g., 3 years old"
                    value={data.pet.age}
                    onChange={(e) => updateData('pet', { ...data.pet, age: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="petNotes">Special Notes (Optional)</Label>
                <Textarea
                  id="petNotes"
                  placeholder="Any special care instructions, favorite toys, medical needs, etc."
                  value={data.pet.notes}
                  onChange={(e) => updateData('pet', { ...data.pet, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">House Rules 📋</h2>
              <p className="text-muted-foreground">
                Select some basic rules to start with. You can always add, edit, or remove these later!
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {defaultRules.map((rule, index) => (
                <Card key={index} className="p-4 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`rule-${index}`}
                      checked={data.initialRules.includes(rule)}
                      onCheckedChange={() => toggleRule(rule)}
                    />
                    <Label htmlFor={`rule-${index}`} className="flex-1 cursor-pointer">
                      {rule}
                    </Label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">Almost Done! ⚙️</h2>
              <p className="text-muted-foreground">
                Let's set up your preferences to customize your experience.
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="p-6 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Enable Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about chores, events, and messages
                      </p>
                    </div>
                    <Checkbox
                      checked={data.preferences.notifications}
                      onCheckedChange={(checked) => 
                        updateData('preferences', { ...data.preferences, notifications: checked as boolean })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Use a darker theme that's easier on the eyes
                      </p>
                    </div>
                    <Checkbox
                      checked={data.preferences.darkMode}
                      onCheckedChange={(checked) => 
                        updateData('preferences', { ...data.preferences, darkMode: checked as boolean })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Auto-sync Calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync with Google Calendar
                      </p>
                    </div>
                    <Checkbox
                      checked={data.preferences.autoSyncCalendar}
                      onCheckedChange={(checked) => 
                        updateData('preferences', { ...data.preferences, autoSyncCalendar: checked as boolean })
                      }
                    />
                  </div>
                </div>
              </Card>
              
              <div className="text-center">
                <h3 className="text-xl mb-2">🎉 You're all set!</h3>
                <p className="text-muted-foreground">
                  Click "Complete Setup" to start using your roommate dashboard!
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8E4DF] via-[#F5F3F0] to-[#E8E4DF] dark:from-gray-900 dark:via-[#3A3A3A] dark:to-[#4A4A4A] transition-colors duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-20 dark:opacity-15 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#E8A587] dark:bg-[#C99A82] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4A895] dark:bg-[#A88D7D] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C99A82] dark:bg-[#B89181] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">Setup Your Dashboard</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-white/20 dark:bg-black/20 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-[#E8A587] to-[#C99A82] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex items-center space-x-1">
                  <StepIcon className={`w-4 h-4 ${index <= currentStep ? 'text-[#E8A587]' : ''}`} />
                  <span className={index <= currentStep ? 'text-[#E8A587]' : ''}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto p-8 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl">
          <div className="animate-fade-in">
            {renderStepContent()}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/20 dark:border-white/10">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-[#E8A587] to-[#C99A82] hover:from-[#D4A895] hover:to-[#B89181] text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}