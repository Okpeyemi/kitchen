
export interface LinkPreviewData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    html?: string;
}

export async function getLinkPreview(url: string): Promise<LinkPreviewData | null> {
    try {
        // Validate URL basic structure
        if (!url || !url.startsWith('http')) {
            return null;
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RecipeScanner/1.0; +http://mysite.com)',
                'Accept': 'text/html'
            }
        });

        if (!response.ok) {
            console.warn(`Failed to fetch preview for ${url}: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Basic Regex extractors
        const getMetaContent = (prop: string) => {
            const regex = new RegExp(`<metaproperty="og:${prop}"content="([^"]+)"`, 'i');
            const match = html.match(regex) || html.match(new RegExp(`<meta property="og:${prop}" content='([^']+)'`, 'i')) || html.match(new RegExp(`<meta property="og:${prop}" content="([^"]+)"`, 'i'));
            return match ? match[1] : undefined;
        };

        // Fallback for title
        const getTitle = () => {
            let title = getMetaContent('title');
            if (!title) {
                const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
                if (titleMatch) title = titleMatch[1];
            }
            return title;
        };

        // Fallback for description
        const getDescription = () => {
            let desc = getMetaContent('description');
            if (!desc) {
                const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
                if (descMatch) desc = descMatch[1];
            }
            return desc;
        }

        const data: LinkPreviewData = {
            url,
            title: getTitle(),
            description: getDescription(),
            image: getMetaContent('image'),
            siteName: getMetaContent('site_name'),
            html: html
        };

        // If we found nothing useful, return null
        if (!data.title && !data.description && !data.image) {
            return null;
        }

        // Decode HTML entities if necessary (simple version)
        const decode = (str?: string) => {
            if (!str) return undefined;
            return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        };

        return {
            url,
            title: decode(data.title),
            description: decode(data.description),
            image: data.image,
            siteName: decode(data.siteName),
            html: data.html
        };

    } catch (error) {
        console.warn('Error fetching link preview:', error);
        return null;
    }
}
