// src/pages/CareerSelector.js
import React, { useState, useEffect } from "react";

/*
  How to use:
  1. Save this file as src/pages/CareerSelector.js
  2. Put images in the public folder:
     - public/images/courses/<course>.png
     - public/images/careers/<career-image>.png
  3. In App.js add a route -> <Route path="/" element={<CareerSelector />} />
*/

const COURSES = [
  {
    id: "science",
    title: "Science",
    subtitle: "Physics • Chemistry • Biology",
    img: "/images/courses/science.png",
    careers: {
      after10: [
        { id: "iti", title: "ITI / Trade", img: "/images/careers/iti.png", desc: "Vocational trades / skill courses." },
        { id: "diploma", title: "Polytechnic Diploma", img: "/images/careers/polytechnic.png", desc: "3-year engineering diplomas." }
      ],
      after12: [
        { id: "eng", title: "Engineering (B.Tech)", img: "/images/careers/engineering.png", desc: "Engineering degrees (CSE/ECE/ME)"},
        { id: "medical", title: "Medical (MBBS/BDS/Nursing)", img: "/images/careers/medical.png", desc: "Clinical & allied health professions."}
      ]
    }
  },
  {
    id: "commerce",
    title: "Commerce",
    subtitle: "Accounts • Business • Finance",
    img: "/images/courses/commerce.png",
    careers: {
      after10: [
        { id: "junior_clerk", title: "Junior Clerk / Office", img: "/images/careers/junior_clerk.png", desc: "Entry-level office roles & certificates." }
      ],
      after12: [
        { id: "bcom", title: "B.Com / BBA", img: "/images/careers/bcom.png", desc: "Commerce & management degrees."},
        { id: "ca", title: "Chartered Accountant (CA)", img: "/images/careers/ca.png", desc: "Professional accounting qualification."}
      ]
    }
  },
  {
    id: "arts",
    title: "Arts / Humanities",
    subtitle: "Design • Languages • Social Sciences",
    img: "/images/courses/arts.png",
    careers: {
      after10: [
        { id: "diploma_design", title: "Design Diploma", img: "/images/careers/design.png", desc: "Short diplomas in design fields." }
      ],
      after12: [
        { id: "ba", title: "BA", img: "/images/careers/ba.png", desc: "Bachelor of Arts in many subjects."},
        { id: "law", title: "Law (5-yr integrated)", img: "/images/careers/law.png", desc: "Integrated law programs."}
      ]
    }
  }
];

export default function CareerSelector() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tier, setTier] = useState("after12"); // "after10" | "after12"
  const [showModal, setShowModal] = useState(false);

  // close modal with ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openCourse(course, defaultTier = "after12") {
    setSelectedCourse(course);
    setTier(defaultTier);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedCourse(null);
  }

  const careersToShow = selectedCourse ? (selectedCourse.careers[tier] || []) : [];

  return (
    <div className="career-selector-page">
      <header className="cs-header">
        <h1>Course → Career mapping</h1>
        <p>Click a course to view career options after 10th and after 12th.</p>
      </header>

      <div className="course-grid">
        {COURSES.map((c) => (
          <article key={c.id} className="course-card" onClick={() => openCourse(c)}>
            <img src={c.img} alt={c.title} className="course-thumb" />
            <div className="course-info">
              <h3>{c.title}</h3>
              <p>{c.subtitle}</p>
            </div>
          </article>
        ))}
      </div>

      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{selectedCourse.title} — Career options</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div className="tier-toggle">
              <button
                className={tier === "after10" ? "active" : ""}
                onClick={() => setTier("after10")}
              >
                After 10th
              </button>
              <button
                className={tier === "after12" ? "active" : ""}
                onClick={() => setTier("after12")}
              >
                After 12th
              </button>
            </div>

            <div className="careers-grid">
              {careersToShow.length > 0 ? careersToShow.map((career) => (
                <div key={career.id} className="career-card">
                  <img src={career.img} alt={career.title} className="career-img" loading="lazy" />
                  <div className="career-text">
                    <h4>{career.title}</h4>
                    <p>{career.desc}</p>
                  </div>
                </div>
              )) : (
                <div className="no-careers">No career options available for this tier.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
