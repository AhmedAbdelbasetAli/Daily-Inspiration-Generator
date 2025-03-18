const NASA_API_KEY = 'DEMO_KEY'; //  ❌ Bad (exposed in client-side code)

const elements = {
    quote: document.getElementById('quote'),
    author: document.getElementById('author'),
    imageContainer: document.getElementById('imageContainer'),
    newInspirationBtn: document.getElementById('newInspiration'),
    saveQuoteBtn: document.getElementById('saveQuote'),
    saveImageBtn: document.getElementById('saveImage'),
    savedContent: document.getElementById('savedContent')
};

let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];

async function fetchQuote() {
    try {
        elements.quote.parentElement.classList.add('loading');
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        elements.quote.textContent = data.content;
        elements.author.textContent = `— ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        elements.quote.textContent = 'Failed to load quote. Click to try again!';
        elements.author.textContent = '';
    } finally {
        elements.quote.parentElement.classList.remove('loading');
    }
}

async function fetchNASAPhoto() {
    try {
        elements.imageContainer.parentElement.classList.add('loading');
        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
        );
        const data = await response.json();
        
        if (data.media_type === 'image') {
            elements.imageContainer.innerHTML = `
                <img src="${data.url}" alt="${data.title}">
                <div class="image-overlay">
                    <h3>${data.title}</h3>
                    <p>${data.explanation.substring(0, 100)}...</p>
                </div>
            `;
        } else {
            elements.imageContainer.innerHTML = `
                <div class="video-placeholder">
                    <p>🚀 Today's content is a video:</p>
                    <a href="${data.url}" target="_blank">Watch Video</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching NASA photo:', error);
        elements.imageContainer.innerHTML = '<p>Failed to load image. Click to try again!</p>';
    } finally {
        elements.imageContainer.parentElement.classList.remove('loading');
    }
}

function saveItem(type, content) {
    const newItem = {
        type,
        content,
        date: new Date().toLocaleString()
    };
    savedItems.push(newItem);
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    displaySavedItems();
}

function displaySavedItems() {
    elements.savedContent.innerHTML = savedItems.map((item, index) => `
        <div class="saved-item">
            ${item.type === 'quote' ? `
                <div class="saved-quote">
                    <p>"${item.content.content}"</p>
                    <small>${item.content.author}</small>
                </div>
            ` : `
                ${item.content.includes('image') ? `
                    <img src="${item.content}" alt="Saved inspiration">
                ` : `
                    <div class="saved-video">
                        <p>🎥 Video Archive</p>
                    </div>
                `}
            `}
            <button onclick="deleteItem(${index})" class="icon-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
        </div>
    `).join('');
}

function deleteItem(index) {
    savedItems.splice(index, 1);
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    displaySavedItems();
}

// Event Listeners
elements.newInspirationBtn.addEventListener('click', () => {
    fetchQuote();
    fetchNASAPhoto();
});

elements.saveQuoteBtn.addEventListener('click', () => {
    const quoteContent = {
        content: elements.quote.textContent,
        author: elements.author.textContent.replace('— ', '')
    };
    saveItem('quote', quoteContent);
});

elements.saveImageBtn.addEventListener('click', () => {
    const imgSrc = elements.imageContainer.querySelector('img')?.src;
    if (imgSrc) saveItem('image', imgSrc);
});

// Initial Load
fetchQuote();
fetchNASAPhoto();
displaySavedItems();
