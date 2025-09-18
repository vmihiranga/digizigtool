const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enhanced API Configuration
const APIS = {
    download: [
        'https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=',
        'https://api.vreden.my.id/api/igdownload?url=',
        'https://api.vreden.my.id/api/download/instagram2?url=',
        'https://api.sylphy.xyz/download/instagram?url=',
        'https://api.dreaded.site/api/igdl?url=',
        'https://api.dorratz.com/igdl?url='
    ],
    story: [
        'https://api-aswin-sparky.koyeb.app/api/downloader/story?search='
    ],
    userSearch: [
        'https://api.vreden.my.id/api/instagram/users?query='
    ],
    hashtagSearch: [
        'https://api.vreden.my.id/api/instagram/hashtags?query='
    ],
    userStalk: [
        'https://api.vreden.my.id/api/igstalk?query=',
        'https://api.giftedtech.web.id/api/stalk/igstalk?apikey=gifted&username=',
        'https://gokublack.xyz/stalk/igstalk?usuario='
    ]
};

// Helper function to validate Instagram URL
const isValidInstagramUrl = (url) => {
    const patterns = [
        /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?.*$/,
        /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/(p|reel)\/[A-Za-z0-9_-]+\/?.*$/
    ];
    return patterns.some(pattern => pattern.test(url));
};

// Helper function to make API requests
const makeAPIRequest = async (url, timeout = 15000) => {
    try {
        const response = await axios.get(url, {
            timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return response.data;
    } catch (error) {
        throw new Error(`API Request failed: ${error.message}`);
    }
};

// Enhanced media data extraction with more details
const extractMediaData = (data, apiType = 'unknown') => {
    let mediaItems = [];
    let author = null;
    let postDetails = {};

    try {
        // ASWIN SPARKY API format
        if (data.status === true && data.creator === "ASWIN SPARKY" && data.data) {
            author = data.creator;
            mediaItems = data.data.map(item => ({
                type: item.type,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                quality: 'HD'
            }));
        }
        // Enhanced Vreden API formats
        else if (data.status === 200 && data.result?.response) {
            const result = data.result.response;
            author = result.profile?.username || 'Unknown';
            
            // Extract post details
            postDetails = {
                caption: result.caption?.text || '',
                likes: result.statistics?.like_count || 0,
                comments: result.statistics?.comment_count || 0,
                shares: result.statistics?.share_count || 0,
                views: result.statistics?.play_count || result.statistics?.view_count || 0,
                createdAt: result.caption?.created_at,
                hashtags: result.caption?.hashtags || [],
                mentions: result.caption?.mentions || []
            };

            mediaItems = result.data?.map(item => ({
                type: item.type,
                url: item.url,
                thumbnail: item.thumb || item.url,
                width: item.width,
                height: item.height,
                quality: item.width >= 720 ? 'HD' : 'SD'
            })) || [];
        }
        else if (data.status === 200 && data.result?.media) {
            author = data.result.username;
            
            postDetails = {
                caption: data.result.title || '',
                likes: data.result.like_count || 0,
                comments: data.result.comment_count || 0,
                createdAt: data.result.taken_at
            };

            mediaItems = data.result.media.map(item => ({
                type: item.type,
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                quality: 'HD'
            }));
        }
        // Other API formats...
        else if (data.status === true && data.result?.dl) {
            author = data.result.username;
            
            postDetails = {
                caption: data.result.caption || '',
                likes: data.result.like || 0,
                comments: data.result.comment || 0
            };

            mediaItems = [{
                type: data.result.isVideo ? 'video' : 'image',
                url: data.result.dl,
                thumbnail: data.result.dl,
                quality: 'HD'
            }];
        }
        else if (data.success === true && data.result?.url) {
            author = data.result.metadata?.username || 'Unknown';
            
            postDetails = {
                caption: data.result.metadata?.caption || '',
                likes: data.result.metadata?.like || 0,
                comments: data.result.metadata?.comment || 0
            };

            mediaItems = data.result.url.map(url => ({
                type: data.result.metadata?.isVideo ? 'video' : 'image',
                url: url,
                thumbnail: url,
                quality: 'HD'
            }));
        }
        else if (data.creator && data.data) {
            author = data.creator;
            mediaItems = data.data.map(item => ({
                type: item.url.includes('.mp4') ? 'video' : 'image',
                url: item.url,
                thumbnail: item.thumbnail || item.url,
                quality: 'HD'
            }));
        }
    } catch (error) {
        console.error('Error extracting media data:', error);
    }

    return { mediaItems, author, postDetails };
};

// Enhanced story data extraction
const extractStoryData = (data) => {
    let stories = [];
    let username = null;

    try {
        if (data.status === true && data.creator === "ASWIN SPARKY" && data.data) {
            stories = data.data.map(story => ({
                type: story.video_url ? 'video' : 'image',
                url: story.video_url || story.image,
                thumbnail: story.image,
                downloadUrl: story.video_url || story.image,
                quality: 'HD',
                timestamp: Date.now()
            }));
        }
    } catch (error) {
        console.error('Error extracting story data:', error);
    }

    return { stories, username };
};

// Enhanced profile data extraction
const extractProfileData = (data, apiType = 'vreden') => {
    let profileData = {};

    try {
        if (apiType === 'vreden' && data.status === 200 && data.result?.user) {
            const user = data.result.user;
            profileData = {
                username: user.username,
                fullName: user.full_name,
                biography: user.biography,
                followerCount: user.follower_count,
                followingCount: user.following_count,
                mediaCount: user.media_count,
                profilePic: user.profile_pic_url,
                profilePicHD: user.profile_pic_url_hd || user.hd_profile_pic_url_info?.url,
                isPrivate: user.is_private,
                isVerified: user.is_verified,
                category: user.category,
                externalUrl: user.external_url,
                // Additional details
                businessCategory: user.account_type === 3 ? 'Business' : user.account_type === 2 ? 'Creator' : 'Personal',
                contactInfo: {
                    email: user.public_email || user.biography_email,
                    phone: user.public_phone_number,
                    address: user.location_data?.city_name
                },
                engagement: {
                    hasStories: user.latest_reel_media > 0,
                    isActiveOnThreads: user.is_active_on_text_post_app,
                    hasHighlights: user.has_highlight_reels
                },
                metadata: {
                    fbid: user.fbid_v2,
                    accountCreated: user.is_new_to_instagram ? 'Recent' : 'Established',
                    lastActive: user.latest_reel_media
                }
            };
        } else if (apiType === 'gokublack' && data.statusCode === 200) {
            profileData = {
                username: data.usuario,
                fullName: data.nombre_completo,
                biography: data.biografia,
                followerCount: data.seguidores,
                followingCount: data.siguiendo,
                mediaCount: data.publicaciones,
                profilePic: data.foto_perfil,
                profilePicHD: data.foto_perfil,
                isPrivate: data.cuenta_privada === 'Sí',
                isVerified: data.cuenta_verificada === 'Sí',
                externalUrl: data.enlace_externo,
                businessCategory: data.cuenta_comercial === 'Sí' ? 'Business' : 'Personal',
                posts: data.publicaciones_detalle || []
            };
        }
    } catch (error) {
        console.error('Error extracting profile data:', error);
    }

    return profileData;
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Enhanced Download Instagram Post/Reel
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url || !isValidInstagramUrl(url)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Instagram URL provided'
        });
    }

    let lastError = null;
    let bestResult = null;

    for (const apiUrl of APIS.download) {
        try {
            console.log(`Trying API: ${apiUrl}`);
            const data = await makeAPIRequest(apiUrl + encodeURIComponent(url));
            
            const { mediaItems, author, postDetails } = extractMediaData(data);
            
            if (mediaItems.length > 0) {
                const result = {
                    author,
                    media: mediaItems,
                    postDetails,
                    originalUrl: url,
                    extractedAt: new Date().toISOString()
                };

                // Prefer results with more details
                if (!bestResult || Object.keys(postDetails).length > Object.keys(bestResult.postDetails || {}).length) {
                    bestResult = result;
                }

                // If we have good details, return immediately
                if (postDetails.caption || postDetails.likes > 0) {
                    return res.json({
                        success: true,
                        data: result
                    });
                }
            }
        } catch (error) {
            lastError = error;
            console.log(`API failed: ${error.message}`);
            continue;
        }
    }

    if (bestResult) {
        return res.json({
            success: true,
            data: bestResult
        });
    }

    res.status(500).json({
        success: false,
        error: lastError ? lastError.message : 'All APIs failed to fetch content'
    });
});

// Enhanced Instagram Stories
app.post('/api/stories', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            error: 'Username is required'
        });
    }

    try {
        const apiUrl = APIS.story[0] + encodeURIComponent(username);
        const data = await makeAPIRequest(apiUrl);

        const { stories } = extractStoryData(data);

        if (stories.length > 0) {
            res.json({
                success: true,
                data: {
                    username,
                    stories,
                    count: stories.length,
                    extractedAt: new Date().toISOString()
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No stories found or user not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced User Search
app.post('/api/search/users', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }

    try {
        const apiUrl = APIS.userSearch[0] + encodeURIComponent(query);
        const data = await makeAPIRequest(apiUrl);

        if (data && data.result && data.result.users) {
            const enhancedUsers = data.result.users.map(user => ({
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                profilePic: user.profile_pic_url,
                isPrivate: user.is_private,
                isVerified: user.is_verified,
                hasStories: user.latest_reel_media > 0,
                profilePicId: user.profile_pic_id
            }));

            res.json({
                success: true,
                data: {
                    count: data.result.count,
                    users: enhancedUsers,
                    searchedAt: new Date().toISOString()
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No users found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Hashtag Search (unchanged)
app.post('/api/search/hashtags', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Search query is required'
        });
    }

    try {
        const apiUrl = APIS.hashtagSearch[0] + encodeURIComponent(query);
        const data = await makeAPIRequest(apiUrl);

        if (data && data.result && data.result.hashtags) {
            res.json({
                success: true,
                data: {
                    count: data.result.count,
                    hashtags: data.result.hashtags.map(hashtag => ({
                        id: hashtag.id,
                        name: hashtag.name,
                        usage: hashtag.usage
                    })),
                    searchedAt: new Date().toISOString()
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'No hashtags found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Enhanced User Stalker with multiple APIs
app.post('/api/stalk', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            error: 'Username is required'
        });
    }

    let bestResult = null;
    let lastError = null;

    // Try multiple APIs for comprehensive data
    for (let i = 0; i < APIS.userStalk.length; i++) {
        try {
            const apiUrl = APIS.userStalk[i] + encodeURIComponent(username);
            const data = await makeAPIRequest(apiUrl);
            
            const apiType = i === 0 ? 'vreden' : 'gokublack';
            const profileData = extractProfileData(data, apiType);

            if (profileData.username) {
                if (!bestResult || Object.keys(profileData).length > Object.keys(bestResult).length) {
                    bestResult = {
                        ...profileData,
                        extractedAt: new Date().toISOString(),
                        dataSource: apiType
                    };
                }

                // If we have comprehensive data, return it
                if (profileData.followerCount !== undefined && profileData.biography) {
                    return res.json({
                        success: true,
                        data: bestResult
                    });
                }
            }
        } catch (error) {
            lastError = error;
            console.log(`Stalk API ${i + 1} failed: ${error.message}`);
            continue;
        }
    }

    if (bestResult) {
        return res.json({
            success: true,
            data: bestResult
        });
    }

    res.status(500).json({
        success: false,
        error: lastError ? lastError.message : 'All profile APIs failed'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced Instagram Tools Server running on port ${PORT}`);
    console.log(`📱 Access the web interface at http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/*`);
});

module.exports = app;