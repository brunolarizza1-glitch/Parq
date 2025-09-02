import { useState } from "react";
import {
  DSH1,
  DSH2,
  DSBody,
  DSCaption,
  DSButton,
  DSInput,
  DSSelect,
  DSSelectContent,
  DSSelectItem,
  DSSelectTrigger,
  DSSelectValue,
  DSChip,
  DSDateTimeInput,
  DSDateInput,
  DSTimeInput,
} from "@/components/ds";

export default function DesignSystemDemo() {
  const [selectedChips, setSelectedChips] = useState<string[]>(["parking", "covered"]);
  
  const toggleChip = (value: string) => {
    setSelectedChips(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Typography */}
        <section className="space-y-4 animate-fade-in">
          <DSH1>Design System</DSH1>
          <DSH2>Typography & Components</DSH2>
          <DSBody>
            This demonstrates our enhanced design system with WCAG AA compliant colors, 
            modern gradients, improved typography hierarchy, and refined component styling.
          </DSBody>
          <DSCaption>
            All components follow our 8-point spacing scale and modern visual standards.
          </DSCaption>
        </section>

        {/* Visual Effects Demo */}
        <section className="space-y-4">
          <DSH2>Visual Effects</DSH2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-gradient p-4 rounded-lg">
              <DSCaption>Card Gradient</DSCaption>
            </div>
            <div className="glass-effect p-4 rounded-lg">
              <DSCaption>Glass Effect</DSCaption>
            </div>
            <div className="p-4 rounded-lg shadow-soft bg-card">
              <DSCaption>Soft Shadow</DSCaption>
            </div>
          </div>
        </section>

        {/* Enhanced Buttons */}
        <section className="space-y-4">
          <DSH2>Enhanced Buttons</DSH2>
          <div className="flex flex-wrap gap-4">
            <DSButton className="btn-primary">Primary Button</DSButton>
            <DSButton className="btn-secondary">Secondary Button</DSButton>
            <DSButton className="btn-accent">Accent Button</DSButton>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-3">
          <DSH2>Buttons</DSH2>
          <div className="flex flex-wrap gap-2">
            <DSButton variant="primary">Primary Button</DSButton>
            <DSButton variant="secondary">Secondary Button</DSButton>
            <DSButton variant="destructive">Destructive Button</DSButton>
            <DSButton variant="outline">Outline Button</DSButton>
            <DSButton variant="ghost">Ghost Button</DSButton>
          </div>
          
          <DSCaption>Different sizes:</DSCaption>
          <div className="flex flex-wrap gap-2 items-end">
            <DSButton size="sm" variant="primary">Small</DSButton>
            <DSButton size="md" variant="primary">Medium</DSButton>
            <DSButton size="lg" variant="primary">Large</DSButton>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-3">
          <DSH2>Form Inputs</DSH2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <DSCaption>Text Input</DSCaption>
              <DSInput placeholder="Enter your email" type="email" />
            </div>
            
            <div className="space-y-1">
              <DSCaption>Select Dropdown</DSCaption>
              <DSSelect>
                <DSSelectTrigger>
                  <DSSelectValue placeholder="Select a location" />
                </DSSelectTrigger>
                <DSSelectContent>
                  <DSSelectItem value="downtown">Downtown</DSSelectItem>
                  <DSSelectItem value="mission">Mission District</DSSelectItem>
                  <DSSelectItem value="soma">SoMa</DSSelectItem>
                  <DSSelectItem value="richmond">Richmond</DSSelectItem>
                </DSSelectContent>
              </DSSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DSDateInput label="Date" />
            <DSTimeInput label="Time" />
            <DSDateTimeInput label="Date & Time" />
          </div>
        </section>

        {/* Chips */}
        <section className="space-y-3">
          <DSH2>Filter Chips</DSH2>
          <DSBody>Click chips to toggle selection state:</DSBody>
          
          <div className="flex flex-wrap gap-2">
            {["parking", "covered", "ev-charging", "24-7", "secure", "cheap"].map((filter) => (
              <DSChip
                key={filter}
                variant={selectedChips.includes(filter) ? "selected" : "default"}
                className="cursor-pointer"
                onClick={() => toggleChip(filter)}
              >
                {filter.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </DSChip>
            ))}
          </div>
          
          <DSCaption>Removable chips:</DSCaption>
          <div className="flex flex-wrap gap-2">
            {selectedChips.map((filter) => (
              <DSChip
                key={filter}
                variant="selected"
                removable
                onRemove={() => toggleChip(filter)}
              >
                {filter.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </DSChip>
            ))}
          </div>
        </section>

        {/* Spacing Examples */}
        <section className="space-y-3">
          <DSH2>8-Point Spacing Scale</DSH2>
          <DSBody>Visual representation of our spacing system:</DSBody>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 6].map((space) => (
              <div key={space} className="flex items-center gap-4">
                <DSCaption className="w-16">Space {space}:</DSCaption>
                <div 
                  className="bg-primary h-4"
                  style={{ width: `${space * 8}px` }}
                />
                <DSCaption>{space * 8}px</DSCaption>
              </div>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-3">
          <DSH2>WCAG AA Colors</DSH2>
          <DSBody>All colors meet accessibility contrast requirements:</DSBody>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground p-3 rounded">
                <DSCaption className="text-primary-foreground">Primary</DSCaption>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-secondary text-secondary-foreground p-3 rounded">
                <DSCaption className="text-secondary-foreground">Secondary</DSCaption>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-destructive text-destructive-foreground p-3 rounded">
                <DSCaption className="text-destructive-foreground">Destructive</DSCaption>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-muted text-muted-foreground p-3 rounded">
                <DSCaption>Muted</DSCaption>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}