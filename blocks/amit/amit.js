async function loadSwiper() {
    // Load Swiper CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    document.head.appendChild(link);

    // Load Swiper JS and expose to window
    return new Promise((resolve) => {
        if (window.Swiper) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
        script.onload = () => {
            console.log('Swiper loaded:', window.Swiper);
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load Swiper');
            resolve();
        };
        document.head.appendChild(script);
    });
}
export default async function decorate(block) {
    await loadSwiper(); // Load Swiper library asynchronously
    console.log('Decorate amit, block :', block);
    const rows = [...block.children];
    // const cols = [...row.children];

    console.log('Decorate amit, rows :', rows);
 //   Replace block content
    // block.innerHTML = '';
    // const swiperContainer = document.createElement('div');
    // swiperContainer.classList.add('swiper');
    // const swiperWrapper = document.createElement('div');
    // swiperWrapper.classList.add('swiper-wrapper');
    // swiperContainer.appendChild(swiperWrapper);
    // const pagination = document.createElement('div');
    // pagination.classList.add('swiper-pagination');
    // swiperContainer.appendChild(pagination);
    // block.appendChild(swiperContainer);
    // rows.forEach((row) => {
    //     const cols = [...row.children];
    //     // Create wrapper div
    //     const wrapper = document.createElement('div');
    //     wrapper.classList.add('amit-component-wrapper', 'swiper-slide');

    //     // Create image wrapper (first column)
    //     const imageWrapper = document.createElement('div');
    //     imageWrapper.classList.add('imageWrapper');

    //     if (cols[5]) {
    //         const firstColContent = cols[5].innerHTML;
    //         imageWrapper.innerHTML = firstColContent;
    //     }

    //     wrapper.appendChild(imageWrapper);

    //     // Create content wrapper (remaining columns)
    //     const contentWrapper = document.createElement('div');
    //     contentWrapper.classList.add('content');

    //     // Add text content (column 2-4)
    //     const textContent = document.createElement('div');
    //     textContent.classList.add('textContent');

    //     if (cols[0]) textContent.appendChild(cols[0].cloneNode(true));
    //     if (cols[1]) textContent.appendChild(cols[1].cloneNode(true));
    //     if (cols[2]) textContent.appendChild(cols[2].cloneNode(true));

    //     contentWrapper.appendChild(textContent);

    //     // Create button group (columns 5-6)
    //     const buttonGroup = document.createElement('div');
    //     buttonGroup.classList.add('buttonGroup');

    //     if (cols[3]) {
    //         const btn = document.createElement('button');
    //         btn.classList.add('primaryButton');
    //         btn.textContent = cols[3].textContent;
    //         buttonGroup.appendChild(btn);
    //     }

    //     if (cols[4]) {
    //         const btn = document.createElement('button');
    //         btn.classList.add('secondaryButton');
    //         btn.textContent = cols[4].textContent;
    //         buttonGroup.appendChild(btn);
    //     }

    //     contentWrapper.appendChild(buttonGroup);
    //     wrapper.appendChild(contentWrapper);

    //     swiperWrapper.prepend(wrapper);
    // });

    // // Initialize Swiper after all slides are added

    // new window.Swiper('.swiper', {
    //     loop: true,
    //     slidesPerView: 1,
    //     spaceBetween: 0,
    //     autoplay: {
    //         delay: 3000,
    //         disableOnInteraction: false,
    //     },
    //     pagination: {
    //         el: '.swiper-pagination',
    //         clickable: true,
    //     }
    // });
    // console.log('Swiper initialized successfully');

}