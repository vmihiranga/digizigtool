// Enhanced Instagram Tools Client Application
class InstagramTools {
    constructor() {
        this.currentTab = 'download';
        this.isProcessing = false;
        this.searchType = 'users';
        this.downloadQueue = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupImageErrorHandling();
        this.showWelcomeMessage();
        console.log('🚀 Instagram Tools v4.0 - Enhanced Edition with Advanced Features');
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Download functionality
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadUrl = document.getElementById('downloadUrl');
        const clearDownloadBtn = document.getElementById('clearDownloadBtn');

        downloadBtn?.addEventListener('click', () => this.handleDownload());
        clearDownloadBtn?.addEventListener('click', () => this.clearDownloadResults());
        downloadUrl?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) this.handleDownload();
        });

        // Stories functionality
        const storiesBtn = document.getElementById('storiesBtn');
        const storiesUsername = document.getElementById('storiesUsername');
        const clearStoriesBtn = document.getElementById('clearStoriesBtn');

        storiesBtn?.addEventListener('click', () => this.handleStories());
        clearStoriesBtn?.addEventListener('click', () => this.clearStoriesResults());
        storiesUsername?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) this.handleStories();
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchQuery = document.getElementById('searchQuery');
        const clearSearchBtn = document.getElementById('clearSearchBtn');

        searchBtn?.addEventListener('click', () => this.handleSearch());
        clearSearchBtn?.addEventListener('click', () => this.clearSearchResults());
        searchQuery?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) this.handleSearch();
        });

        // Search type buttons
        document.querySelectorAll('.search-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setSearchType(e.target.dataset.type));
        });

        // Profile stalker functionality
        const stalkerBtn = document.getElementById('stalkerBtn');
        const stalkerUsername = document.getElementById('stalkerUsername');
        const clearStalkerBtn = document.getElementById('clearStalkerBtn');

        stalkerBtn?.addEventListener('click', () => this.handleStalker());
        clearStalkerBtn?.addEventListener('click', () => this.clearStalkerResults());
        stalkerUsername?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) this.handleStalker();
        });

        // Modal functionality
        const modal = document.getElementById('mediaModal');
        const modalClose = document.getElementById('modalClose');
        
        modalClose?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupImageErrorHandling() {
        // Set up global image error handling
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                e.target.alt = 'Image not available';
            }
        }, true);
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    setSearchType(type) {
        this.searchType = type;
        
        document.querySelectorAll('.search-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        const searchQuery = document.getElementById('searchQuery');
        if (searchQuery) {
            searchQuery.placeholder = type === 'users' 
                ? 'Search for Instagram users (e.g., cristiano)...'
                : 'Search for hashtags (e.g., photography)...';
        }
    }

    async handleDownload() {
        if (this.isProcessing) return;

        const urlInput = document.getElementById('downloadUrl');
        const url = urlInput?.value.trim();

        if (!url) {
            this.showMessage('downloadMessage', 'Please enter an Instagram URL', 'error');
            return;
        }

        if (!this.isValidInstagramUrl(url)) {
            this.showMessage('downloadMessage', 'Please enter a valid Instagram post or reel URL', 'error');
            return;
        }

        this.isProcessing = true;
        this.showLoading('downloadLoading', true);
        this.hideMessage('downloadMessage');
        this.setButtonLoading('downloadBtn', true);

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                this.displayDownloadResult(data.data);
                this.showMessage('downloadMessage', 'Content downloaded successfully!', 'success');
            } else {
                throw new Error(data.error || 'Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showMessage('downloadMessage', `Download failed: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading('downloadLoading', false);
            this.setButtonLoading('downloadBtn', false);
        }
    }

    async handleStories() {
        if (this.isProcessing) return;

        const usernameInput = document.getElementById('storiesUsername');
        const username = usernameInput?.value.trim();

        if (!username) {
            this.showMessage('storiesMessage', 'Please enter a username', 'error');
            return;
        }

        this.isProcessing = true;
        this.showLoading('storiesLoading', true);
        this.hideMessage('storiesMessage');
        this.setButtonLoading('storiesBtn', true);

        try {
            const response = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (data.success) {
                this.displayStoriesResult(data.data);
                this.showMessage('storiesMessage', `${data.data.count} stories loaded for @${username}!`, 'success');
            } else {
                throw new Error(data.error || 'Stories fetch failed');
            }
        } catch (error) {
            console.error('Stories error:', error);
            this.showMessage('storiesMessage', `Failed to load stories: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading('storiesLoading', false);
            this.setButtonLoading('storiesBtn', false);
        }
    }

    async handleSearch() {
        if (this.isProcessing) return;

        const queryInput = document.getElementById('searchQuery');
        const query = queryInput?.value.trim();

        if (!query) {
            this.showMessage('searchMessage', 'Please enter a search query', 'error');
            return;
        }

        this.isProcessing = true;
        this.showLoading('searchLoading', true);
        this.hideMessage('searchMessage');
        this.setButtonLoading('searchBtn', true);

        try {
            const endpoint = this.searchType === 'users' ? '/api/search/users' : '/api/search/hashtags';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (data.success) {
                this.displaySearchResult(data.data, query);
                const count = data.data.users?.length || data.data.hashtags?.length || 0;
                this.showMessage('searchMessage', `Found ${count} ${this.searchType} for "${query}"`, 'success');
            } else {
                throw new Error(data.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('searchMessage', `Search failed: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading('searchLoading', false);
            this.setButtonLoading('searchBtn', false);
        }
    }

    async handleStalker() {
        if (this.isProcessing) return;

        const usernameInput = document.getElementById('stalkerUsername');
        const username = usernameInput?.value.trim();

        if (!username) {
            this.showMessage('stalkerMessage', 'Please enter a username', 'error');
            return;
        }

        this.isProcessing = true;
        this.showLoading('stalkerLoading', true);
        this.hideMessage('stalkerMessage');
        this.setButtonLoading('stalkerBtn', true);

        try {
            const response = await fetch('/api/stalk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (data.success) {
                this.displayStalkerResult(data.data);
                this.showMessage('stalkerMessage', `Enhanced profile info loaded for @${username}!`, 'success');
            } else {
                throw new Error(data.error || 'Profile fetch failed');
            }
        } catch (error) {
            console.error('Stalker error:', error);
            this.showMessage('stalkerMessage', `Failed to load profile: ${error.message}`, 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading('stalkerLoading', false);
            this.setButtonLoading('stalkerBtn', false);
        }
    }

    displayDownloadResult(data) {
        const resultDiv = document.getElementById('downloadResult');
        const authorInfo = document.getElementById('downloadAuthorInfo');
        const mediaGrid = document.getElementById('downloadMediaGrid');
        const downloadLinks = document.getElementById('downloadLinks');

        // Clear previous results
        if (authorInfo) authorInfo.innerHTML = '';
        if (mediaGrid) mediaGrid.innerHTML = '';
        if (downloadLinks) downloadLinks.innerHTML = '';

        // Display enhanced author info with post details
        if (authorInfo) {
            const postDetails = data.postDetails || {};
            authorInfo.innerHTML = `
                <div class="author-info">
                    <div class="author-header">
                        <h4><i class="fab fa-instagram"></i> @${this.escapeHtml(data.author || 'Unknown')}</h4>
                        <p>Instagram Content Creator</p>
                    </div>
                    ${postDetails.caption ? `
                        <div class="post-caption">
                            <h5><i class="fas fa-quote-left"></i> Caption</h5>
                            <p>${this.escapeHtml(postDetails.caption).substring(0, 200)}${postDetails.caption.length > 200 ? '...' : ''}</p>
                        </div>
                    ` : ''}
                    ${Object.keys(postDetails).length > 1 ? `
                        <div class="engagement-stats">
                            ${postDetails.likes ? `<span><i class="fas fa-heart"></i> ${this.formatNumber(postDetails.likes)} likes</span>` : ''}
                            ${postDetails.comments ? `<span><i class="fas fa-comment"></i> ${this.formatNumber(postDetails.comments)} comments</span>` : ''}
                            ${postDetails.shares ? `<span><i class="fas fa-share"></i> ${this.formatNumber(postDetails.shares)} shares</span>` : ''}
                            ${postDetails.views ? `<span><i class="fas fa-eye"></i> ${this.formatNumber(postDetails.views)} views</span>` : ''}
                        </div>
                    ` : ''}
                    ${postDetails.createdAt ? `
                        <div class="post-timestamp">
                            <small><i class="fas fa-clock"></i> Posted: ${new Date(postDetails.createdAt * 1000).toLocaleDateString()}</small>
                        </div>
                    ` : ''}
                    ${postDetails.hashtags && postDetails.hashtags.length > 0 ? `
                        <div class="post-hashtags">
                            <small><i class="fas fa-hashtag"></i> ${postDetails.hashtags.slice(0, 5).join(' ')}</small>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Display enhanced media with quality indicators
        if (data.media && mediaGrid) {
            data.media.forEach((item, index) => {
                const mediaItem = this.createEnhancedMediaElement(item, index + 1);
                mediaGrid.appendChild(mediaItem);
                
                // Add download link
                if (downloadLinks) {
                    const downloadLink = this.createDownloadLink(item.url, item.type, index + 1, item.quality);
                    downloadLinks.appendChild(downloadLink);
                }
            });
        }

        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('show');
        }
    }

    displayStoriesResult(data) {
        const resultDiv = document.getElementById('storiesResult');
        const authorInfo = document.getElementById('storiesAuthorInfo');
        const mediaGrid = document.getElementById('storiesMediaGrid');
        const downloadLinks = document.getElementById('storiesDownloadLinks');

        // Clear previous results
        if (authorInfo) authorInfo.innerHTML = '';
        if (mediaGrid) mediaGrid.innerHTML = '';
        if (downloadLinks) downloadLinks.innerHTML = '';

        // Display enhanced author info
        if (data.username && authorInfo) {
            authorInfo.innerHTML = `
                <div class="author-info">
                    <div class="author-header">
                        <h4><i class="fas fa-history"></i> @${this.escapeHtml(data.username)} Stories</h4>
                        <p>${data.count || 0} stories available • Extracted ${new Date().toLocaleTimeString()}</p>
                    </div>
                    <div class="stories-info">
                        <small><i class="fas fa-info-circle"></i> Stories are temporary content that disappears after 24 hours</small>
                    </div>
                </div>
            `;
        }

        // Display stories with download buttons
        if (data.stories && mediaGrid) {
            data.stories.forEach((item, index) => {
                const mediaItem = this.createEnhancedMediaElement(item, index + 1, true);
                mediaGrid.appendChild(mediaItem);
                
                // Add individual download button for each story
                if (downloadLinks) {
                    const downloadLink = this.createDownloadLink(item.downloadUrl || item.url, item.type, index + 1, item.quality, true);
                    downloadLinks.appendChild(downloadLink);
                }
            });
            
            // Add bulk download option
            if (downloadLinks && data.stories.length > 1) {
                const bulkDownloadBtn = document.createElement('button');
                bulkDownloadBtn.className = 'btn btn-secondary';
                bulkDownloadBtn.innerHTML = '<i class="fas fa-download"></i> Download All Stories';
                bulkDownloadBtn.onclick = () => this.downloadAllStories(data.stories);
                downloadLinks.appendChild(bulkDownloadBtn);
            }
        }

        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('show');
        }
    }

    displaySearchResult(data, query) {
        const resultDiv = document.getElementById('searchResult');
        const searchResults = document.getElementById('searchResults');

        if (!searchResults) return;

        searchResults.innerHTML = '';

        if (this.searchType === 'users' && data.users) {
            data.users.forEach((user, index) => {
                const userCard = this.createEnhancedUserCard(user, index);
                searchResults.appendChild(userCard);
            });
        } else if (this.searchType === 'hashtags' && data.hashtags) {
            data.hashtags.forEach((hashtag, index) => {
                const hashtagCard = this.createHashtagCard(hashtag, index);
                searchResults.appendChild(hashtagCard);
            });
        }

        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('show');
        }
    }

    displayStalkerResult(data) {
        const resultDiv = document.getElementById('stalkerResult');
        const profileCard = document.getElementById('profileCard');

        if (!profileCard) return;

        const businessInfo = data.businessCategory && data.businessCategory !== 'Personal' ? `
            <div class="profile-business">
                <h4><i class="fas fa-briefcase"></i> Business Information</h4>
                <p><strong>Account Type:</strong> ${data.businessCategory}</p>
                ${data.category ? `<p><strong>Category:</strong> ${this.escapeHtml(data.category)}</p>` : ''}
                ${data.contactInfo?.email ? `<p><strong>Email:</strong> ${this.escapeHtml(data.contactInfo.email)}</p>` : ''}
                ${data.contactInfo?.phone ? `<p><strong>Phone:</strong> ${this.escapeHtml(data.contactInfo.phone)}</p>` : ''}
                ${data.contactInfo?.address ? `<p><strong>Location:</strong> ${this.escapeHtml(data.contactInfo.address)}</p>` : ''}
            </div>
        ` : '';

        const engagementInfo = data.engagement ? `
            <div class="profile-engagement">
                <h4><i class="fas fa-chart-line"></i> Activity & Engagement</h4>
                <div class="engagement-grid">
                    <div class="engagement-item ${data.engagement.hasStories ? 'active' : 'inactive'}">
                        <i class="fas fa-history"></i>
                        <span>Stories ${data.engagement.hasStories ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="engagement-item ${data.engagement.hasHighlights ? 'active' : 'inactive'}">
                        <i class="fas fa-bookmark"></i>
                        <span>Highlights ${data.engagement.hasHighlights ? 'Available' : 'None'}</span>
                    </div>
                    <div class="engagement-item ${data.engagement.isActiveOnThreads ? 'active' : 'inactive'}">
                        <i class="fab fa-threads"></i>
                        <span>Threads ${data.engagement.isActiveOnThreads ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
        ` : '';

        const recentPosts = data.posts && data.posts.length > 0 ? `
            <div class="recent-posts">
                <h4><i class="fas fa-images"></i> Recent Posts</h4>
                <div class="posts-grid">
                    ${data.posts.slice(0, 6).map(post => `
                        <div class="post-item">
                            <img src="${post.url_imagen}" alt="Post" class="post-image" 
                                 onclick="window.instagramTools.openModal('${this.escapeHtml(post.url_imagen)}', 'image')"
                                 onerror="this.style.display='none'">
                            <div class="post-content">
                                <div class="post-stats">
                                    <span><i class="fas fa-heart"></i> ${this.formatNumber(post.me_gusta || 0)}</span>
                                    <span><i class="fas fa-comment"></i> ${this.formatNumber(post.comentarios || 0)}</span>
                                </div>
                                <p class="post-description">${this.escapeHtml((post.descripcion || '').substring(0, 100))}${(post.descripcion || '').length > 100 ? '...' : ''}</p>
                                <small class="post-date">${post.fecha || ''}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        profileCard.innerHTML = `
            <div class="profile-header">
                <div class="profile-image-container">
                    <img src="${data.profilePicHD || data.profilePic || this.getPlaceholderImage()}" 
                         alt="${this.escapeHtml(data.fullName || data.username)}" 
                         class="profile-image"
                         onerror="this.src='${this.getPlaceholderImage()}'">
                    ${data.isVerified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i></div>' : ''}
                    <button class="btn btn-small btn-secondary" onclick="window.instagramTools.downloadProfilePic('${data.profilePicHD || data.profilePic}', '${data.username}')">
                        <i class="fas fa-download"></i> Download Profile Picture
                    </button>
                </div>
                <div class="profile-details">
                    <h2>${this.escapeHtml(data.fullName || data.username)}</h2>
                    <h3>@${this.escapeHtml(data.username)}</h3>
                    ${data.category ? `<p class="profile-category"><i class="fas fa-tag"></i> ${this.escapeHtml(data.category)}</p>` : ''}
                    ${data.biography ? `<p class="profile-bio">${this.escapeHtml(data.biography)}</p>` : ''}
                    ${data.externalUrl ? `<a href="${this.escapeHtml(data.externalUrl)}" target="_blank" class="profile-link"><i class="fas fa-link"></i> ${this.escapeHtml(data.externalUrl)}</a>` : ''}
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-number">${this.formatNumber(data.mediaCount || 0)}</span>
                    <span class="stat-label">Posts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.formatNumber(data.followerCount || 0)}</span>
                    <span class="stat-label">Followers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.formatNumber(data.followingCount || 0)}</span>
                    <span class="stat-label">Following</span>
                </div>
                ${data.engagement?.hasStories ? `
                    <div class="stat-item">
                        <span class="stat-number"><i class="fas fa-check-circle"></i></span>
                        <span class="stat-label">Active Stories</span>
                    </div>
                ` : ''}
            </div>
            <div class="profile-status">
                <span class="status-badge ${data.isPrivate ? 'private' : 'public'}">
                    <i class="fas fa-${data.isPrivate ? 'lock' : 'globe'}"></i>
                    ${data.isPrivate ? 'Private' : 'Public'} Account
                </span>
                ${data.isVerified ? '<span class="status-badge verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                ${data.businessCategory && data.businessCategory !== 'Personal' ? `<span class="status-badge business"><i class="fas fa-briefcase"></i> ${data.businessCategory} Account</span>` : ''}
            </div>
            ${businessInfo}
            ${engagementInfo}
            ${recentPosts}
            ${data.metadata ? `
                <div class="profile-metadata">
                    <h4><i class="fas fa-info-circle"></i> Additional Information</h4>
                    <div class="metadata-grid">
                        ${data.metadata.accountCreated ? `<p><strong>Account Status:</strong> ${data.metadata.accountCreated}</p>` : ''}
                        ${data.metadata.lastActive ? `<p><strong>Last Story:</strong> ${new Date(data.metadata.lastActive * 1000).toLocaleDateString()}</p>` : ''}
                        ${data.dataSource ? `<p><strong>Data Source:</strong> ${data.dataSource}</p>` : ''}
                        ${data.extractedAt ? `<p><strong>Extracted:</strong> ${new Date(data.extractedAt).toLocaleString()}</p>` : ''}
                    </div>
                </div>
            ` : ''}
        `;

        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            resultDiv.classList.add('show');
        }
    }

    createEnhancedMediaElement(item, index, isStory = false) {
        const mediaDiv = document.createElement('div');
        mediaDiv.className = 'media-item';
        mediaDiv.setAttribute('data-type', item.type);

        let mediaElement = '';
        const url = item.url;
        const type = item.type;
        const quality = item.quality || 'HD';

        if (type === 'video') {
            mediaElement = `
                <div class="media-container">
                    <video controls preload="metadata" class="media-content" 
                           onclick="window.instagramTools.openModal('${this.escapeHtml(url)}', 'video')"
                           poster="${item.thumbnail ? this.escapeHtml(item.thumbnail) : ''}">
                        <source src="${this.escapeHtml(url)}" type="video/mp4">
                        Your browser doesn't support video playback.
                    </video>
                    <div class="quality-indicator ${quality.toLowerCase()}">${quality}</div>
                    <div class="media-type-indicator video">
                        <i class="fas fa-play"></i> Video
                    </div>
                </div>
            `;
        } else {
            mediaElement = `
                <div class="media-container">
                    <img src="${this.escapeHtml(url)}" 
                         alt="${isStory ? 'Story' : 'Post'} ${index}" 
                         class="media-content"
                         loading="lazy"
                         onclick="window.instagramTools.openModal('${this.escapeHtml(url)}', 'image')"
                         onerror="this.parentElement.innerHTML='<div class=\\"media-error\\"><i class=\\"fas fa-image\\"></i><p>Image not available</p></div>'">
                    <div class="quality-indicator ${quality.toLowerCase()}">${quality}</div>
                    <div class="media-type-indicator image">
                        <i class="fas fa-image"></i> Image
                    </div>
                </div>
            `;
        }

        const dimensions = item.width && item.height ? `${item.width} x ${item.height}` : '';

        mediaDiv.innerHTML = `
            ${mediaElement}
            <div class="media-info">
                <h5>${isStory ? 'Story' : this.capitalize(type)} ${index}</h5>
                <p>Click to view full size</p>
                ${dimensions ? `<small>Resolution: ${dimensions}</small>` : ''}
            </div>
        `;

        return mediaDiv;
    }

    createDownloadLink(url, type, index, quality = 'HD', isStory = false) {
        const link = document.createElement('a');
        link.href = url;
        link.className = 'download-link';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const timestamp = Date.now();
        const prefix = isStory ? 'story' : 'instagram';
        link.download = `${prefix}-${type}-${index}-${timestamp}.${type === 'video' ? 'mp4' : 'jpg'}`;
        
        link.innerHTML = `
            <i class="fas fa-download"></i>
            Download ${isStory ? 'Story' : this.capitalize(type)} ${index} (${quality})
        `;
        
        // Add click tracking
        link.addEventListener('click', () => {
            this.trackDownload(type, quality);
        });
        
        return link;
    }

    createEnhancedUserCard(user, index) {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-card';
        userDiv.style.animationDelay = `${index * 0.1}s`;
        
        userDiv.innerHTML = `
            <img src="${user.profilePic || this.getPlaceholderImage()}" 
                 alt="${this.escapeHtml(user.fullName || user.username)}"
                 class="user-avatar"
                 onerror="this.src='${this.getPlaceholderImage()}'">
            <div class="user-info">
                <h4>${this.escapeHtml(user.fullName || user.username)}</h4>
                <p>@${this.escapeHtml(user.username)}</p>
                <div class="user-badges">
                    ${user.isVerified ? '<span class="badge verified"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    <span class="badge ${user.isPrivate ? 'private' : 'public'}">
                        <i class="fas fa-${user.isPrivate ? 'lock' : 'globe'}"></i>
                        ${user.isPrivate ? 'Private' : 'Public'}
                    </span>
                    ${user.hasStories ? '<span class="badge stories"><i class="fas fa-history"></i> Active Stories</span>' : ''}
                </div>
                <div class="user-actions">
                    <button class="btn btn-small btn-primary" onclick="window.instagramTools.stalkUser('${this.escapeHtml(user.username)}')">
                        <i class="fas fa-user-secret"></i> View Profile
                    </button>
                    ${user.hasStories ? `
                        <button class="btn btn-small btn-secondary" onclick="window.instagramTools.viewStories('${this.escapeHtml(user.username)}')">
                            <i class="fas fa-history"></i> View Stories
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        return userDiv;
    }

    createHashtagCard(hashtag, index) {
        const hashtagDiv = document.createElement('div');
        hashtagDiv.className = 'hashtag-card';
        hashtagDiv.style.animationDelay = `${index * 0.1}s`;
        
        hashtagDiv.innerHTML = `
            <div class="hashtag-icon">
                <i class="fas fa-hashtag"></i>
            </div>
            <div class="hashtag-info">
                <h4>#${this.escapeHtml(hashtag.name)}</h4>
                <p>${this.formatNumber(hashtag.usage)} posts</p>
                <div class="hashtag-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.open('https://www.instagram.com/explore/tags/${this.escapeHtml(hashtag.name)}/', '_blank')">
                        <i class="fab fa-instagram"></i> View on Instagram
                    </button>
                </div>
            </div>
        `;
        return hashtagDiv;
    }

    // Enhanced utility methods
    openModal(url, type) {
        const modal = document.getElementById('mediaModal');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalBody) return;

        let content = '';
        if (type === 'video') {
            content = `
                <div class="modal-media-container">
                    <video controls autoplay style="max-width: 90vw; max-height: 80vh;" preload="metadata">
                        <source src="${this.escapeHtml(url)}" type="video/mp4">
                        Your browser doesn't support video playback.
                    </video>
                    <div class="modal-actions">
                        <a href="${this.escapeHtml(url)}" download class="btn btn-primary">
                            <i class="fas fa-download"></i> Download Video
                        </a>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="modal-media-container">
                    <img src="${this.escapeHtml(url)}" 
                         style="max-width: 90vw; max-height: 80vh; object-fit: contain;" 
                         alt="Full size image">
                    <div class="modal-actions">
                        <a href="${this.escapeHtml(url)}" download class="btn btn-primary">
                            <i class="fas fa-download"></i> Download Image
                        </a>
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = content;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('mediaModal');
        const modalBody = document.getElementById('modalBody');
        
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        if (modalBody) {
            modalBody.innerHTML = '';
        }
    }

    // Navigation methods
    stalkUser(username) {
        this.switchTab('stalker');
        const stalkerUsername = document.getElementById('stalkerUsername');
        if (stalkerUsername) {
            stalkerUsername.value = username;
            stalkerUsername.focus();
        }
    }

    viewStories(username) {
        this.switchTab('stories');
        const storiesUsername = document.getElementById('storiesUsername');
        if (storiesUsername) {
            storiesUsername.value = username;
            storiesUsername.focus();
        }
    }

    // Download utilities
    async downloadProfilePic(url, username) {
        if (!url) return;
        
        try {
            const link = document.createElement('a');
            link.href = url;
            link.download = `${username}_profile_pic_${Date.now()}.jpg`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showTemporaryMessage('Profile picture download started!', 'success');
        } catch (error) {
            this.showTemporaryMessage('Failed to download profile picture', 'error');
        }
    }

    async downloadAllStories(stories) {
        if (!stories || stories.length === 0) return;
        
        this.showTemporaryMessage(`Starting download of ${stories.length} stories...`, 'info');
        
        stories.forEach((story, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = story.downloadUrl || story.url;
                link.download = `story_${index + 1}_${Date.now()}.${story.type === 'video' ? 'mp4' : 'jpg'}`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 1000); // Delay each download by 1 second
        });
    }

    trackDownload(type, quality) {
        console.log(`Download tracked: ${type} (${quality}) at ${new Date().toISOString()}`);
    }

    // Enhanced UI methods
    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isLoading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    showTemporaryMessage(text, type = 'info', duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message temp-message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${text}
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }, duration);
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PGNpcmNsZSBjeD0iNzUiIGN5PSI2MCIgcj0iMjAiIGZpbGw9IiNjY2MiLz48cGF0aCBkPSJNNDUgMTAwaDYwYzAgLTIwIC0xMCAtMzUgLTMwIC0zNXMtMzAgMTUgLTMwIDM1eiIgZmlsbD0iI2NjYyIvPjwvc3ZnPg==';
    }

    // Clear result methods with enhanced cleanup
    clearDownloadResults() {
        this.clearResults('downloadResult', 'downloadMessage');
        const urlInput = document.getElementById('downloadUrl');
        if (urlInput) urlInput.value = '';
        this.downloadQueue = [];
    }

    clearStoriesResults() {
        this.clearResults('storiesResult', 'storiesMessage');
        const usernameInput = document.getElementById('storiesUsername');
        if (usernameInput) usernameInput.value = '';
    }

    clearSearchResults() {
        this.clearResults('searchResult', 'searchMessage');
        const queryInput = document.getElementById('searchQuery');
        if (queryInput) queryInput.value = '';
    }

    clearStalkerResults() {
        this.clearResults('stalkerResult', 'stalkerMessage');
        const usernameInput = document.getElementById('stalkerUsername');
        if (usernameInput) usernameInput.value = '';
    }

    clearResults(resultId, messageId) {
        const resultDiv = document.getElementById(resultId);
        if (resultDiv) {
            resultDiv.classList.add('hidden');
            resultDiv.classList.remove('show');
        }
        this.hideMessage(messageId);
    }

    // Enhanced utility methods
    showLoading(loadingId, show) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            if (show) {
                loadingDiv.classList.remove('hidden');
                loadingDiv.classList.add('show');
            } else {
                loadingDiv.classList.add('hidden');
                loadingDiv.classList.remove('show');
            }
        }
    }

    showMessage(messageId, text, type = 'info') {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message message-${type} show`;
            
            if (type === 'success') {
                setTimeout(() => this.hideMessage(messageId), 5000);
            }
        }
    }

    hideMessage(messageId) {
        const messageDiv = document.getElementById(messageId);
        if (messageDiv) {
            messageDiv.classList.remove('show');
        }
    }

    isValidInstagramUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?.*$/,
            /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/(p|reel)\/[A-Za-z0-9_-]+\/?.*$/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to execute action
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            switch (this.currentTab) {
                case 'download':
                    if (!this.isProcessing) this.handleDownload();
                    break;
                case 'stories':
                    if (!this.isProcessing) this.handleStories();
                    break;
                case 'search':
                    if (!this.isProcessing) this.handleSearch();
                    break;
                case 'stalker':
                    if (!this.isProcessing) this.handleStalker();
                    break;
            }
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            this.closeModal();
        }

        // Tab navigation with numbers
        if (e.altKey && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const tabs = ['download', 'stories', 'search', 'stalker'];
            this.switchTab(tabs[parseInt(e.key) - 1]);
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            console.log('Welcome to Enhanced Instagram Tools! 🎉');
            console.log('New Features in v4.0:');
            console.log('📥 Enhanced download with post details and engagement stats');
            console.log('📖 Stories with individual download buttons and bulk download');
            console.log('🔍 Improved search with activity indicators');
            console.log('👤 Comprehensive profile stalking with business info and recent posts');
            console.log('🖼️ Fixed image previews with error handling');
            console.log('⚡ Better performance and user experience');
            console.log('');
            console.log('Keyboard Shortcuts:');
            console.log('• Ctrl/Cmd + Enter: Execute current action');
            console.log('• Alt + 1-4: Switch tabs');
            console.log('• Escape: Close modal');
        }, 1000);
    }

    // Helper methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatNumber(num) {
        if (typeof num !== 'number') num = parseInt(num) || 0;
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Performance monitoring
    measurePerformance(operation, startTime) {
        const duration = Date.now() - startTime;
        console.log(`${operation} completed in ${duration}ms`);
        return duration;
    }

    // Error reporting
    reportError(operation, error) {
        const errorReport = {
            operation,
            error: error.message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        console.error('Error Report:', errorReport);
    }

    // Cleanup method
    cleanup() {
        this.downloadQueue = [];
        this.isProcessing = false;
        this.closeModal();
        
        // Clear any temporary messages
        document.querySelectorAll('.temp-message').forEach(msg => {
            msg.remove();
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.instagramTools = new InstagramTools();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (window.instagramTools) {
            window.instagramTools.cleanup();
        }
    });
});