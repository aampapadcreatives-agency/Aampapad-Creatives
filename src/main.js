import './style.css'

const defaultProjects = [
  { title: 'Soft Power', type: 'Campaigns', meta: 'Kite Studio / 2024', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85', images: ['https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85'], videos: [], className: 'project-wide' },
  { title: 'Mango Season', type: 'Brand worlds', meta: 'Common Ground / 2024', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85'], videos: [], className: 'project-tall' },
  { title: 'After Hours', type: 'Films', meta: 'Nocturne / 2023', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85', images: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=85'], videos: [], className: 'project-tall' },
  { title: 'Field Notes', type: 'Editorial', meta: 'Cedar House / 2023', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85', images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85'], videos: [], className: 'project-wide' },
]

const defaultContent = {
  brand: 'AAMPAPAD',
  eyebrow: 'Independent creative agency · Est. 2018',
  heroTitle: 'Ideas with a pulse.',
  heroDescription: 'We make brands impossible to scroll past. Strategy, identity, and stories for the culture-curious.',
  heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=90',
  heroVideo: '',
  manifesto: 'Make the familiar feel new. Make the new feel necessary.',
  contactTitle: 'Got a good feeling?',
  editionLabel: 'AA / EDITIONS',
  editionSeason: 'WINTER 2026',
  heroIssue: 'VOL. 01 / A NEW SEASON',
  heroCaption: "THE AAMPAPAD EDITIONS / A FIELD GUIDE TO WHAT'S NEXT",
  workTitle: 'Work in progress',
  workDescription: 'New identities, campaigns and worlds in the making.',
  contactDescription: 'Bring us the half-formed thought, the big swing, or the thing you can’t stop thinking about.',
  contactEmail: 'hello@aampapad.com',
  footerCopyright: '© 2026 Aampapad Creatives',
  siteStyle: {
    background: '#f8f8f5',
    text: '#11110f',
    accent: '#d9fb62',
    dark: '#20211f',
    displayFont: 'Manrope',
    serifFont: 'Playfair Display',
    radius: 28,
    headingScale: 1,
  },
}

const readStorage = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null } }
const siteStateUrl = import.meta.env.VITE_SITE_STATE_URL || '/api/site-state'
const fetchSharedState = async () => { try { const response = await fetch(siteStateUrl, { cache: 'no-store' }); return response.ok ? await response.json() : {} } catch { return {} } }
const sharedState = await fetchSharedState()
const searchParams = new URLSearchParams(window.location.search)
const routePath = window.location.pathname.replace(/\/+$/, '')
const routeHash = window.location.hash.replace(/^#/, '').toLowerCase()
const studioEditEnabled = import.meta.env.VITE_STUDIO_EDIT_ENABLED !== 'false'
const isAdminView = studioEditEnabled && (searchParams.get('admin') === '1' || routePath.endsWith('/admin') || routeHash === 'admin')
const storedContent = sharedState.content || readStorage('aampapad-content')
const storedProjects = sharedState.projects || readStorage('aampapad-projects')
let sharedUpdatedAt = sharedState.updatedAt || 0
const content = { ...defaultContent, ...(storedContent || {}) }
content.siteStyle = { ...defaultContent.siteStyle, ...(storedContent?.siteStyle || {}) }
const applySiteStyle = () => {
  const root = document.documentElement
  const style = content.siteStyle
  root.style.setProperty('--white', style.background)
  root.style.setProperty('--black', style.text)
  root.style.setProperty('--lime', style.accent)
  root.style.setProperty('--dark', style.dark)
  root.style.setProperty('--display', `'${style.displayFont}', sans-serif`)
  root.style.setProperty('--serif', `'${style.serifFont}', Georgia, serif`)
  root.style.setProperty('--heading-scale', style.headingScale)
  root.style.setProperty('--card-radius', `${style.radius}px`)
}
applySiteStyle()
document.documentElement.classList.toggle('public-view', !isAdminView)
document.documentElement.classList.toggle('admin-route', isAdminView)
document.documentElement.classList.toggle('studio-disabled', !studioEditEnabled)
let projects = (storedProjects || defaultProjects).map((project) => ({ ...project, images: project.images || [project.image], videos: project.videos || [] }))

const mediaDatabase = new Promise((resolve, reject) => { const request = indexedDB.open('aampapad-media', 1); request.onupgradeneeded = () => request.result.createObjectStore('assets'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
const saveMedia = (file) => new Promise(async (resolve, reject) => {
  try {
    const database = await mediaDatabase
    const assetId = `media:${Date.now()}-${Math.random().toString(16).slice(2)}`
    const request = database.transaction('assets', 'readwrite').objectStore('assets').put(file, assetId.slice(6))
    request.onsuccess = () => resolve(assetId)
    request.onerror = () => reject(request.error)
  } catch (error) {
    reject(error)
  }
})
const normalizeVideoSource = (source) => {
  if (!source || typeof source !== 'string') return ''
  if (source.startsWith('media:')) return source
  const trimmed = source.trim()
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/d\/([^/]+)/) || trimmed.match(/[?&]id=([^&]+)/) || trimmed.match(/[?&]fileId=([^&]+)/)
    const fileId = fileIdMatch?.[1]
    if (fileId) return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  return trimmed
}
const loadMedia = async (source) => { if (!source) return ''; const normalizedSource = normalizeVideoSource(source); if (!normalizedSource.startsWith('media:')) return normalizedSource; const database = await mediaDatabase; const file = await new Promise((resolve, reject) => { const request = database.transaction('assets', 'readonly').objectStore('assets').get(normalizedSource.slice(6)); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) }); if (!file) return ''; return file instanceof Blob ? URL.createObjectURL(file) : '' }

const app = document.querySelector('#app')
const cleanAppTemplate = (markup) => {
  const marker = '<div class="admin-backdrop" id="admin"'
  const firstAdmin = markup.indexOf(marker)
  const legacyAdmin = markup.indexOf(marker, firstAdmin + marker.length)
  if (legacyAdmin < 0) return markup
  const legacyEnd = markup.indexOf('</aside></div>', legacyAdmin)
  if (legacyEnd < 0) return markup
  return `${markup.slice(0, legacyAdmin)}</form><p class="publish-success" id="publish-success">Published to the live page.</p></aside></div>${markup.slice(legacyEnd + '</aside></div>'.length)}`
}

const handleBrandPopOnFirstScroll = () => {
  if (window.scrollY <= 24 || document.body.classList.contains('brand-pop-active')) return
  document.body.classList.add('brand-pop-active')
  window.removeEventListener('scroll', handleBrandPopOnFirstScroll, { passive: true })
}
window.addEventListener('scroll', handleBrandPopOnFirstScroll, { passive: true })

app.innerHTML = cleanAppTemplate(`
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Aampapad Creatives home"><span class="brand-name">${content.brand}</span><span>®</span></a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a href="#work">The work</a><a href="#about">The point of view</a><a href="#contact">Start here</a>
    </nav>
    <div class="header-actions">
      <button class="icon-button theme-toggle" aria-label="Toggle color theme" title="Toggle color theme">◐</button>
      <div class="studio-edit-wrap">
        <button class="admin-trigger" data-open-admin aria-expanded="false" aria-haspopup="menu">
          <span>Studio edit</span>
          <span class="admin-trigger-caret">▾</span>
        </button>
        <div class="studio-edit-menu" id="studio-edit-menu" aria-hidden="true">
          <button type="button" class="studio-edit-option" data-open-admin data-admin-tab="story">Edit story</button>
          <button type="button" class="studio-edit-option" data-open-admin data-admin-tab="projects">Edit projects</button>
        </div>
      </div>
      <button class="menu-button" aria-label="Open menu" aria-expanded="false"><i></i><i></i></button>
      <button class="pill-button header-cta" data-open-modal>Start a project <span>→</span></button>
    </div>
  </header>
  ${isAdminView ? '<button class="admin-route-launcher" type="button"><strong>STUDIO EDIT</strong><span>Open website and project controls ↓</span></button>' : ''}

  <main id="top">
    <section class="hero section-pad">
      <div class="edition-kicker reveal"><span>${content.editionLabel}</span><span>${content.editionSeason}</span><span>${content.eyebrow}</span></div>
      <div class="hero-grid">
        <div><span class="hero-issue reveal">${content.heroIssue}</span><h1 class="hero-title reveal">${content.heroTitle.replace(' with ', ' with<br><em>').replace('.', '.</em>')}</h1></div>
        <div class="hero-aside reveal">
          <p>${content.heroDescription}</p>
          <a class="text-link" href="#work">Enter the edition <span class="arrow-glass">→</span></a>
        </div>
      </div>
      <div class="hero-image-wrap reveal">
        <div class="hero-media-stack">
          <img class="hero-image" src="${content.heroImage}" alt="Creative team working around a table" />
          <video class="hero-video" muted autoplay loop playsinline poster="${content.heroImage}" ${content.heroVideo ? '' : 'style="display:none"'}></video>
          <div class="hero-media-banner"><span>HERO MOTION</span><span class="hero-media-status">${content.heroVideo ? 'VIDEO ACTIVE' : 'IMAGE ONLY'}</span><div class="hero-banner-actions"><button type="button" class="hero-banner-button hero-sound" aria-label="Turn hero video sound on">Sound off</button><button type="button" class="hero-banner-button hero-fullscreen" aria-label="View hero video fullscreen">Fullscreen</button></div></div>
        </div>
        <div class="image-caption"><span>${content.heroCaption}</span><span>SCROLL TO EXPLORE <b class="arrow-glass" aria-hidden="true">→</b></span></div>
      </div>
    </section>

    <section class="edition-index section-pad" aria-label="Edition contents">
      <div class="index-title"><span class="section-number">CONTENTS</span><strong>Explore the edition</strong></div>
      <nav class="index-links"><a href="#work"><span>01</span> Work in progress <i class="arrow-glass">→</i></a><a href="#about"><span>02</span> A point of view <i class="arrow-glass">→</i></a><a href="#contact"><span>03</span> Make something <i class="arrow-glass">→</i></a></nav>
    </section>

    <section class="work section-pad" id="work">
      <div class="section-heading reveal"><div><span class="section-number">CHAPTER 01 / 03</span><h2>${content.workTitle}</h2></div><p>${content.workDescription.replace(' campaigns ', ' campaigns<br>')}</p></div>
      <div class="filter-bar reveal"><button class="filter active" data-filter="All">All work</button><button class="filter" data-filter="Campaigns">Campaigns</button><button class="filter" data-filter="Brand worlds">Brand worlds</button><button class="filter" data-filter="Films">Films</button><button class="filter" data-filter="Editorial">Editorial</button></div>
      <div class="project-grid" id="project-grid"></div>
      <div class="center-action"><button class="outline-button" id="load-more">See all projects <span>→</span></button></div>
      <div class="brand-scroller reveal" aria-label="Selected brand partners">
        <div class="brand-scroller-head"><span class="section-number">IN GOOD COMPANY</span><span>Selected collaborators / 2018—26</span></div>
        <div class="brand-scroller-window">
          <div class="brand-scroller-track">
            <div class="brand-logo brand-logo-serif">Kite<span>®</span></div>
            <div class="brand-logo brand-logo-wide">COMMON GROUND</div>
            <div class="brand-logo brand-logo-mono">NOCTURNE<span class="brand-logo-dot">●</span></div>
            <div class="brand-logo brand-logo-script">Cedar House</div>
            <div class="brand-logo brand-logo-condensed">MANGO / SEASON</div>
            <div class="brand-logo brand-logo-serif">Kite<span>®</span></div>
            <div class="brand-logo brand-logo-wide">COMMON GROUND</div>
            <div class="brand-logo brand-logo-mono">NOCTURNE<span class="brand-logo-dot">●</span></div>
            <div class="brand-logo brand-logo-script">Cedar House</div>
            <div class="brand-logo brand-logo-condensed">MANGO / SEASON</div>
          </div>
        </div>
      </div>
    </section>

    <section class="manifesto section-pad" id="about">
      <div class="section-heading reveal"><div><span class="section-number">CHAPTER 02 / 03</span><h2>Our point of view</h2></div></div>
      <div class="manifesto-copy reveal"><p>${content.manifesto.replace(' new. ', ' <em>new.</em><br>').replace(' necessary.', ' <em>necessary.</em>')}</p><a class="text-link" href="#contact">Meet the studio <span class="arrow-glass">→</span></a></div>
      <div class="stats-row reveal"><div><strong>06</strong><span>people, give or take</span></div><div><strong>27</strong><span>brands in our orbit</span></div><div><strong>08</strong><span>years making noise</span></div></div>
    </section>

    <section class="contact section-pad" id="contact">
      <div class="contact-copy reveal"><span class="section-number">CHAPTER 03 / 03</span><h2>${content.contactTitle.replace(' feeling?', '<br><em>feeling?</em>')}</h2><p>${content.contactDescription}</p></div>
      <div class="contact-action reveal"><button class="circle-arrow" data-open-modal aria-label="Start a project"><span class="arrow-glass">→</span></button><span>Tell us everything<br>at ${content.contactEmail}</span></div>
    </section>
  </main>

  <footer class="site-footer"><div class="brand">AAMPAPAD<span>®</span></div><div class="footer-links"><a href="#top">Instagram</a><a href="#top">LinkedIn</a><a href="#top">Are.na</a></div><span>${content.footerCopyright}</span></footer>

  <div class="mobile-menu" aria-hidden="true"><button class="close-menu" aria-label="Close menu">×</button><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a><button class="pill-button" data-open-modal>Start a project <span>→</span></button></div>
    <div class="admin-backdrop" id="admin" aria-hidden="true"><aside class="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div class="admin-head"><div><span class="section-number">AAMPAPAD CMS / LOCAL</span><h2 id="admin-title">Studio edit</h2></div><button class="modal-close" data-close-admin aria-label="Close studio edit">×</button></div><p class="admin-note">Edit the live composition, visual language, and project media, then publish.</p><form id="admin-form"><div class="admin-tabs"><button type="button" class="admin-tab active" data-admin-tab="story">Story</button><button type="button" class="admin-tab" data-admin-tab="design">Website style</button><button type="button" class="admin-tab" data-admin-tab="projects">Projects + media</button></div><div class="admin-view active" data-admin-view="story"><label>Studio name<input name="brand" value="${content.brand}" /></label><label>Eyebrow<input name="eyebrow" value="${content.eyebrow}" /></label><label>Hero statement<textarea name="heroTitle" rows="2">${content.heroTitle}</textarea></label><label>Hero description<textarea name="heroDescription" rows="3">${content.heroDescription}</textarea></label><label>Hero image URL<input name="heroImage" value="${content.heroImage}" /></label><label>Upload replacement image<input type="file" id="hero-upload" accept="image/*" /></label><label>Hero video URL<input name="heroVideo" value="${content.heroVideo || ''}" placeholder="https://... or Google Drive link" /></label><label>Upload replacement video<input type="file" id="hero-video-upload" accept="video/*" /></label><label>Manifesto<textarea name="manifesto" rows="3">${content.manifesto}</textarea></label><label>Contact title<input name="contactTitle" value="${content.contactTitle}" /></label><label>Contact description<textarea name="contactDescription" rows="3">${content.contactDescription}</textarea></label><label>Contact email<input name="contactEmail" value="${content.contactEmail}" /></label></div><div class="admin-view" data-admin-view="design"><div class="design-grid"><label>Edition label<input name="editionLabel" value="${content.editionLabel}" /></label><label>Edition season<input name="editionSeason" value="${content.editionSeason}" /></label><label>Hero issue<input name="heroIssue" value="${content.heroIssue}" /></label><label>Hero caption<input name="heroCaption" value="${content.heroCaption}" /></label><label>Work heading<input name="workTitle" value="${content.workTitle}" /></label><label>Work description<textarea name="workDescription" rows="2">${content.workDescription}</textarea></label><label>Footer copyright<input name="footerCopyright" value="${content.footerCopyright}" /></label><label>Display font<select name="displayFont"><option ${content.siteStyle.displayFont === 'Manrope' ? 'selected' : ''}>Manrope</option><option ${content.siteStyle.displayFont === 'DM Mono' ? 'selected' : ''}>DM Mono</option><option ${content.siteStyle.displayFont === 'Georgia' ? 'selected' : ''}>Georgia</option></select></label><label>Serif font<select name="serifFont"><option ${content.siteStyle.serifFont === 'Playfair Display' ? 'selected' : ''}>Playfair Display</option><option ${content.siteStyle.serifFont === 'Georgia' ? 'selected' : ''}>Georgia</option><option ${content.siteStyle.serifFont === 'DM Mono' ? 'selected' : ''}>DM Mono</option></select></label><label>Page background<input type="color" name="background" value="${content.siteStyle.background}" /></label><label>Text color<input type="color" name="text" value="${content.siteStyle.text}" /></label><label>Accent color<input type="color" name="accent" value="${content.siteStyle.accent}" /></label><label>Dark section color<input type="color" name="dark" value="${content.siteStyle.dark}" /></label><label>Corner radius<input type="range" name="radius" min="0" max="48" value="${content.siteStyle.radius}" /><output>${content.siteStyle.radius}px</output></label><label>Heading scale<input type="range" name="headingScale" min="0.8" max="1.2" step="0.05" value="${content.siteStyle.headingScale}" /><output>${content.siteStyle.headingScale}</output></label></div></div><div class="admin-view" data-admin-view="projects"><div id="admin-projects"></div><button type="button" class="outline-button add-project" id="add-project">+ Add project</button></div><button class="pill-button publish-button" type="submit">Publish changes <span>→</span></button>
  <div class="admin-backdrop" id="admin" aria-hidden="true"><aside class="admin-panel" role="dialog" aria-modal="true" aria-labelledby="admin-title"><div class="admin-head"><div><span class="section-number">AAMPAPAD CMS / LOCAL</span><h2 id="admin-title">Studio edit</h2></div><button class="modal-close" data-close-admin aria-label="Close studio edit">×</button></div><p class="admin-note">Edit the live composition, add unlimited images and videos to every project, then publish.</p><form id="admin-form"><div class="admin-tabs"><button type="button" class="admin-tab active" data-admin-tab="story">Story</button><button type="button" class="admin-tab" data-admin-tab="projects">Projects + media</button></div><div class="admin-view active" data-admin-view="story"><label>Studio name<input name="brand" value="${content.brand}" /></label><label>Eyebrow<input name="eyebrow" value="${content.eyebrow}" /></label><label>Hero statement<textarea name="heroTitle" rows="2">${content.heroTitle}</textarea></label><label>Hero description<textarea name="heroDescription" rows="3">${content.heroDescription}</textarea></label><label>Hero image URL<input name="heroImage" value="${content.heroImage}" /></label><label>Upload replacement image<input type="file" id="hero-upload" accept="image/*" /></label><label>Hero video URL<input name="heroVideo" value="${content.heroVideo || ''}" placeholder="https://... or Google Drive link" /></label><label>Upload replacement video<input type="file" id="hero-video-upload" accept="video/*" /></label><label>Manifesto<textarea name="manifesto" rows="3">${content.manifesto}</textarea></label><label>Contact title<input name="contactTitle" value="${content.contactTitle}" /></label></div><div class="admin-view" data-admin-view="projects"><div id="admin-projects"></div><button type="button" class="outline-button add-project" id="add-project">+ Add project</button></div><button class="pill-button publish-button" type="submit">Publish changes <span>↗</span></button></form><p class="publish-success" id="publish-success">Published to the live page.</p></aside></div>
  <div class="modal-backdrop" id="modal" aria-hidden="true"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close dialog">×</button><span class="section-number">LET'S MAKE SOMETHING</span><h2 id="modal-title">Tell us the<br><em>good stuff.</em></h2><form id="inquiry-form"><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@yourcompany.com" /></label><label>What are we making?<textarea required name="brief" rows="3" placeholder="A new world, a sharp turn, a big idea..."></textarea></label><button class="pill-button" type="submit">Send inquiry <span>→</span></button></form><p class="form-success">Beautiful. We'll be in touch shortly.</p></div></div>
  <div class="project-lightbox" id="project-lightbox" aria-hidden="true"><button class="lightbox-close" aria-label="Close project gallery">×</button><div class="lightbox-stage"><div class="lightbox-media" id="lightbox-media"></div><div class="lightbox-meta"><span id="lightbox-count">01 / 01</span><h2 id="lightbox-title"></h2><div class="lightbox-controls"><button class="lightbox-prev" id="lightbox-prev" aria-label="Previous media">←</button><button class="lightbox-next" id="lightbox-next" aria-label="Next media">→</button></div></div></div></div>
`)

const observeReveals = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
}

const syncHeroMedia = async () => {
  const heroImageWrap = document.querySelector('.hero-image-wrap')
  const heroImage = document.querySelector('.hero-image')
  const heroVideo = document.querySelector('.hero-video')
  const hasVideo = Boolean(content.heroVideo)
  const heroMediaBanner = document.querySelector('.hero-media-status')

  if (heroMediaBanner) heroMediaBanner.textContent = hasVideo ? 'VIDEO ACTIVE' : 'IMAGE ONLY'

  if (heroImageWrap) heroImageWrap.classList.toggle('has-video', hasVideo)
  if (heroImage) heroImage.style.display = hasVideo ? 'none' : 'block'
  if (!heroVideo) return

  heroVideo.style.display = hasVideo ? 'block' : 'none'
  heroVideo.poster = content.heroImage || ''
  if (!hasVideo) {
    heroVideo.removeAttribute('src')
    return
  }

  const normalizedVideoSource = normalizeVideoSource(content.heroVideo)
  const mediaSource = await loadMedia(normalizedVideoSource).catch(() => '')
  if (!mediaSource) {
    heroVideo.style.display = 'none'
    heroImage?.style.removeProperty('display')
    heroImageWrap?.classList.remove('has-video')
    return
  }
  heroVideo.src = mediaSource
  heroVideo.play().catch(() => {})
}

const heroSoundButton = document.querySelector('.hero-sound')
const heroFullscreenButton = document.querySelector('.hero-fullscreen')
const heroMediaStack = document.querySelector('.hero-media-stack')
const heroVideoElement = document.querySelector('.hero-video')
const updateHeroSoundLabel = () => {
  if (!heroSoundButton || !heroVideoElement) return
  const soundOn = !heroVideoElement.muted
  heroSoundButton.textContent = soundOn ? 'Sound on' : 'Sound off'
  heroSoundButton.setAttribute('aria-label', soundOn ? 'Turn hero video sound off' : 'Turn hero video sound on')
}
heroSoundButton?.addEventListener('click', () => {
  if (!heroVideoElement) return
  heroVideoElement.muted = !heroVideoElement.muted
  if (!heroVideoElement.muted) heroVideoElement.volume = 1
  heroVideoElement.play().catch(() => {})
  updateHeroSoundLabel()
})
heroFullscreenButton?.addEventListener('click', () => {
  if (!heroMediaStack) return
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    document.exitFullscreen?.()
    document.webkitExitFullscreen?.()
    return
  }
  heroMediaStack.requestFullscreen?.()
  heroMediaStack.webkitRequestFullscreen?.()
})

async function renderProjects(filter = 'All') {
  const visible = filter === 'All' ? projects : projects.filter((project) => project.type === filter)
  const cards = await Promise.all(visible.map(async (project, index) => `
    <article class="project-card ${project.className} reveal" style="--delay: ${index * 80}ms">
      <div class="project-image"><img src="${await loadMedia(project.images[0])}" alt="${project.title} project" /><span class="project-index">0${index + 1}</span><button class="project-open" data-project-index="${projects.indexOf(project)}" aria-label="View ${project.title}">→</button></div>
      <div class="project-info"><h3>${project.title}</h3><span>${project.meta}</span></div>
    </article>`))
  document.querySelector('#project-grid').innerHTML = cards.join('')
  observeReveals()
}
renderProjects()
syncHeroMedia()

function renderAdminProjects() {
  document.querySelector('#admin-projects').innerHTML = projects.map((project, index) => `
    <div class="admin-project" data-project-index="${index}">
      <details class="project-accordion" ${index === 0 ? 'open' : ''}>
        <summary class="project-summary">
          <span class="project-summary-thumb"><img data-media-source="${project.images[0]}" alt="" /></span>
          <span class="project-summary-copy">
            <strong>${project.title}</strong>
            <small>${project.type}</small>
          </span>
          <span class="project-summary-caret">▾</span>
        </summary>
        <div class="project-accordion-body">
          <div class="admin-project-fields">
            <input data-project-field="title" value="${project.title}" aria-label="Project title" />
            <input data-project-field="type" value="${project.type}" aria-label="Project category" />
            <input data-project-field="meta" value="${project.meta}" aria-label="Project meta" />
            <label class="asset-upload">Images (${project.images.length})<input type="file" data-asset-type="images" accept="image/*" multiple /></label>
            <label class="asset-upload">Videos (${project.videos.length})<input type="file" data-asset-type="videos" accept="video/*" multiple /></label>
            <div class="asset-urls"><input data-asset-url="images" placeholder="Paste image URL + Enter" /><input data-asset-url="videos" placeholder="Paste video URL + Enter" /></div>
            <div class="asset-chips">${project.images.map((_, assetIndex) => `<button type="button" data-remove-asset="images" data-asset-index="${assetIndex}">Image ${assetIndex + 1} ×</button>`).join('')}${project.videos.map((_, assetIndex) => `<button type="button" data-remove-asset="videos" data-asset-index="${assetIndex}">Video ${assetIndex + 1} ×</button>`).join('')}</div>
          </div>
        </div>
      </details>
      <button type="button" class="delete-project" aria-label="Delete ${project.title}">×</button>
    </div>
  `).join('')
  document.querySelectorAll('[data-media-source]').forEach(async (image) => { image.src = await loadMedia(image.dataset.mediaSource) })
}
renderAdminProjects()

const modal = document.querySelector('#modal')
const menu = document.querySelector('.mobile-menu')
const admin = document.querySelector('#admin')
const studioEditMenu = document.querySelector('#studio-edit-menu')
const adminTrigger = document.querySelector('.admin-trigger')
const toggleOverlay = (element, open) => { element.classList.toggle('is-open', open); element.setAttribute('aria-hidden', String(!open)); document.body.classList.toggle('no-scroll', open) }
const setAdminTab = (tabName) => {
  document.querySelectorAll('.admin-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.adminTab === tabName))
  document.querySelectorAll('.admin-view').forEach((view) => view.classList.toggle('active', view.dataset.adminView === tabName))
}
const toggleStudioMenu = (open) => {
  studioEditMenu.classList.toggle('is-open', open)
  studioEditMenu.setAttribute('aria-hidden', String(!open))
  adminTrigger.setAttribute('aria-expanded', String(open))
}
const openAdminPanel = (tabName = 'story') => {
  setAdminTab(tabName)
  toggleOverlay(admin, true)
  toggleStudioMenu(false)
}
document.querySelector('.admin-route-launcher')?.addEventListener('click', () => openAdminPanel('story'))

document.querySelectorAll('[data-open-modal]').forEach((button) => button.addEventListener('click', () => toggleOverlay(modal, true)))
adminTrigger.addEventListener('click', () => toggleStudioMenu(!studioEditMenu.classList.contains('is-open')))
document.querySelectorAll('.studio-edit-option').forEach((button) => button.addEventListener('click', () => openAdminPanel(button.dataset.adminTab)))
document.querySelector('[data-close-admin]').addEventListener('click', () => { toggleOverlay(admin, false); toggleStudioMenu(false) })
admin.addEventListener('click', (event) => { if (event.target === admin) { toggleOverlay(admin, false); toggleStudioMenu(false) } })
document.addEventListener('click', (event) => {
  if (!event.target.closest('.studio-edit-wrap')) toggleStudioMenu(false)
})
document.querySelectorAll('.modal-close').forEach((button) => button.addEventListener('click', () => toggleOverlay(modal, false)))
document.querySelectorAll('.modal-backdrop').forEach((overlay) => overlay.addEventListener('click', (event) => { if (event.target === overlay) toggleOverlay(overlay, false) }))

document.querySelector('.menu-button').addEventListener('click', (event) => { const open = !menu.classList.contains('is-open'); toggleOverlay(menu, open); event.currentTarget.setAttribute('aria-expanded', String(open)) })
document.querySelector('.close-menu').addEventListener('click', () => toggleOverlay(menu, false))
document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => toggleOverlay(menu, false)))

document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active')); button.classList.add('active'); renderProjects(button.dataset.filter) }))
document.querySelector('#load-more').addEventListener('click', (event) => { event.currentTarget.innerHTML = 'That’s all for now <span>✳</span>'; event.currentTarget.classList.add('is-done') })
document.querySelector('.theme-toggle').addEventListener('click', () => document.body.classList.toggle('dark-theme'))
document.querySelector('#inquiry-form').addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.classList.add('is-sent'); event.currentTarget.nextElementSibling.classList.add('show') })

document.querySelectorAll('.admin-tab').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.admin-tab').forEach((tab) => tab.classList.remove('active')); document.querySelectorAll('.admin-view').forEach((view) => view.classList.remove('active')); button.classList.add('active'); document.querySelector(`[data-admin-view="${button.dataset.adminTab}"]`).classList.add('active') }))
document.querySelectorAll('.admin-view input[type="range"]').forEach((input) => input.addEventListener('input', () => { input.nextElementSibling.value = `${input.value}${input.name === 'radius' ? 'px' : ''}` }))
document.querySelector('#hero-upload').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; const mediaSource = await saveMedia(file); document.querySelector('[name="heroImage"]').value = mediaSource; content.heroImage = mediaSource; syncHeroMedia() })
document.querySelector('#hero-video-upload').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; const mediaSource = await saveMedia(file); document.querySelector('[name="heroVideo"]').value = mediaSource; content.heroVideo = mediaSource; syncHeroMedia() })
document.querySelector('#add-project').addEventListener('click', () => { projects.push({ title: 'New work', type: 'Campaigns', meta: 'Your client / 2026', image: defaultProjects[0].image, images: [defaultProjects[0].image], videos: [], className: 'project-wide' }); renderAdminProjects() })
document.querySelector('#admin-projects').addEventListener('input', (event) => { const field = event.target.dataset.projectField; if (!field) return; projects[Number(event.target.closest('.admin-project').dataset.projectIndex)][field] = event.target.value })
document.querySelector('#admin-projects').addEventListener('keydown', (event) => { const type = event.target.dataset.assetUrl; if (event.key !== 'Enter' || !type || !event.target.value.trim()) return; event.preventDefault(); const project = projects[Number(event.target.closest('.admin-project').dataset.projectIndex)]; project[type].push(event.target.value.trim()); event.target.value = ''; renderAdminProjects() })
document.querySelector('#admin-projects').addEventListener('change', async (event) => { const type = event.target.dataset.assetType; if (!type) return; const project = projects[Number(event.target.closest('.admin-project').dataset.projectIndex)]; for (const file of event.target.files) project[type].push(await saveMedia(file)); renderAdminProjects() })
document.querySelector('#admin-projects').addEventListener('click', (event) => {
  const projectRow = event.target.closest('.admin-project');
  if (!projectRow) return;
  const project = projects[Number(projectRow.dataset.projectIndex)];
  if (event.target.classList.contains('delete-project')) {
    projects.splice(Number(projectRow.dataset.projectIndex), 1);
    renderAdminProjects();
    return;
  }
  if (event.target.dataset.removeAsset) {
    project[event.target.dataset.removeAsset].splice(Number(event.target.dataset.assetIndex), 1);
    if (!project.images.length) project.images.push(defaultProjects[0].image);
    renderAdminProjects();
  }
})
document.querySelector('#admin-form').addEventListener('submit', async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); Object.keys(defaultContent).filter((key) => key !== 'siteStyle').forEach((key) => { if (formData.has(key)) content[key] = formData.get(key) }); Object.keys(defaultContent.siteStyle).forEach((key) => { if (formData.has(key)) content.siteStyle[key] = formData.get(key) }); content.siteStyle.radius = Number(content.siteStyle.radius); content.siteStyle.headingScale = Number(content.siteStyle.headingScale); applySiteStyle(); try { localStorage.setItem('aampapad-content', JSON.stringify(content)); localStorage.setItem('aampapad-projects', JSON.stringify(projects)) } catch { document.querySelector('#publish-success').textContent = 'Media saved in browser storage; text could not be cached.' } document.querySelector('.brand-name').textContent = content.brand; document.querySelector('.edition-kicker span:first-child').textContent = content.editionLabel; document.querySelector('.edition-kicker span:nth-child(2)').textContent = content.editionSeason; document.querySelector('.edition-kicker span:last-child').textContent = content.eyebrow; document.querySelector('.hero-issue').textContent = content.heroIssue; document.querySelector('.hero-title').innerHTML = `${content.heroTitle.replace(' with ', ' with<br><em>').replace('.', '.</em>')}`; document.querySelector('.hero-aside p').textContent = content.heroDescription; document.querySelector('.hero-image').src = content.heroImage; document.querySelector('.image-caption span:first-child').textContent = content.heroCaption; document.querySelector('.section-heading h2').textContent = content.workTitle; document.querySelector('.section-heading p').innerHTML = content.workDescription.replace(' campaigns ', ' campaigns<br>'); document.querySelector('.manifesto-copy p').innerHTML = content.manifesto.replace(' new. ', ' <em>new.</em><br>').replace(' necessary.', ' <em>necessary.</em>'); document.querySelector('.contact-copy h2').innerHTML = content.contactTitle.replace(' feeling?', '<br><em>feeling?</em>'); document.querySelector('.contact-copy p').textContent = content.contactDescription; document.querySelector('.contact-action span').innerHTML = `Tell us everything<br>at ${content.contactEmail}`; document.querySelector('.site-footer > span').textContent = content.footerCopyright; await syncHeroMedia(); renderProjects(document.querySelector('.filter.active').dataset.filter); document.querySelector('#publish-success').textContent = 'Published to the live page.'; document.querySelector('#publish-success').classList.add('show'); setTimeout(() => document.querySelector('#publish-success').classList.remove('show'), 2400) })

document.querySelector('#admin-form').addEventListener('submit', async () => {
  try {
    const response = await fetch(siteStateUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, projects }) })
    if (!response.ok) throw new Error('Shared state request failed')
    const savedState = await response.json()
    sharedUpdatedAt = savedState.updatedAt || sharedUpdatedAt
  } catch {
    document.querySelector('#publish-success').textContent = 'Saved in this browser only; shared server state is unavailable.'
  }
})

if (!isAdminView) {
  setInterval(async () => {
    const latestState = await fetchSharedState()
    if (latestState.updatedAt && latestState.updatedAt !== sharedUpdatedAt) window.location.reload()
  }, 1500)
}

let lightboxProject = null
let lightboxIndex = 0
const lightbox = document.querySelector('#project-lightbox')
const lightboxMedia = document.querySelector('#lightbox-media')
let touchStartX = 0
let touchStartY = 0
const getLightboxMedia = () => {
  if (lightboxProject === null || !projects[lightboxProject]) return []
  const project = projects[lightboxProject]
  return [...project.images.map((src) => ({ type: 'image', src })), ...project.videos.map((src) => ({ type: 'video', src }))]
}
const navigateLightbox = (direction) => {
  const media = getLightboxMedia()
  if (!media.length) return
  lightboxIndex = (lightboxIndex + direction + media.length) % media.length
  renderLightbox()
}
const renderLightbox = async () => {
  const project = projects[lightboxProject]
  const media = getLightboxMedia()
  const current = media[lightboxIndex]
  if (!project || !current) return
  const source = await loadMedia(current.src)
  lightboxMedia.innerHTML = current.type === 'video'
    ? `<video src="${source}" controls autoplay playsinline></video>`
    : `<img src="${source}" alt="${project.title} media ${lightboxIndex + 1}" />`
  document.querySelector('#lightbox-title').textContent = project.title
  document.querySelector('#lightbox-count').textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`
}
document.querySelector('#project-grid').addEventListener('click', (event) => { const button = event.target.closest('.project-open'); if (!button) return; lightboxProject = Number(button.dataset.projectIndex); lightboxIndex = 0; renderLightbox(); toggleOverlay(lightbox, true) })
document.querySelector('#lightbox-next').addEventListener('click', () => navigateLightbox(1))
document.querySelector('#lightbox-prev').addEventListener('click', () => navigateLightbox(-1))
lightboxMedia.addEventListener('click', () => navigateLightbox(1))
lightbox.addEventListener('wheel', (event) => {
  if (!lightbox.classList.contains('is-open')) return
  if (Math.abs(event.deltaY) < 12) return
  event.preventDefault()
  navigateLightbox(event.deltaY > 0 ? 1 : -1)
}, { passive: false })
lightbox.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}, { passive: true })
lightbox.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStartX
  const deltaY = touch.clientY - touchStartY
  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) navigateLightbox(deltaX < 0 ? 1 : -1)
}, { passive: true })
document.querySelector('.lightbox-close').addEventListener('click', () => toggleOverlay(lightbox, false))
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) toggleOverlay(lightbox, false) })

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { toggleOverlay(modal, false); toggleOverlay(menu, false); toggleOverlay(admin, false); toggleOverlay(lightbox, false) }
  if (!lightbox.classList.contains('is-open')) return
  if (event.key === 'ArrowRight') navigateLightbox(1)
  if (event.key === 'ArrowLeft') navigateLightbox(-1)
})

if (isAdminView) openAdminPanel('story')
