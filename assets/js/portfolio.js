/* =========================================================================
   Portfolio engine (Alpine 3)
   - Renders projects from data/projects.json
   - Per-card carousel + full-screen zoom/pan lightbox
   - Owner-only login (cosmetic gate) + add/edit/delete project form
   - Image upload to Cloudinary (unsigned), drag & drop + clipboard paste
   - Export the working list back to projects.json (commit to publish)
   ========================================================================= */
(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const DRAFT_KEY = 'pf_draft_projects';
  const SESSION_KEY = 'pf_owner_session';

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function slugify(s) {
    return (
      (s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || 'project-' + Date.now()
    );
  }

  function blankForm() {
    return {
      id: '',
      title: '',
      tagsText: '',
      descText: '',
      featText: '',
      note: '',
      links: [{ label: '', url: '' }],
      images: [], // { url, uploading, error }
      video: '',
    };
  }

  // Console helper to (re)generate the owner password hash.
  window.PortfolioAuth = {
    async hash(pw) {
      const h = await sha256(pw);
      console.log('SHA-256:', h);
      return h;
    },
  };

  document.addEventListener('alpine:init', () => {
    Alpine.store('auth', {
      isOwner: localStorage.getItem(SESSION_KEY) === (cfg.ownerEmail || ''),
      async login(email, password) {
        if ((email || '').trim().toLowerCase() !== (cfg.ownerEmail || '').toLowerCase())
          return 'Email incorect.';
        const h = await sha256(password || '');
        if (h !== cfg.ownerPasswordSha256) return 'Parolă incorectă.';
        localStorage.setItem(SESSION_KEY, cfg.ownerEmail);
        this.isOwner = true;
        return null;
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        this.isOwner = false;
      },
    });

    /* ---- per-card carousel ---- */
    Alpine.data('pfCarousel', (project) => ({
      project,
      active: 0,
      startX: null,
      get count() {
        return (this.project.images || []).length;
      },
      next() {
        if (this.active < this.count - 1) this.active++;
      },
      prev() {
        if (this.active > 0) this.active--;
      },
      go(i) {
        this.active = i;
      },
      touchStart(e) {
        this.startX = e.touches ? e.touches[0].clientX : null;
      },
      touchEnd(e) {
        if (this.startX == null) return;
        const end = e.changedTouches ? e.changedTouches[0].clientX : this.startX;
        const dx = end - this.startX;
        if (dx < -40) this.next();
        else if (dx > 40) this.prev();
        this.startX = null;
      },
      zoom() {
        this.$dispatch('pf-zoom', { images: this.project.images, index: this.active });
      },
    }));

    /* ---- main portfolio component ---- */
    Alpine.data('portfolio', () => ({
      projects: [],
      loading: true,
      loadError: '',

      // login modal
      showLogin: false,
      loginEmail: '',
      loginPassword: '',
      loginError: '',
      loggingIn: false,

      // project form
      showForm: false,
      editingIndex: null,
      form: blankForm(),
      saving: false,
      formError: '',
      drag: false,

      // lightbox
      lb: { open: false, images: [], idx: 0, scale: 1, tx: 0, ty: 0, panning: false, sx: 0, sy: 0 },

      get isOwner() {
        return Alpine.store('auth').isOwner;
      },
      get hasDraft() {
        return !!localStorage.getItem(DRAFT_KEY);
      },

      async init() {
        await this.load();
        window.addEventListener('paste', (e) => this.onPaste(e));
        window.addEventListener('keydown', (e) => this.onKey(e));
      },

      async load() {
        this.loading = true;
        this.loadError = '';
        try {
          const res = await fetch(cfg.projectsUrl, { cache: 'no-cache' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const published = await res.json();
          let draft = null;
          if (this.isOwner) {
            try {
              draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
            } catch (_) {}
          }
          this.projects = Array.isArray(draft) ? draft : published;
        } catch (e) {
          this.loadError = 'Nu am putut încărca proiectele (' + e.message + ').';
          this.projects = [];
        }
        this.loading = false;
      },

      /* ---------- auth ---------- */
      openLogin() {
        this.loginError = '';
        this.loginEmail = '';
        this.loginPassword = '';
        this.showLogin = true;
      },
      async doLogin() {
        this.loggingIn = true;
        this.loginError = '';
        const err = await Alpine.store('auth').login(this.loginEmail, this.loginPassword);
        this.loggingIn = false;
        if (err) {
          this.loginError = err;
          return;
        }
        this.showLogin = false;
        this.loginPassword = '';
        await this.load();
      },
      logout() {
        Alpine.store('auth').logout();
        this.load();
      },

      /* ---------- form ---------- */
      openAdd() {
        this.editingIndex = null;
        this.form = blankForm();
        this.formError = '';
        this.showForm = true;
      },
      openEdit(i) {
        const p = this.projects[i];
        this.editingIndex = i;
        this.form = {
          id: p.id || '',
          title: p.title || '',
          tagsText: (p.tags || []).join(', '),
          descText: (p.description || []).join('\n\n'),
          featText: (p.features || []).join('\n'),
          note: p.note || '',
          links: (p.links && p.links.length ? p.links : [{ label: '', url: '' }]).map((l) => ({ ...l })),
          images: (p.images || []).map((u) => ({ url: u, uploading: false })),
          video: p.video || '',
        };
        this.formError = '';
        this.showForm = true;
      },
      addLink() {
        this.form.links.push({ label: '', url: '' });
      },
      removeLink(i) {
        this.form.links.splice(i, 1);
        if (!this.form.links.length) this.form.links.push({ label: '', url: '' });
      },
      removeImage(i) {
        this.form.images.splice(i, 1);
      },
      moveImage(i, dir) {
        const j = i + dir;
        if (j < 0 || j >= this.form.images.length) return;
        const arr = this.form.images;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      },

      /* ---------- uploads ---------- */
      onDrop(e) {
        this.drag = false;
        if (e.dataTransfer && e.dataTransfer.files) this.uploadFiles(e.dataTransfer.files);
      },
      onPickFiles(e) {
        this.uploadFiles(e.target.files);
        e.target.value = '';
      },
      onPaste(e) {
        if (!this.showForm) return;
        const items = (e.clipboardData && e.clipboardData.items) || [];
        const files = [];
        for (const it of items) {
          if (it.type && it.type.startsWith('image/')) {
            const f = it.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length) {
          e.preventDefault();
          this.uploadFiles(files);
        }
      },
      async uploadFiles(fileList) {
        const files = Array.from(fileList || []).filter((f) => f.type && f.type.startsWith('image/'));
        for (const file of files) {
          const item = Alpine.reactive({ url: URL.createObjectURL(file), uploading: true, error: false });
          this.form.images.push(item);
          try {
            item.url = await this.cloudinaryUpload(file);
            item.uploading = false;
          } catch (err) {
            item.uploading = false;
            item.error = true;
            this.formError = 'Upload eșuat: ' + err.message + '. Verifică upload preset-ul Cloudinary.';
          }
        }
      },
      async cloudinaryUpload(file) {
        const c = cfg.cloudinary || {};
        if (!c.cloudName || !c.uploadPreset) throw new Error('Cloudinary neconfigurat');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', c.uploadPreset);
        if (c.folder) fd.append('folder', c.folder);
        const res = await fetch('https://api.cloudinary.com/v1_1/' + c.cloudName + '/upload', {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) throw new Error('Cloudinary ' + res.status);
        const data = await res.json();
        return data.secure_url;
      },

      /* ---------- save / persist ---------- */
      buildProject() {
        const f = this.form;
        const p = {
          id: f.id || slugify(f.title),
          title: f.title.trim(),
          tags: f.tagsText.split(',').map((s) => s.trim()).filter(Boolean),
          description: f.descText.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
          features: f.featText.split('\n').map((s) => s.trim()).filter(Boolean),
          links: f.links
            .filter((l) => l.url.trim())
            .map((l) => ({ label: l.label.trim() || l.url.trim(), url: l.url.trim() })),
          images: f.images.filter((im) => im.url && !im.error).map((im) => im.url),
        };
        if (f.note.trim()) p.note = f.note.trim();
        if (f.video.trim()) p.video = f.video.trim();
        return p;
      },
      saveProject() {
        this.formError = '';
        if (!this.form.title.trim()) {
          this.formError = 'Titlul e obligatoriu.';
          return;
        }
        if (this.form.images.some((i) => i.uploading)) {
          this.formError = 'Așteaptă terminarea încărcării pozelor.';
          return;
        }
        const p = this.buildProject();
        if (this.editingIndex === null) this.projects.unshift(p);
        else this.projects.splice(this.editingIndex, 1, p);
        this.persistDraft();
        this.showForm = false;
      },
      deleteProject(i) {
        if (!confirm('Ștergi proiectul „' + (this.projects[i].title || '') + '”?')) return;
        this.projects.splice(i, 1);
        this.persistDraft();
      },
      persistDraft() {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(this.projects));
        } catch (e) {
          alert('Nu am putut salva local: ' + e.message);
        }
      },
      resetDraft() {
        if (!confirm('Renunți la modificările nepublicate și revii la projects.json publicat?')) return;
        localStorage.removeItem(DRAFT_KEY);
        this.load();
      },

      /* ---------- export ---------- */
      exportJson() {
        const data = JSON.stringify(this.projects, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'projects.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      },
      async copyJson() {
        try {
          await navigator.clipboard.writeText(JSON.stringify(this.projects, null, 2));
          alert('JSON copiat în clipboard. Înlocuiește data/projects.json și fă commit.');
        } catch (e) {
          this.exportJson();
        }
      },

      /* ---------- lightbox ---------- */
      openLightbox(images, idx) {
        if (!images || !images.length) return;
        this.lb.images = images;
        this.lb.idx = idx || 0;
        this.resetZoom();
        this.lb.open = true;
        document.body.style.overflow = 'hidden';
      },
      closeLightbox() {
        this.lb.open = false;
        document.body.style.overflow = '';
      },
      resetZoom() {
        this.lb.scale = 1;
        this.lb.tx = 0;
        this.lb.ty = 0;
      },
      zoomIn() {
        this.lb.scale = Math.min(6, +(this.lb.scale + 0.3).toFixed(2));
      },
      zoomOut() {
        this.lb.scale = Math.max(1, +(this.lb.scale - 0.3).toFixed(2));
        if (this.lb.scale === 1) {
          this.lb.tx = 0;
          this.lb.ty = 0;
        }
      },
      toggleZoom() {
        if (this.lb.scale > 1) this.resetZoom();
        else this.lb.scale = 2.4;
      },
      lbNext() {
        if (this.lb.idx < this.lb.images.length - 1) {
          this.lb.idx++;
          this.resetZoom();
        }
      },
      lbPrev() {
        if (this.lb.idx > 0) {
          this.lb.idx--;
          this.resetZoom();
        }
      },
      onWheel(e) {
        e.preventDefault();
        const d = e.deltaY < 0 ? 0.25 : -0.25;
        this.lb.scale = Math.min(6, Math.max(1, +(this.lb.scale + d).toFixed(2)));
        if (this.lb.scale === 1) {
          this.lb.tx = 0;
          this.lb.ty = 0;
        }
      },
      panStart(e) {
        if (this.lb.scale <= 1) return;
        this.lb.panning = true;
        const pt = e.touches ? e.touches[0] : e;
        this.lb.sx = pt.clientX - this.lb.tx;
        this.lb.sy = pt.clientY - this.lb.ty;
      },
      panMove(e) {
        if (!this.lb.panning) return;
        const pt = e.touches ? e.touches[0] : e;
        this.lb.tx = pt.clientX - this.lb.sx;
        this.lb.ty = pt.clientY - this.lb.sy;
      },
      panEnd() {
        this.lb.panning = false;
      },
      lbTransform() {
        return `transform: translate(${this.lb.tx}px, ${this.lb.ty}px) scale(${this.lb.scale});`;
      },

      onKey(e) {
        if (this.lb.open) {
          if (e.key === 'Escape') this.closeLightbox();
          else if (e.key === 'ArrowRight') this.lbNext();
          else if (e.key === 'ArrowLeft') this.lbPrev();
          else if (e.key === '+' || e.key === '=') this.zoomIn();
          else if (e.key === '-') this.zoomOut();
          return;
        }
        if (e.key === 'Escape') {
          if (this.showForm) this.showForm = false;
          else if (this.showLogin) this.showLogin = false;
        }
      },
    }));
  });
})();
