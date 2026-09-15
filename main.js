/* =========================================
   ۱. مدیریت منوی هدر و دراپ‌داون پروفایل
========================================= */
const navItems = document.querySelectorAll('.nav-item');
const userMenuWrapper = document.getElementById('userMenuWrapper');
const userBtn = document.getElementById('userBtn');

if (navItems.length > 0) {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      if (userBtn && item === userBtn && userMenuWrapper) {
        e.stopPropagation();
        userMenuWrapper.classList.toggle('open');
      } else if (userMenuWrapper) {
        userMenuWrapper.classList.remove('open');
      }
    });
  });
}

document.addEventListener('click', (e) => {
  if (userMenuWrapper && !userMenuWrapper.contains(e.target)) {
    userMenuWrapper.classList.remove('open');
  }
});

/* =========================================
   ۲. اسلایدر دوره‌های آکادمی
========================================= */
/* =========================================
   ۲. اسلایدر دوره‌های آکادمی (دینامیک از API)
========================================= */
const API_BASE = 'http://127.0.0.1:5050';
const homeNews = [
  { title: 'دستورالعمل‌های دادرسی مالیاتی ۱۴۰۵', text: 'آخرین بخشنامه‌ها و دستورالعمل‌های مالیاتی را در منبع تخصصی HACC دنبال کنید.', href: 'https://hacc.ir/' },
  { title: 'قواعد رسیدگی اظهارنامه عملکرد', text: 'مروری بر نکات مهم رسیدگی و الزامات گزارشگری مالیاتی برای فعالان حرفه‌ای.', href: 'https://hacc.ir/' },
  { title: 'بخشنامه‌ها و اطلاعیه‌های مالی جدید', text: 'آخرین اطلاعیه‌های حوزه حسابداری، حسابرسی و مالیات در یک نگاه.', href: 'https://hacc.ir/' }
];

const newsTrack = document.getElementById('newsTrack');
const newsDots = document.getElementById('newsDots');
let newsIndex = 0;
let newsTimer;

function renderNews() {
  if (!newsTrack || !newsDots) return;
  newsTrack.innerHTML = homeNews.map((item, index) => `
    <article class="news-slide ${index === newsIndex ? 'active' : ''}">
      <span class="news-number">۰${index + 1}</span>
      <div>
        <span class="news-kicker"><i class="fa-solid fa-newspaper"></i> اخبار حسابداری</span>
        <h3>${item.title}</h3>
        <p>${item.text}</p>
        <a href="${item.href}" target="_blank" rel="noopener">ادامه خبر <i class="fa-solid fa-arrow-left"></i></a>
      </div>
    </article>
  `).join('');
  newsDots.innerHTML = homeNews.map((_, index) => `<button type="button" class="${index === newsIndex ? 'active' : ''}" data-news-index="${index}" aria-label="خبر ${index + 1}"></button>`).join('');
  newsDots.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      newsIndex = Number(button.dataset.newsIndex);
      renderNews();
      restartNews();
    });
  });
}

function restartNews() {
  clearInterval(newsTimer);
  newsTimer = setInterval(() => {
    newsIndex = (newsIndex + 1) % homeNews.length;
    renderNews();
  }, 6000);
}

renderNews();
restartNews();
document.querySelector('.news-prev')?.addEventListener('click', () => {
  newsIndex = (newsIndex - 1 + homeNews.length) % homeNews.length;
  renderNews();
  restartNews();
});
document.querySelector('.news-next')?.addEventListener('click', () => {
  newsIndex = (newsIndex + 1) % homeNews.length;
  renderNews();
  restartNews();
});

const dailyVisits = document.getElementById('dailyVisits');
if (dailyVisits) {
  fetch(`${API_BASE}/api/site/visits`)
    .then(response => response.json())
    .then(data => { if (data.success) dailyVisits.textContent = Number(data.visits).toLocaleString('fa-IR'); })
    .catch(() => {
      const key = `academy_visits_${new Date().toISOString().slice(0, 10)}`;
      const localCount = Number(localStorage.getItem(key) || 0) + 1;
      localStorage.setItem(key, localCount);
      dailyVisits.textContent = localCount.toLocaleString('fa-IR');
    });
}
let coursesData = [
  {
    img: 'poster1.png',
    title: 'دوره جامع استانداردهای بین‌المللی حسابداری',
    desc: 'بررسی جامع و کاربردی جدیدترین استانداردهای حسابداری مالی و گزارشگری با رویکرد ورود به بازار کار حرفه‌ای و ارتقای مهارت‌های تحلیلگری سازمانی توسط آکادمی منتشر شد.'
  },
  {
    img: 'poster2.png',
    title: 'دوره تخصصی حسابداری مدیریت و بهای تمام‌شده',
    desc: 'آموزش کاربردی مدل‌های تصمیم‌گیری مالی، کنترل هزینه‌ها، بودجه‌ریزی عملیاتی و تکنیک‌های نوین مدیریت بهای تمام‌شده برای مدیران و مشاوران مالی.'
  },
  {
    img: 'poster3.png',
    title: 'کارگاه حسابرسی داخلی و ارزیابی ریسک مالی',
    desc: 'آشنایی کامل با چارچوب‌های کنترل داخلی، کشف تقلب، استانداردهای روز حسابرسی و نحوه تهیه گزارش‌های تحلیلی برای هیئت‌مدیره و سازمان‌ها.'
  }
];

const courseImg = document.getElementById('courseImg');
const courseTitle = document.getElementById('courseTitle');
const courseDesc = document.getElementById('courseDesc');
let bulletsContainer = document.getElementById('sliderBullets');
let currentIndex = 0;
let autoSlideInterval;

// بارگذاری دوره‌ها از API
async function loadCoursesFromAPI() {
  try {
    const resp = await fetch(`${API_BASE}/api/courses`);
    const data = await resp.json();
    if (data.success && data.courses && data.courses.length > 0) {
      coursesData = data.courses.map(c => ({
        img: c.image_url || 'poster1.png',
        title: c.title,
        desc: c.description || 'توضیحات دوره ثبت نشده.',
        code: c.code,
        level: c.level,
        price: c.price
      }));
      rebuildBullets();
      renderCourse(0);
      restartAutoSlide();
    }
  } catch (e) {
    console.log('API not available, using default courses');
  }
}

function rebuildBullets() {
  if (!bulletsContainer) return;
  bulletsContainer.innerHTML = '';
  coursesData.forEach((_, i) => {
    const span = document.createElement('span');
    span.className = `slider-bullet ${i === 0 ? 'active' : ''}`;
    span.dataset.index = i;
    span.addEventListener('click', () => {
      renderCourse(i);
      restartAutoSlide();
    });
    bulletsContainer.appendChild(span);
  });
}

function renderCourse(index) {
  if (!courseImg || !courseTitle || !courseDesc) return;
  
  currentIndex = index;
  courseImg.style.opacity = '0';
  
  setTimeout(() => {
    const c = coursesData[index];
    courseImg.src = c.img;
    courseTitle.textContent = c.title;
    courseDesc.textContent = c.desc;
    courseImg.style.opacity = '1';
  }, 180);

  const bullets = document.querySelectorAll('.slider-bullet');
  bullets.forEach((b, idx) => {
    b.classList.toggle('active', idx === index);
  });
}

function restartAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    const next = (currentIndex + 1) % coursesData.length;
    renderCourse(next);
  }, 5000);
}

// شروع
loadCoursesFromAPI().then(() => {
  // fallback slider if API is slow
  setTimeout(() => {
    if (coursesData.length > 0 && document.querySelectorAll('.slider-bullet').length === 0) {
      rebuildBullets();
      renderCourse(0);
      restartAutoSlide();
    }
  }, 2000);
});

/* =========================================
   ۳. مقالات کرکره‌ای (Civilica & Papers)
========================================= */
try {
const articlesData = [
  {
    title: 'بررسی حساسیت بازدهی سهام به نقدشوندگی در بورس اوراق بهادار تهران',
    venue: 'پژوهش حسابداری و بازار سرمایه',
    authors: 'میلاد اثنی عشری امیری، میثم نبی پور',
    year: '۱۳۹۸',
    pages: '—',
    abstract: 'هدف پژوهش بررسی حساسیت بازدهی سهام به نقدشوندگی سهام در بورس اوراق بهادار تهران است. داده‌های ۱۳۰ شرکت پذیرفته‌شده در بورس طی سال‌های ۱۳۹۴ تا ۱۳۹۸ با استفاده از نرم‌افزار ره‌آورد نوین ۳ بررسی شد. نتایج نشان داد بین نقدشوندگی بازار سهام و بازدهی سهام رابطه معناداری وجود دارد.',
    keywords: 'نقدشوندگی بازار، بازدهی سهام، شکاف قیمت خرید و فروش'
  },
  {
    title: 'بررسی ارتباط بین رشد و بدهی بلندمدت در شرکت‌های پذیرفته‌شده در بورس اوراق بهادار تهران',
    venue: 'پژوهش مالی و حسابداری',
    authors: 'میلاد اثنی عشری، محمدمهدی کریم‌نیا',
    year: '۱۳۹۷',
    pages: '—',
    abstract: 'این پژوهش ارتباط بین بدهی بلندمدت و رشد شرکت را در یک دوره پنج‌ساله از ۱۳۹۳ تا ۱۳۹۷ بررسی می‌کند. داده‌ها به‌صورت ترکیبی و با استفاده از نرم‌افزارهای EViews، تدبیرپرداز و ره‌آورد نوین تحلیل شدند. نتایج وجود رابطه معنادار بین بدهی بلندمدت و رشد شرکت را نشان می‌دهد.',
    keywords: 'رشد شرکت، بدهی بلندمدت، داده‌های ترکیبی، بورس تهران'
  },
  {
    title: 'آیا حوزه اختیارات رهبران مالی با وجود هوش مصنوعی همچنان در حال گسترش است؟',
    venue: 'یادداشت پژوهشی فناوری و رهبری مالی',
    authors: 'میلاد اثنی عشری',
    year: '—',
    pages: '—',
    abstract: 'با گسترش فناوری‌های مبتنی بر هوش مصنوعی در تحلیل و تصمیم‌سازی مالی، نقش رهبران مالی در حال تغییر است. بهره‌گیری از توانایی‌های زبانی و تحلیلی ChatGPT می‌تواند گزارش‌گیری، تحلیل سناریو و ارتباط با ذی‌نفعان را بهبود دهد؛ بااین‌حال وابستگی بیش از حد، ملاحظات امنیتی و ضعف تحلیل‌های احساسی نیازمند مدیریت دقیق هستند.',
    keywords: 'هوش مصنوعی، رهبری مالی، ChatGPT، تصمیم‌گیری مالی'
  },
  {
    title: 'بهترین استراتژی تشکیل پرتفلیو با استفاده از نسبت‌های مالی ارزش افزوده اقتصادی به ارزش بازار، نسبت سود به قیمت و نسبت ارزش دفتری به ارزش بازار',
    venue: 'پژوهش سرمایه‌گذاری و مدیریت پرتفلیو',
    authors: 'ابوالقاسم اثنی عشری امیری، محمد محمودی، میلاد اثنی عشری امیری',
    year: '۱۳۸۶ تا ۱۳۹۰',
    pages: '—',
    abstract: 'این پژوهش بررسی می‌کند آیا پرتفلیوی تشکیل‌شده بر اساس نسبت ارزش افزوده اقتصادی به ارزش بازار، بازده بالاتری نسبت به پرتفلیوهای مبتنی بر نسبت سود به قیمت و ارزش دفتری به بازار دارد یا خیر. نتایج نشان می‌دهد تفاوت معناداری بین بازده رویکردها وجود ندارد و ارزش افزوده اقتصادی الزاماً بازده بالاتری ایجاد نمی‌کند.',
    keywords: 'پرتفلیو، ارزش افزوده اقتصادی، سود به قیمت، ارزش دفتری به بازار'
  },
  {
    title: 'نقش حسابرسی داخلی در ارکان راهبری و کمیته‌های اجرایی',
    venue: 'یادداشت تخصصی حسابرسی داخلی',
    authors: 'فرشید خدابنده، میلاد اثنی عشری',
    year: '—',
    pages: '—',
    abstract: 'ارزش حسابرسی داخلی به نگاه مدیران ارشد و هیئت‌مدیره به دامنه کاری آن وابسته است. حضور حسابرسی داخلی در جلسات ارکان راهبری و کمیته‌های اجرایی، امکان ارائه چشم‌انداز سازمانی، مهارت‌های انتقادی و خدمات اطمینان‌بخشی و مشاوره‌ای مستقل را فراهم می‌کند.',
    keywords: 'حسابرسی داخلی، راهبری سازمانی، کمیته اجرایی، مدیریت ریسک'
  },
  {
    title: 'منشور حسابرسی داخلی: نقشه‌ای برای موفقیت اطمینان‌بخشی',
    venue: 'یادداشت تخصصی حسابرسی داخلی',
    authors: 'میلاد اثنی عشری، فرشید خدابنده',
    year: '—',
    pages: '—',
    abstract: 'یکی از چالش‌های سازمان‌ها حصول اطمینان از مدیریت کارآ و اثربخش ریسک است. حسابرسی داخلی برای دستیابی به بالاترین سطح عملکرد به دستورالعمل‌های روشن از ارکان راهبری و مدیریت نیاز دارد و این دستورالعمل‌ها از طریق تدوین یک منشور منسجم حسابرسی داخلی منتقل می‌شوند.',
    keywords: 'منشور حسابرسی داخلی، اطمینان‌بخشی، ریسک، راهبری'
  },
  {
    title: 'بلاک‌چین و آینده حسابداری',
    venue: 'مقاله فناوری‌های نوین در حسابداری',
    authors: 'یاسمن خلیلی، میلاد اثنی عشری امیری، مجاهد رخشان',
    year: '—',
    pages: '—',
    abstract: 'بلاک‌چین یکی از موضوعات مهم فناوری در امور مالی است. این مقاله ابعاد استفاده از بلاک‌چین، تفاوت آن با بیت‌کوین، نیاز به تولید برنامه‌های سازگار و ضرورت تدوین مقررات برای استفاده گسترده از این فناوری در حسابداری را بررسی می‌کند.',
    keywords: 'بلاک‌چین، بیت‌کوین، حسابداری، فناوری مالی'
  }
];

const articleLinks = [
  
];
articlesData.forEach((article, index) => { article.href = articleLinks[index]; });

/* داده‌های کامل هفت مقاله برای نمایش در هوم‌پیج */
articlesData.splice(0, articlesData.length,
  {title:'بررسی حساسیت بازدهی سهام به نقدشوندگی در بورس اوراق بهادار تهران',venue:'پژوهش حسابداری و بازار سرمایه',authors:'میلاد اثنی عشری امیری، میثم نبی پور',year:'۱۳۹۸',pages:'—',abstract:'هدف پژوهش حاضر بررسی حساسیت بازدهی سهام به نقدشوندگی سهام در بورس اوراق بهادار تهران است. داده‌های ۱۳۰ شرکت پذیرفته‌شده در بورس طی سال‌های ۱۳۹۴ تا ۱۳۹۸ با استفاده از نرم‌افزار ره‌آورد نوین ۳ بررسی شد. نتایج نشان داد بین نقدشوندگی بازار سهام و بازده سهام رابطه‌ای معنادار وجود دارد.',keywords:'نقدشوندگی بازار، بازده سهام، شکاف قیمت خرید و فروش'},
  {title:'بررسی ارتباط بین رشد و بدهی بلندمدت در شرکت‌های پذیرفته‌شده در بورس اوراق بهادار تهران',venue:'پژوهش مالی و حسابداری',authors:'میلاد اثنی عشری، محمدمهدی کریم‌نیا',year:'۱۳۹۳ تا ۱۳۹۷',pages:'—',abstract:'این پژوهش ارتباط بین بدهی بلندمدت و رشد شرکت‌ها را در یک دوره پنج‌ساله بررسی می‌کند. داده‌ها به‌صورت ترکیبی و با استفاده از نرم‌افزارهای EViews، تدبیرپرداز و ره‌آورد نوین تحلیل شده‌اند. نتایج نشان می‌دهد بین بدهی بلندمدت و رشد شرکت رابطه‌ای معنادار وجود دارد.',keywords:'رشد شرکت، بدهی بلندمدت، داده‌های ترکیبی، بورس تهران'},
  {title:'آیا حوزه اختیارات رهبران مالی با وجود هوش مصنوعی همچنان در حال گسترش است؟',venue:'یادداشت پژوهشی فناوری و رهبری مالی',authors:'میلاد اثنی عشری',year:'—',pages:'—',abstract:'با گسترش هوش مصنوعی در تحلیل و تصمیم‌سازی مالی، نقش رهبران مالی در حال تغییر است. بهره‌گیری از توانایی‌های زبانی و تحلیلی ChatGPT می‌تواند گزارش‌گیری، تحلیل سناریوهای پیچیده و ارتباط با ذی‌نفعان را بهبود دهد؛ بااین‌حال وابستگی بیش از حد به ابزار، ملاحظات امنیتی و ضعف تحلیل‌های احساسی نیازمند مدیریت دقیق هستند.',keywords:'هوش مصنوعی، رهبری مالی، ChatGPT، تصمیم‌گیری مالی',href:'asset/articles/financial-leaders-ai.docx'},
  {title:'بهترین استراتژی تشکیل پرتفلیو با استفاده از نسبت‌های مالی ارزش افزوده اقتصادی به ارزش بازار، نسبت سود به قیمت و نسبت ارزش دفتری به ارزش بازار',venue:'پژوهش سرمایه‌گذاری و مدیریت پرتفلیو',authors:'ابوالقاسم اثنی عشری امیری، محمد محمودی، میلاد اثنی عشری امیری',year:'۱۳۸۶ تا ۱۳۹۰',pages:'—',abstract:'این پژوهش بررسی می‌کند آیا پرتفلیوی تشکیل‌شده بر اساس نسبت ارزش افزوده اقتصادی به ارزش بازار، بازده بالاتری نسبت به پرتفلیوهای مبتنی بر نسبت سود به قیمت و ارزش دفتری به بازار دارد یا خیر. نتایج نشان می‌دهد تفاوت معناداری میان بازده رویکردها وجود ندارد و ارزش افزوده اقتصادی الزاماً بازده بالاتری ایجاد نمی‌کند.',keywords:'پرتفلیو، ارزش افزوده اقتصادی، سود به قیمت، ارزش دفتری به بازار',href:'https://civilica.com/search/paper/n-%D9%85%DB%8C%D9%84%D8%A7%D8%AF_%D8%A7%D8%AB%D9%86%DB%8C%20%D8%B9%D8%B4%D8%B1%DB%8C/'},
  {title:'نقش حسابرسی داخلی در ارکان راهبری و کمیته‌های اجرایی',venue:'یادداشت تخصصی حسابرسی داخلی',authors:'فرشید خدابنده، میلاد اثنی عشری',year:'—',pages:'—',abstract:'ارزشی که حسابرسی داخلی برای سازمان ایجاد می‌کند به نگاه مدیران ارشد و هیئت‌مدیره به دامنه کاری آن وابسته است. حضور حسابرسی داخلی در جلسات ارکان راهبری و کمیته‌های اجرایی، امکان ارائه چشم‌انداز سازمانی، مهارت‌های انتقادی و خدمات اطمینان‌بخشی و مشاوره‌ای مستقل را فراهم می‌کند.',keywords:'حسابرسی داخلی، راهبری سازمانی، کمیته اجرایی، مدیریت ریسک',href:'asset/articles/internal-audit-governance.docx'},
  {title:'منشور حسابرسی داخلی: نقشه‌ای برای موفقیت اطمینان‌بخشی',venue:'یادداشت تخصصی حسابرسی داخلی',authors:'میلاد اثنی عشری، فرشید خدابنده',year:'—',pages:'—',abstract:'یکی از چالش‌های سازمان‌ها حصول اطمینان از مدیریت کارآ و اثربخش ریسک است. حسابرسی داخلی برای دستیابی به بالاترین سطح عملکرد به دستورالعمل‌های روشن از ارکان راهبری و مدیریت نیاز دارد؛ این دستورالعمل‌ها می‌توانند از طریق تدوین یک منشور منسجم حسابرسی داخلی منتقل شوند.',keywords:'منشور حسابرسی داخلی، اطمینان‌بخشی، ریسک، راهبری',href:'asset/articles/internal-audit-charter.docx'},
  {title:'بلاک‌چین و آینده حسابداری',venue:'مقاله فناوری‌های نوین در حسابداری',authors:'یاسمن خلیلی، میلاد اثنی عشری امیری، مجاهد رخشان',year:'—',pages:'—',abstract:'بلاک‌چین یکی از موضوعات مهم فناوری در امور مالی است. این مقاله ابعاد استفاده از بلاک‌چین، تفاوت آن با بیت‌کوین، نیاز به تولید برنامه‌های سازگار و ضرورت تدوین مقررات برای استفاده گسترده از این فناوری در حسابداری را بررسی می‌کند.',keywords:'بلاک‌چین، بیت‌کوین، حسابداری، فناوری مالی',href:'asset/articles/blockchain-accounting.pdf'}
);

const shutterContainer = document.getElementById('shutterContainer');
const civilicaSearchUrl = 'https://civilica.com/search/paper/n-%D9%85%DB%8C%D9%84%D8%A7%D8%AF_%D8%A7%D8%AB%D9%86%DB%8C%20%D8%B9%D8%B4%D8%B1%DB%8C/';

if (shutterContainer) {
  shutterContainer.innerHTML = ''; // پاک‌سازی اولیه
  
  articlesData.forEach((art, index) => {
    const blade = document.createElement('div');
    blade.className = `shutter-blade ${index === 0 ? 'active' : ''}`;

    blade.innerHTML = `
      <div class="blade-spine">
        <span class="blade-num">۰${index + 1}</span>
        <span class="blade-vertical-title">${art.title}</span>
        <i class="fa-solid fa-chevron-left"></i>
      </div>

      <div class="blade-content">
        <div>
          <span class="art-badge-top">
            <i class="fa-solid fa-scroll"></i> ${art.venue}
          </span>
          <h3 class="art-full-title">${art.title}</h3>
          <p class="art-authors">
            <i class="fa-solid fa-users"></i> ${art.authors}
          </p>
          <details class="art-abstract" open>
            <summary>مشاهده چکیده</summary>
            <p>${art.abstract}</p>
            <span><b>واژگان کلیدی:</b> ${art.keywords}</span>
          </details>
        </div>

        <div class="art-footer-row">
          <span class="art-year-tag">
            <i class="fa-regular fa-calendar"></i> سال انتشار: ${art.year} (${art.pages})
          </span>
        
        </div>
      </div>
    `;

    blade.addEventListener('mouseenter', () => {
      document.querySelectorAll('.shutter-blade').forEach(b => b.classList.remove('active'));
      blade.classList.add('active');
    });

    blade.addEventListener('click', () => {
      document.querySelectorAll('.shutter-blade').forEach(b => b.classList.remove('active'));
      blade.classList.add('active');
    });

    shutterContainer.appendChild(blade);
  });
}
} catch(articleErr) { console.error('Articles render error:', articleErr); }

/* =========================================
   ۴. تشخیص وضعیت لاگین و نمایش دکمه پنل کاربری
========================================= */
const currentUser = JSON.parse(localStorage.getItem('academy_currentUser'));
const loginBtn = document.getElementById('loginBtn');
const dashBtn = document.getElementById('dashBtn');

if (currentUser && loginBtn && dashBtn) {
  loginBtn.style.display = 'none';
  dashBtn.style.display = '';
}

// دکمه خروج
const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('academy_currentUser');
    localStorage.removeItem('academy_token');
    window.location.reload();
  });
}

/* =========================================
   ۵. تنظیم داینامیک سال در فوتر
========================================= */
const currentYear = document.getElementById('currentYear');
if (currentYear) {
  currentYear.textContent = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric'
  }).format(new Date());
}
