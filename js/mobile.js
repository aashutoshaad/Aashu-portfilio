document.addEventListener('DOMContentLoaded', function() {
    const readMoreBtn = document.querySelector('.read-more-btn');
    const expandedText = document.querySelector('.expanded-text');
    
    if (readMoreBtn && expandedText) {
        readMoreBtn.addEventListener('click', function() {
            expandedText.classList.toggle('show');
            expandedText.classList.toggle('d-none');
            this.textContent = expandedText.classList.contains('show') ? 'Read Less' : 'Read More';
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const mobileText = document.querySelector('.mobile-text');
        const desktopText = document.querySelector('.desktop-text');
        
        if (window.innerWidth > 768) {
            mobileText?.classList.add('d-none');
            desktopText?.classList.remove('d-none');
        } else {
            mobileText?.classList.remove('d-none');
            desktopText?.classList.add('d-none');
        }
        
        const readMoreButtons = document.querySelectorAll('.read-more-btn');
        if (window.innerWidth > 768) {
            readMoreButtons.forEach(button => button.style.display = 'none');
        } else {
            readMoreButtons.forEach(button => button.style.display = 'inline-block');
        }
    });

    if (window.innerWidth <= 768) {
        const paragraphs = document.querySelectorAll('.testimonial p.text-muted');
        paragraphs.forEach(paragraph => {
            const fullText = paragraph.textContent.trim();
            if (fullText.length > 150) {
                const truncatedText = fullText.substring(0, 150) + '...';
                paragraph.textContent = truncatedText;

                const readMoreBtn = document.createElement('button');
                readMoreBtn.textContent = 'Read More';
                readMoreBtn.classList.add('read-more-btn');

                readMoreBtn.addEventListener('click', function() {
                    if (this.textContent === 'Read More') {
                        paragraph.textContent = fullText;
                        this.textContent = 'Show Less';
                    } else {
                        paragraph.textContent = truncatedText;
                        this.textContent = 'Read More';
                    }
                });

                paragraph.parentNode.insertBefore(readMoreBtn, paragraph.nextSibling);
            }
        });
    }
});

/* ── mouse + touch parallax on person ── */
    /* ── stat counter animation ── */
    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          en.target.querySelectorAll('.stat-num').forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            let val = 0;
            const dur = 900, step = 16;
            const inc = target / (dur / step);
            const iv = setInterval(() => {
              val = Math.min(val + inc, target);
              el.textContent = Math.round(val) + suffix;
              if (val >= target) clearInterval(iv);
            }, step);
          });
          obs.unobserve(en.target);
        });
      }, { threshold: 0.4 });
      obs.observe(statsGrid);
    }
