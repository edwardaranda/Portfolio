/* ==========================================================================
   Edward Aranda — Portfolio interactions
   Vanilla JS · no dependencies
   ========================================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ── Loader ─────────────────────────────────────────────────────────── */
  const loader = $("#loader");
  const loaderCount = $("#loader-count");
  const loaderFill = $("#loader-bar-fill");

  function revealPage() {
    document.body.classList.add("is-loaded");
    if (!loader) return;
    loader.classList.add("is-done");
    window.setTimeout(() => loader.setAttribute("hidden", ""), 1200);
  }

  if (loader && !reduceMotion) {
    const start = performance.now();
    const duration = 1450;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(eased * 100);
      if (loaderCount) loaderCount.textContent = String(value).padStart(2, "0");
      if (loaderFill) loaderFill.style.width = `${value}%`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        window.setTimeout(revealPage, 120);
      }
    };
    requestAnimationFrame(tick);
    // Safety net: never trap the page behind the loader.
    window.setTimeout(() => {
      if (!document.body.classList.contains("is-loaded")) revealPage();
    }, 3200);
  } else {
    revealPage();
  }

  /* ── Header, progress, parallax ─────────────────────────────────────── */
  const header = $("#site-header");
  const progressFill = $("#scroll-progress-fill");
  const parallaxItems = $$("[data-parallax]");
  let ticking = false;

  const updateOnScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressFill) progressFill.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    if (!reduceMotion) {
      const vh = window.innerHeight;
      parallaxItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const factor = parseFloat(el.dataset.parallax) || 0;
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.setProperty("--py", `${(-center * factor).toFixed(2)}px`);
      });
    }
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateOnScroll);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateOnScroll();

  /* ── Mobile menu ────────────────────────────────────────────────────── */
  const menuBtn = $("#menu-btn");
  const mobileMenu = $("#mobile-menu");
  const mainEl = $("#main");
  let menuReturnFocus = null;

  const setMenu = (open) => {
    if (!mobileMenu || !menuBtn) return;
    if (open) menuReturnFocus = document.activeElement;
    document.body.classList.toggle("menu-open", open);
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    // Keep keyboard focus out of the page sitting behind the full-screen menu.
    if (mainEl) mainEl.inert = open;

    if (open) {
      const firstLink = $("a", mobileMenu);
      if (firstLink) window.setTimeout(() => firstLink.focus(), 120);
      return;
    }

    const active = document.activeElement;
    const lostFocus = !active || active === document.body || mobileMenu.contains(active);
    if (menuReturnFocus && lostFocus) {
      const target = menuReturnFocus;
      menuReturnFocus = null;
      window.setTimeout(() => target.focus(), 120);
    } else {
      menuReturnFocus = null;
    }
  };

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("menu-open");
      setMenu(!isOpen);
    });
  }

  if (mobileMenu) {
    $$("a", mobileMenu).forEach((link) =>
      link.addEventListener("click", () => setMenu(false))
    );
  }

  // Header links stay visible above the overlay — close the menu if one is used.
  $$(".site-header a").forEach((link) =>
    link.addEventListener("click", () => setMenu(false))
  );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) setMenu(false);
  });

  /* ── Scrollspy ──────────────────────────────────────────────────────── */
  const navLinks = $$("[data-nav]");
  const watched = ["work", "about", "skills", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && watched.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.dataset.nav === entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px" }
    );
    watched.forEach((section) => spy.observe(section));
  }

  /* ── Reveal on scroll ───────────────────────────────────────────────── */
  const revealEls = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ── Counters ───────────────────────────────────────────────────────── */
  const counters = $$("[data-count]");

  // The markup ships the final numbers, so the page still reads correctly
  // without JS. Reset to zero only when the values are actually animated.
  if (!reduceMotion && "IntersectionObserver" in window) {
    counters.forEach((el) => {
      el.textContent = "00";
    });
  }

  const animateCounter = (el) => {
    const target = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = String(target).padStart(2, "0") + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = String(value).padStart(2, "0") + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }

  /* ── Infinite marquees ──────────────────────────────────────────────── */
  ["marquee-track", "software-track"].forEach((id) => {
    const track = document.getElementById(id);
    if (track) track.innerHTML += track.innerHTML;
  });

  /* ── Hero portrait tilt ─────────────────────────────────────────────── */
  const portrait = $("#portrait-wrap");
  if (portrait && finePointer && !reduceMotion) {
    portrait.addEventListener("pointermove", (event) => {
      const rect = portrait.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      portrait.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    });
    portrait.addEventListener("pointerleave", () => {
      portrait.style.setProperty("--rx", "0deg");
      portrait.style.setProperty("--ry", "0deg");
    });
  }

  /* ── Magnetic buttons ───────────────────────────────────────────────── */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.translate = `${x * 0.16}px ${y * 0.16}px`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.translate = "";
      });
    });
  }

  /* ── Custom cursor ──────────────────────────────────────────────────── */
  const cursor = $(".cursor");
  if (cursor && finePointer && !reduceMotion) {
    document.body.classList.add("cursor-enabled");
    let curX = window.innerWidth / 2;
    let curY = window.innerHeight / 2;
    let targetX = curX;
    let targetY = curY;

    document.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add("is-visible");
    });

    document.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-visible");
    });

    const cursorLoop = () => {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      requestAnimationFrame(cursorLoop);
    };
    requestAnimationFrame(cursorLoop);

    document.addEventListener("pointerover", (event) => {
      const interactive = event.target.closest("a, button, [data-cursor]");
      cursor.classList.toggle("is-active", Boolean(interactive));
    });
  }

  /* ── Featured film ──────────────────────────────────────────────────── */
  const featured = $("#featured-video");
  const muteBtn = $("#mute-btn");
  const filmPlay = $("#film-play");
  let featuredInView = false;

  if (featured && "IntersectionObserver" in window && !reduceMotion) {
    const filmObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          featuredInView = entry.isIntersecting;
          if (entry.isIntersecting) {
            featured.play().catch(() => {});
          } else {
            featured.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    filmObserver.observe(featured);
  }

  if (muteBtn && featured) {
    muteBtn.addEventListener("click", () => {
      const willUnmute = featured.muted;
      featured.muted = !willUnmute;
      muteBtn.setAttribute("aria-pressed", String(willUnmute));
      muteBtn.setAttribute("aria-label", willUnmute ? "Mute film" : "Unmute film");
      if (willUnmute) featured.play().catch(() => {});
    });
  }

  /* ── Work filters ───────────────────────────────────────────────────── */
  const filterButtons = $$(".filter");
  const workCards = $$(".work-card");
  const filterStatus = $("#filter-status");
  let activeFilter = "all";

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      activeFilter = value;
      filterButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      let visible = 0;
      workCards.forEach((card) => {
        const show = value === "all" || card.dataset.category === value;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
          card.classList.add("is-in");
        } else {
          const preview = $("video", card);
          if (preview) preview.pause();
        }
      });

      if (filterStatus) {
        filterStatus.textContent = `Showing ${visible} project${visible === 1 ? "" : "s"}`;
      }
    });
  });

  /* ── Hover video previews ───────────────────────────────────────────── */
  const previewTargets = $$("[data-preview]");
  const previewVideos = [];

  if (finePointer && !reduceMotion) {
    previewTargets.forEach((media) => {
      let video = null;

      const start = () => {
        if (!video) {
          video = document.createElement("video");
          video.src = media.dataset.preview;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.preload = "auto";
          video.setAttribute("aria-hidden", "true");
          video.className = "work-preview";
          media.appendChild(video);
          previewVideos.push(video);
          video.addEventListener("playing", () => video.classList.add("is-ready"));
        }
        video.play().catch(() => {});
      };

      const stop = () => {
        if (!video) return;
        video.pause();
        video.classList.remove("is-ready");
      };

      media.addEventListener("pointerenter", start);
      media.addEventListener("pointerleave", stop);
    });
  }

  /* ── Lightbox ───────────────────────────────────────────────────────── */
  const lightbox = $("#lightbox");
  const lbMedia = $("#lb-media");
  const lbTitle = $("#lb-title");
  const lbSub = $("#lb-sub");
  const lbDesc = $("#lb-desc");
  const lbCount = $("#lb-count");
  const lbPrev = $("#lb-prev");
  const lbNext = $("#lb-next");
  const lbClose = $("#lb-close");

  const workLinks = $$(".work-link");
  const items = workLinks.map((link) => ({
    type: link.dataset.type,
    src: link.dataset.src,
    poster: link.dataset.poster || "",
    title: link.dataset.title || "",
    sub: link.dataset.sub || "",
    desc: link.dataset.desc || "",
    category: link.closest(".work-card")?.dataset.category || "all",
  }));

  const filmItem = {
    type: "video",
    src: "assets/web/video/coffee-shop.mp4",
    poster: "assets/web/posters/coffee-shop.jpg",
    title: "Coffee & Co.",
    sub: "Character animation · Short film",
    desc: "A character-led short film built entirely in Blender — a tiny corner café, a cat barista and a whole lot of warm light.",
  };

  let currentIndex = 0;
  let filmMode = false;

  // The lightbox follows the active filter, so "next" never jumps to a
  // project the visitor cannot currently see in the grid.
  const visibleItems = () =>
    activeFilter === "all" ? items : items.filter((item) => item.category === activeFilter);

  const pausePreviewVideos = () => {
    previewVideos.forEach((video) => video.pause());
    if (featured) featured.pause();
  };

  const renderMedia = (item) => {
    if (!lbMedia) return;
    lbMedia.innerHTML = "";

    if (item.type === "video") {
      const video = document.createElement("video");
      video.src = item.src;
      if (item.poster) video.poster = item.poster;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("aria-label", item.title);
      lbMedia.appendChild(video);
      video.play().catch(() => {});
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.title;
      lbMedia.appendChild(img);
    }

    if (lbTitle) lbTitle.textContent = item.title;
    if (lbSub) lbSub.textContent = item.sub;
    if (lbDesc) lbDesc.textContent = item.desc;
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    const list = visibleItems();
    if (!list.length) return;
    filmMode = false;
    currentIndex = (index + list.length) % list.length;
    renderMedia(list[currentIndex]);
    if (lbCount) {
      lbCount.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    }
    pausePreviewVideos();
    if (!lightbox.open) lightbox.showModal();
    document.body.classList.add("lb-open");
  };

  const openFilm = () => {
    if (!lightbox) return;
    filmMode = true;
    currentIndex = 0;
    renderMedia(filmItem);
    if (lbCount) lbCount.textContent = "FEATURED FILM";
    pausePreviewVideos();
    if (!lightbox.open) lightbox.showModal();
    document.body.classList.add("lb-open");
  };

  const stepLightbox = (direction) => {
    if (filmMode) {
      const list = visibleItems();
      openLightbox(direction > 0 ? 0 : list.length - 1);
      return;
    }
    openLightbox(currentIndex + direction);
  };

  workLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const listIndex = visibleItems().indexOf(items[index]);
      openLightbox(listIndex < 0 ? 0 : listIndex);
    });
  });

  if (filmPlay) filmPlay.addEventListener("click", openFilm);
  if (lbPrev) lbPrev.addEventListener("click", () => stepLightbox(-1));
  if (lbNext) lbNext.addEventListener("click", () => stepLightbox(1));
  if (lbClose) lbClose.addEventListener("click", () => lightbox && lightbox.close());

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lb-open");
      if (lbMedia) lbMedia.innerHTML = "";
      if (featured && featuredInView && !reduceMotion) featured.play().catch(() => {});
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.open) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
    }
  });

  /* ── Local time & year ──────────────────────────────────────────────── */
  const timeEl = $("#local-time");
  if (timeEl) {
    const formatTime = () => {
      try {
        return new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Merida",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());
      } catch (error) {
        return new Date().toLocaleTimeString("en-US");
      }
    };
    const tickClock = () => {
      timeEl.textContent = formatTime();
    };
    tickClock();
    window.setInterval(tickClock, 1000);
  }

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
