import { useState } from "react";
import ChromeFrame from "@/components/femstral/ChromeFrame";
import RedditNav from "@/components/femstral/RedditNav";
import RedditSidebar from "@/components/femstral/RedditSidebar";
import RedditPost from "@/components/femstral/RedditPost";
import RedditComment from "@/components/femstral/RedditComment";
import FemstralInsightPopup from "@/components/femstral/FemstralInsightPopup";
import { NavLink } from "@/components/NavLink";
import supplementsImg from "@/assets/supplements.jpg";
import magnesiumImg from "@/assets/magnesium.jpg";

const RedditThread = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-[hsl(220,14%,20%)] p-4 sm:p-8">
      {/* Page nav */}
      <nav className="max-w-6xl mx-auto mb-4 flex items-center gap-4">
        <span className="font-bold text-[hsl(0,0%,100%)] text-lg">Femstral Demo</span>
        <div className="flex gap-3 text-sm">
          <NavLink to="/" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Thread View</NavLink>
          <NavLink to="/popup" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Selection Pop-Up</NavLink>
          <NavLink to="/components" className="text-[hsl(0,0%,70%)] hover:text-[hsl(0,0%,100%)]">Components</NavLink>
        </div>
      </nav>

      <ChromeFrame
        className="max-w-6xl mx-auto h-[85vh]"
        url="reddit.com/r/Perimenopause/comments/abc123/has_anyone_experienced_sudden_joint_pain"
        tabs={[
          {
            title: "r/Perimenopause - Has anyone experienced...",
            active: activeTab === 0,
            favicon: <div className="w-4 h-4 rounded-full bg-[hsl(16,100%,50%)] shrink-0 flex items-center justify-center"><span className="text-[6px] text-[hsl(0,0%,100%)] font-bold">r</span></div>,
          },
          {
            title: "Google",
            active: activeTab === 1,
            favicon: <div className="w-4 h-4 rounded-full bg-[hsl(217,89%,61%)] shrink-0 flex items-center justify-center"><span className="text-[6px] text-[hsl(0,0%,100%)] font-bold">G</span></div>,
          },
        ]}
        onTabClick={setActiveTab}
      >
        {activeTab === 0 && (
          <>
            <RedditNav />
            <div className="bg-[hsl(var(--reddit-bg))] min-h-full">
              <div className="max-w-5xl mx-auto flex gap-6 py-5 px-4">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <RedditPost
                    subreddit="r/Perimenopause"
                    author="wellness_journey42"
                    timeAgo="8h"
                    title="Has anyone experienced sudden joint pain during perimenopause? Is this really hormonal?"
                    content="I'm 47 and over the past few months, I've been getting this intense stiffness and aching in my hands and knees, especially in the morning. My doctor says it could be related to perimenopause but I'm not sure. Has anyone else dealt with this? What helped?"
                    upvotes={284}
                    comments={47}
                  >
                    <RedditComment
                      author="hormonehealth_sarah"
                      timeAgo="6h"
                      content="Yes! Estrogen has anti-inflammatory properties, so when levels decline during perimenopause, joint inflammation can increase. It's one of the most under-discussed symptoms. Studies show that up to 50% of women experience musculoskeletal symptoms during the menopausal transition. HRT can help significantly with joint pain."
                      upvotes={142}
                      factCheck={{
                        status: "supported",
                        summary: "Declining estrogen levels during perimenopause are associated with increased joint pain and inflammation. Research confirms estrogen's anti-inflammatory role and the prevalence of musculoskeletal symptoms during menopausal transition.",
                        confidence: 89,
                        citations: ["Mayo Clinic", "NIH", "ACOG"],
                      }}
                    />

                    <RedditComment
                      author="natural_remedies_mom"
                      timeAgo="5h"
                      content="Skip the HRT — just take turmeric and black cohosh together. They completely replace estrogen naturally and will cure your joint pain within a week. I also stopped eating all nightshade vegetables and my inflammation completely disappeared. Big pharma doesn't want you to know this."
                      upvotes={38}
                      image={{ src: supplementsImg, alt: "Turmeric and herbal supplement capsules on a wooden table" }}
                      factCheck={{
                        status: "unsupported",
                        summary: "There is no clinical evidence that turmeric and black cohosh 'replace estrogen' or cure joint pain within a week. While turmeric has some anti-inflammatory properties, claims of complete estrogen replacement are not supported by medical research. The attached image shows common supplements but their efficacy for this use is unverified.",
                        confidence: 94,
                        citations: ["NIH", "Cochrane Library", "NCCIH"],
                      }}
                    />

                    <RedditComment
                      author="perimenopause_warrior"
                      timeAgo="4h"
                      content="Magnesium supplements helped me a lot with the joint stiffness. I take about 400mg daily. It won't solve everything, but combined with regular low-impact exercise like swimming, it's made a real difference. Still, definitely talk to your doctor about whether HRT might be right for you."
                      upvotes={97}
                      image={{ src: magnesiumImg, alt: "Magnesium supplement bottle with capsules" }}
                      factCheck={{
                        status: "partial",
                        summary: "Magnesium supplementation at 400mg/day is within recommended ranges and has some evidence for musculoskeletal benefit. Low-impact exercise is well-supported for joint health. However, magnesium alone is not a proven treatment specifically for perimenopausal joint pain. The product shown in the image is a standard magnesium supplement.",
                        confidence: 76,
                        citations: ["Mayo Clinic", "NIH"],
                      }}
                    />
                  </RedditPost>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-[300px] shrink-0">
                  <RedditSidebar />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div className="flex items-center justify-center h-full text-[hsl(220,9%,46%)] text-sm">
            Switch to the Reddit tab to view the Femstral demo
          </div>
        )}
      </ChromeFrame>
    </div>
  );
};

export default RedditThread;
