      // SA who it's for (11.2-19.4)
      tl.fromTo("#sa-eye", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 11.3);
      tl.fromTo("#sa-h", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: E }, 11.35);
      [["#wa1", 14.15], ["#wa2", 15.3], ["#wa3", 16.95]].forEach(([id, t]) => {
        tl.fromTo(id, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }, t);
      });
      tl.to("#sa .center", { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 19.05);
      // SB use cases (23.6-39.8)
      tl.fromTo("#sb-eye", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 23.7);
      tl.fromTo("#sb-h", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: E }, 23.75);
      [["#u1", 25.55], ["#u2", 26.85], ["#u3", 28.25], ["#u4", 33.65], ["#u5", 36.05]].forEach(([id, t]) => {
        tl.fromTo(id, { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.5)" }, t);
      });
      tl.to("#sb .center", { opacity: 0, scale: 0.97, duration: 0.35, ease: "power2.in" }, 39.45);
      // SC rules (48.8-61.6)
      tl.fromTo("#sc-eye", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 48.9);
      tl.fromTo("#sc-h", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: E }, 48.95);
      [["#r-1", 51.45], ["#r-2", 54.65], ["#r-3", 56.55]].forEach(([id, t]) => {
        tl.fromTo(id, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: E }, t);
      });
      tl.to("#sc .center", { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, 61.25);
      // SD privacy (71.2-80.4)
      tl.fromTo("#sd-eye", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 71.3);
      tl.fromTo("#sd-h", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: E }, 71.35);
      [["#pv1", 72.9], ["#pv2", 74.45], ["#pv3", 77.05]].forEach(([id, t]) => {
        tl.fromTo(id, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }, t);
      });
      tl.to("#sd .center", { opacity: 0, scale: 0.97, duration: 0.35, ease: "power2.in" }, 80.05);
