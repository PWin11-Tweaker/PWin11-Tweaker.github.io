// Функция для извлечения изображений и текста из HTML
function processReleaseBody(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    let images = '';
    const imgElements = div.getElementsByTagName('img');
    for (let img of imgElements) {
        if (img.src && img.src.trim() !== '') {
            images += `<img src="${img.src}" alt="${img.alt || 'Release image'}" class="w-full h-auto mb-2 rounded-xl liquid-image-container">`;
        }
    }
    // Проверка на Markdown-изображения (например, ![alt](url))
    const markdownMatch = html.match(/!\[.*?\]\((.*?)\)/);
    if (markdownMatch && markdownMatch[1]) {
        images += `<img src="${markdownMatch[1]}" alt="Release image" class="w-full h-auto mb-2 rounded-xl liquid-image-container">`;
    }
    const text = div.textContent || div.innerText || '';
    return { images, text: text.substring(0, 100) + '...' };
}

// Функция для загрузки релизов с GitHub с улучшенным Liquid Glass дизайном
async function fetchReleases() {
    try {
        const response = await fetch('https://api.github.com/repos/PWin11-Tweaker/PWin11-Tweaker/releases');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const releases = await response.json();
        const releasesContainer = document.getElementById('releases');

        // Очистка контейнера
        releasesContainer.innerHTML = '';

        releases.slice(0, 6).forEach((release, index) => {
            const releaseCard = document.createElement('div');
            releaseCard.className = `liquid-release-card liquid-fade-in-delay-${Math.min(index + 1, 3)}`;
            
            const { images, text } = processReleaseBody(release.body);
            const downloadUrl = release.assets && release.assets[0] && release.assets[0].browser_download_url 
                ? release.assets[0].browser_download_url 
                : '#';
            
            const releaseType = release.prerelease ? 'pre-release' : 'stable';
            const badgeClass = release.prerelease ? 'liquid-button-danger' : 'liquid-button-primary';
            const releaseIcon = release.prerelease ? '🧪' : '✨';
            
            releaseCard.innerHTML = `
                <div class="liquid-content-container">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold liquid-accent liquid-text-shadow">${release.name}</h3>
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${badgeClass} liquid-text-shadow">
                            ${releaseIcon} ${releaseType}
                        </span>
                    </div>
                    ${images ? `<div class="liquid-image-container mb-4">${images}</div>` : ''}
                    <p class="liquid-text-shadow text-sm leading-relaxed mb-4">${text}</p>
                    <div class="flex items-center text-xs liquid-text-shadow opacity-75 mb-2">
                        <span class="mr-4">📅 ${new Date(release.published_at).toLocaleDateString()}</span>
                        <span>🏷️ ${release.tag_name}</span>
                    </div>
                </div>
                <div class="liquid-button-container">
                    <a href="${downloadUrl}" 
                       class="liquid-button ${badgeClass}" 
                       ${downloadUrl === '#' ? 'onclick="return false;" style="opacity: 0.5; cursor: not-allowed;"' : ''}
                       title="${downloadUrl === '#' ? 'No download available' : 'Download release'}">
                        ⬇️ Download
                    </a>
                    <a href="${release.html_url}" 
                       class="liquid-button liquid-button-secondary"
                       title="View on GitHub">
                        🔗 GitHub
                    </a>
                </div>
            `;
            
            releasesContainer.appendChild(releaseCard);
        });

        // Добавление интерактивных эффектов к новым карточкам
        addLiquidEffects();
        
    } catch (error) {
        console.error('Ошибка загрузки релизов:', error);
        showErrorState();
    }
}

// Функция для добавления Liquid Glass эффектов
function addLiquidEffects() {
    const cards = document.querySelectorAll('.liquid-release-card');
    
    cards.forEach(card => {
        // Эффект при наведении
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.03)';
            this.style.boxShadow = '0 0 50px rgba(78, 122, 199, 0.6), 0 25px 50px rgba(0, 0, 0, 0.5)';
            this.style.background = `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.08) 0%, 
                rgba(78, 122, 199, 0.15) 50%, 
                rgba(255, 140, 66, 0.08) 100%)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.background = '';
        });

        // Мерцающий эффект при клике
        card.addEventListener('click', function(e) {
            // Если клик не на кнопке
            if (!e.target.closest('.liquid-button')) {
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(78, 122, 199, 0.4)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                ripple.style.pointerEvents = 'none';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
}

// Функция для отображения состояния ошибки
function showErrorState() {
    const releasesContainer = document.getElementById('releases');
    releasesContainer.innerHTML = `
        <div class="col-span-full text-center">
            <div class="liquid-card liquid-highlight p-8 inline-block max-w-md mx-auto">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mystical-pulse">
                    <span class="text-2xl">⚠️</span>
                </div>
                <h3 class="text-xl font-semibold mb-4 liquid-accent">Connection Failed</h3>
                <p class="liquid-text-shadow mb-6">Unable to load releases from GitHub. Please check your connection and try again.</p>
                <div class="space-y-3">
                    <button onclick="location.reload()" class="liquid-button liquid-button-primary block w-full">
                        🔄 Retry
                    </button>
                    <a href="https://github.com/PWin11-Tweaker/PWin11-Tweaker/releases" 
                       class="liquid-button liquid-button-secondary block w-full">
                        🌐 View on GitHub
                    </a>
                </div>
            </div>
        </div>
    `;
}

// CSS для анимации ripple эффекта
if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .liquid-release-card {
            position: relative;
            overflow: hidden;
        }
        
        .liquid-image-container img {
            transition: transform 0.3s ease;
        }
        
        .liquid-image-container:hover img {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// Вызов функции только на странице pwin11tweaker_download.html
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('pwin11tweaker_download.html')) {
        // Показать состояние загрузки
        const loadingEl = document.getElementById('loading');
        const releasesEl = document.getElementById('releases');
        
        if (loadingEl && releasesEl) {
            loadingEl.style.display = 'block';
            releasesEl.style.display = 'none';
            
            // Загрузить релизы
            fetchReleases().then(() => {
                loadingEl.style.display = 'none';
                releasesEl.style.display = 'grid';
            }).catch(() => {
                loadingEl.style.display = 'none';
                releasesEl.style.display = 'grid';
            });
        } else {
            // Fallback для старой версии
            fetchReleases();
        }
    }
});

// Экспорт функций для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processReleaseBody,
        fetchReleases,
        addLiquidEffects
    };
}