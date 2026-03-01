import { useState } from "react";
import ChromeFrame from "@/components/femstral/ChromeFrame";
import RedditNav from "@/components/femstral/RedditNav";
import RedditSidebar from "@/components/femstral/RedditSidebar";
import RedditPost from "@/components/femstral/RedditPost";
import RedditComment from "@/components/femstral/RedditComment";
import FemstralInsightPopup from "@/components/femstral/FemstralInsightPopup";
import { NavLink } from "@/components/NavLink";

const PopupDemo = () => {
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

      <ChromeFrame
        className="max-w-6xl mx-auto h-[85vh]"
        url="reddit.com/r/Perimenopause/comments/abc123/has_anyone_experienced_sudden_joint_pain"
        tabs={[
          {
            title: "r/Perimenopause - Has anyone experienced...",
            active: true,
            favicon: <div className="w-4 h-4 rounded-full bg-[hsl(16,100%,50%)] shrink-0 flex items-center justify-center"><span className="text-[6px] text-[hsl(0,0%,100%)] font-bold">r</span></div>,
          },
        ]}
      >
        <RedditNav />
        <div className="bg-[hsl(var(--reddit-bg))] min-h-full">
          <div className="max-w-5xl mx-auto flex gap-6 py-5 px-4">
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
                <div className="relative">
                  <RedditComment
                    author="hormonehealth_sarah"
                    timeAgo="6h"
                    content="Yes! Estrogen has anti-inflammatory properties, so when levels decline during perimenopause, joint inflammation can increase. It's one of the most under-discussed symptoms. Studies show that up to 50% of women experience musculoskeletal symptoms during the menopausal transition. HRT can help significantly with joint pain."
                    upvotes={142}
                    highlightedText="up to 50% of women experience musculoskeletal symptoms"
                  />

                  {/* Floating popup */}
                  <div className="absolute right-[-20px] top-12 z-10">
                    <FemstralInsightPopup
                      status="supported"
                      explanation="Research published in Climacteric (2019) and the Journal of Menopausal Medicine confirms that musculoskeletal complaints are reported by 40–60% of women during perimenopause, making this a well-documented statistic."
                      whyItMatters="Understanding the prevalence of joint symptoms during perimenopause helps normalize the experience and encourages women to seek appropriate medical care rather than dismissing symptoms as unrelated to hormonal changes."
                      learnMoreUrl="#"
                    />
                  </div>
                </div>

                <RedditComment
                  author="natural_remedies_mom"
                  timeAgo="5h"
                  content="Skip the HRT — just take turmeric and black cohosh together. They completely replace estrogen naturally and will cure your joint pain within a week. I also stopped eating all nightshade vegetables and my inflammation completely disappeared. Big pharma doesn't want you to know this."
                  upvotes={38}
                />

                <RedditComment
                  author="perimenopause_warrior"
                  timeAgo="4h"
                  content="Magnesium supplements helped me a lot with the joint stiffness. I take about 400mg daily. It won't solve everything, but combined with regular low-impact exercise like swimming, it's made a real difference. Still, definitely talk to your doctor about whether HRT might be right for you."
                  upvotes={97}
                />
              </RedditPost>

              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-xs text-[hsl(220,9%,46%)]">
                  ↑ The highlighted text <mark className="bg-primary/20 text-foreground rounded px-1">"up to 50% of women..."</mark> triggers the floating <strong className="text-primary">Femstral Insight</strong> popup.
                  <br />
                  In the real extension, this appears when users select any text in a Reddit comment.
                </p>
              </div>
            </div>

            <div className="hidden lg:block w-[300px] shrink-0">
              <RedditSidebar />
            </div>
          </div>
        </div>
      </ChromeFrame>
    </div>
  );
};

export default PopupDemo;
