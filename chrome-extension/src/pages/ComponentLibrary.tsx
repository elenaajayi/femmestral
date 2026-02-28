import FactCheckBadge from "@/components/femstral/FactCheckBadge";
import FactCheckPanel from "@/components/femstral/FactCheckPanel";
import FemstralInsightPopup from "@/components/femstral/FemstralInsightPopup";
import FemstralLogo from "@/components/femstral/FemstralLogo";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const ComponentLibrary = () => {
  return (
    <div className="min-h-screen bg-[hsl(220,14%,20%)] p-4 sm:p-8">
      <nav className="max-w-6xl mx-auto mb-4 flex items-center gap-4">
        <span className="font-bold text-[hsl(0,0%,100%)] text-lg">Femstral Demo</span>
        <div className="flex gap-3 text-sm">
          <NavLink to="/" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Thread View</NavLink>
          <NavLink to="/popup" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Selection Pop-Up</NavLink>
          <NavLink to="/components" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Components</NavLink>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Logo */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h1 className="text-xl font-bold text-[hsl(220,9%,20%)] mb-6">Femstral Component Library</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-3">Logo</h2>
              <div className="flex items-center gap-8">
                <FemstralLogo size={14} />
                <FemstralLogo size={20} />
                <FemstralLogo size={28} />
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Primary", color: "bg-primary", text: "text-primary-foreground" },
              { name: "Secondary", color: "bg-secondary", text: "text-secondary-foreground" },
              { name: "Supported", color: "bg-femstral-supported", text: "text-primary-foreground" },
              { name: "Partial", color: "bg-femstral-partial", text: "text-primary-foreground" },
              { name: "Unsupported", color: "bg-femstral-unsupported", text: "text-primary-foreground" },
              { name: "Background", color: "bg-background border", text: "text-foreground" },
              { name: "Muted", color: "bg-muted", text: "text-muted-foreground" },
              { name: "Accent", color: "bg-accent", text: "text-accent-foreground" },
            ].map(({ name, color, text }) => (
              <div key={name} className={`h-14 rounded-lg ${color} ${text} flex items-end p-2`}>
                <span className="text-[10px] font-medium">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-4">Typography</h2>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-foreground">Heading — Inter Bold 24px</p>
            <p className="text-lg font-semibold text-foreground">Subheading — Inter Semibold 18px</p>
            <p className="text-sm text-foreground">Body — Inter Regular 14px</p>
            <p className="text-xs text-muted-foreground">Caption — Inter Regular 12px</p>
          </div>
        </section>

        {/* Badges */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-4">Fact-Check Badges</h2>
          <div className="flex flex-wrap gap-3">
            <FactCheckBadge status="supported" />
            <FactCheckBadge status="partial" />
            <FactCheckBadge status="unsupported" />
          </div>
        </section>

        {/* Buttons */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button><ExternalLink size={14} />View Trusted Resource</Button>
            <Button variant="secondary"><BookOpen size={14} />Learn More</Button>
            <Button variant="outline">Dismiss</Button>
            <Button variant="ghost">Why this matters</Button>
          </div>
        </section>

        {/* Inline Panels */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6 space-y-4">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-2">Inline Fact-Check Panels</h2>
          <FactCheckPanel status="supported" summary="Declining estrogen levels during perimenopause are associated with increased joint pain." confidence={89} citations={["Mayo Clinic", "NIH", "ACOG"]} />
          <FactCheckPanel status="partial" summary="Magnesium supplementation has some evidence for musculoskeletal benefit." confidence={76} citations={["Mayo Clinic", "NIH"]} />
          <FactCheckPanel status="unsupported" summary="No clinical evidence supports turmeric and black cohosh as estrogen replacements." confidence={94} citations={["NIH", "Cochrane Library", "NCCIH"]} />
        </section>

        {/* Floating Popups */}
        <section className="rounded-xl border border-[hsl(220,13%,90%)] bg-[hsl(0,0%,100%)] p-6">
          <h2 className="text-xs font-semibold text-[hsl(220,9%,46%)] uppercase tracking-wider mb-6">Floating Insight Popups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FemstralInsightPopup
              status="supported"
              explanation="Research confirms that musculoskeletal complaints are reported by 40–60% of women during perimenopause."
              whyItMatters="Understanding prevalence helps normalize the experience."
            />
            <FemstralInsightPopup
              status="unsupported"
              explanation="No clinical evidence supports herbal supplements replacing estrogen therapy for joint pain relief."
              whyItMatters="Misleading health claims can delay effective treatment."
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComponentLibrary;
