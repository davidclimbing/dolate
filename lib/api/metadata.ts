import { load } from 'cheerio';
import { Config } from '../config';

interface ArticleMetadata {
  title: string;
  description?: string;
  image?: string;
  author?: string;
  publishedAt?: string;
  domain: string;
  readingTime?: number;
  content?: string;
}

interface FetchOptions {
  timeout?: number;
  userAgent?: string;
}

export class MetadataAPI {
  private static readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  static async extractMetadata(url: string, options: FetchOptions = {}): Promise<ArticleMetadata> {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const timeout = options.timeout || Config.features.metadataExtractionTimeout;
      
      // Fetch the HTML content
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': options.userAgent || this.DEFAULT_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const $ = load(html);
      
      // Extract metadata using various methods
      const metadata = this.extractFromHtml($, domain);
      
      // Calculate reading time if content is available
      if (metadata.content) {
        metadata.readingTime = this.calculateReadingTime(metadata.content);
      }
      
      return metadata;
      
    } catch (error) {
      console.error('Error extracting metadata:', error);
      
      // Fallback to basic metadata
      const domain = this.extractDomain(url);
      return {
        title: this.generateFallbackTitle(url, domain),
        description: 'Content will be available when you read the article',
        domain,
        readingTime: 5,
      };
    }
  }
  
  private static extractFromHtml($: any, domain: string): ArticleMetadata {
    // Priority order for title extraction
    const title = 
      $('meta[property=\"og:title\"]').attr('content') ||
      $('meta[name=\"twitter:title\"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      `Article from ${domain}`;
    
    // Priority order for description extraction
    const description = 
      $('meta[property=\"og:description\"]').attr('content') ||
      $('meta[name=\"twitter:description\"]').attr('content') ||
      $('meta[name=\"description\"]').attr('content') ||
      this.extractFirstParagraph($);
    
    // Image extraction
    const image = 
      $('meta[property=\"og:image\"]').attr('content') ||
      $('meta[name=\"twitter:image\"]').attr('content') ||
      $('img').first().attr('src');
    
    // Author extraction
    const author = 
      $('meta[name=\"author\"]').attr('content') ||
      $('meta[property=\"article:author\"]').attr('content') ||
      $('.author').first().text() ||
      $('[rel=\"author\"]').first().text();
    
    // Published date extraction
    const publishedAt = 
      $('meta[property=\"article:published_time\"]').attr('content') ||
      $('meta[name=\"date\"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      $('time').first().attr('datetime');
    
    // Content extraction (try to get main article content)
    const content = this.extractMainContent($);
    
    return {
      title: this.cleanText(title),
      description: description ? this.cleanText(description) : undefined,
      image: image ? this.resolveImageUrl(image, domain) : undefined,
      author: author ? this.cleanText(author) : undefined,
      publishedAt: publishedAt || undefined,
      domain,
      content: content || undefined,
    };
  }
  
  private static extractMainContent($: any): string {
    // Try to find main content using common selectors
    const contentSelectors = [
      'article',
      '[role=\"main\"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '#content',
      '.article-body',
      '.post-body',
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove unwanted elements
        element.find('script, style, nav, aside, .advertisement, .ads').remove();
        const text = element.text();
        if (text.length > 100) { // Only return if substantial content
          return this.cleanText(text);
        }
      }
    }
    
    // Fallback: get all paragraph text
    const paragraphs = $('p').map((_, el) => $(el).text()).get();
    return paragraphs.join(' ');
  }
  
  private static extractFirstParagraph($: any): string {
    const firstP = $('p').first().text();
    return firstP.length > 50 ? firstP : '';
  }
  
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, ' ') // Replace newlines with space
      .trim()
      .substring(0, 500); // Limit length
  }
  
  private static resolveImageUrl(imageUrl: string, domain: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }
    if (imageUrl.startsWith('/')) {
      return `https://${domain}${imageUrl}`;
    }
    return `https://${domain}/${imageUrl}`;
  }
  
  private static generateFallbackTitle(url: string, domain: string): string {
    try {
      const path = new URL(url).pathname;
      const segments = path.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      if (lastSegment && lastSegment !== 'index.html') {
        return lastSegment
          .replace(/[-_]/g, ' ')
          .replace(/\.(html|php|asp|aspx)$/i, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } catch (error) {
      // Ignore URL parsing errors
    }
    
    return `Article from ${domain}`;
  }
  
  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }
  
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
  
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Remove common tracking parameters
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'fbclid', 'gclid', 'ref', 'source', 'campaign'
      ];
      
      trackingParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      
      // Ensure https for security
      if (urlObj.protocol === 'http:') {
        urlObj.protocol = 'https:';
      }
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  static async fetchFullContent(url: string): Promise<string> {
    try {
      const metadata = await this.extractMetadata(url);
      return metadata.content || '';
    } catch (error) {
      console.error('Error fetching content:', error);
      throw new Error('Failed to fetch article content');
    }
  }
}