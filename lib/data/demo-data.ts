import type { Article } from '@/lib/stores/articles';

/**
 * Demo data for offline experience without authentication
 * Provides sample articles to showcase app functionality
 */

const DEMO_USER_ID = 'demo-user-12345';

export const demoArticles: Article[] = [
  {
    id: '1',
    title: 'React Native Performance: Best Practices for 2024',
    url: 'https://example.com/react-native-performance',
    content: `React Native has evolved significantly over the years, and with it, the performance optimization techniques have become more sophisticated. In this comprehensive guide, we'll explore the latest best practices for creating lightning-fast React Native applications.

## Key Performance Areas

1. **JavaScript Bundle Optimization**
   - Code splitting and lazy loading
   - Bundle analyzer usage
   - Tree shaking techniques

2. **Native Module Integration**  
   - Efficient bridge communication
   - JSI (JavaScript Interface) utilization
   - TurboModules implementation

3. **UI Performance**
   - FlatList optimization
   - Image loading strategies
   - Animation performance

## Hermes JavaScript Engine

The Hermes engine has become the default for React Native apps, providing significant startup time improvements and memory usage optimizations.

## Conclusion

Following these practices will ensure your React Native app performs exceptionally across all devices and platforms.`,
    description: 'Comprehensive guide to optimizing React Native applications for maximum performance and user experience.',
    image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
    author: 'Sarah Chen',
    published_at: '2024-01-15T08:30:00Z',
    domain: 'techblog.com',
    is_read: false,
    is_favorite: true,
    tags: ['React Native', 'Performance', 'Mobile Development'],
    reading_time: 8,
    user_id: DEMO_USER_ID,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    title: 'The Future of TypeScript: What\'s Coming in 2024',
    url: 'https://example.com/typescript-future-2024',
    content: `TypeScript continues to evolve rapidly, with exciting features planned for 2024 that will further enhance developer productivity and code safety.

## Upcoming Features

### Enhanced Pattern Matching
The long-awaited pattern matching feature is finally making its way into TypeScript, providing more elegant ways to handle complex conditional logic.

### Improved Inference
Type inference improvements will reduce the need for explicit type annotations in many scenarios.

### Better Performance
Significant performance improvements in the compiler will make large codebases compile faster.

## Migration Strategies

For teams looking to upgrade, we recommend a gradual approach with comprehensive testing.`,
    description: 'Exploring the exciting new features and improvements coming to TypeScript in 2024.',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    author: 'Michael Rodriguez',
    published_at: '2024-01-10T14:20:00Z',
    domain: 'typescript-weekly.io',
    is_read: true,
    is_favorite: false,
    tags: ['TypeScript', 'JavaScript', 'Programming Languages'],
    reading_time: 6,
    user_id: DEMO_USER_ID,
    created_at: '2024-01-10T15:00:00Z',
    updated_at: '2024-01-10T15:00:00Z'
  },
  {
    id: '3',
    title: 'Building Accessible Mobile Apps: A Complete Guide',
    url: 'https://example.com/accessible-mobile-apps',
    content: `Accessibility in mobile applications is not just a nice-to-have feature—it's essential for creating inclusive experiences that work for everyone.

## Why Accessibility Matters

Over 1 billion people worldwide have some form of disability. By making your app accessible, you're not only doing the right thing but also expanding your potential user base.

## Key Principles

1. **Perceivable**: Information must be presentable in ways users can perceive
2. **Operable**: Interface components must be operable by all users
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough to work with various assistive technologies

## Implementation Tips

- Use semantic HTML elements
- Provide alt text for images
- Ensure sufficient color contrast
- Support keyboard navigation
- Test with screen readers

## Testing Tools

Several tools can help you test accessibility, from automated scanners to manual testing guides.`,
    description: 'Learn how to build mobile applications that are accessible to users with disabilities, following WCAG guidelines.',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    author: 'Emily Johnson',
    published_at: '2024-01-08T11:45:00Z',
    domain: 'accessibility-first.com',
    is_read: false,
    is_favorite: false,
    tags: ['Accessibility', 'UX Design', 'Mobile Development', 'WCAG'],
    reading_time: 10,
    user_id: DEMO_USER_ID,
    created_at: '2024-01-08T12:00:00Z',
    updated_at: '2024-01-08T12:00:00Z'
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox: When to Use Which',
    url: 'https://example.com/css-grid-vs-flexbox',
    content: `Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes and excel in different scenarios.

## CSS Grid: The 2D Layout Champion

CSS Grid is designed for two-dimensional layouts where you need to control both rows and columns simultaneously.

### Best Use Cases:
- Complex page layouts
- Card-based designs
- Magazine-style layouts
- Any layout where you need precise control over both dimensions

## Flexbox: The 1D Layout Master

Flexbox excels at one-dimensional layouts, either in a row or column direction.

### Best Use Cases:
- Navigation bars
- Centering content
- Distributing space between items
- Responsive component layouts

## Can They Work Together?

Absolutely! Grid and Flexbox complement each other perfectly. Use Grid for your overall page layout and Flexbox for component-level layouts.

## Practical Examples

Here are some real-world scenarios where each shines:

1. **Grid for Page Layout**: Header, sidebar, main content, footer
2. **Flexbox for Components**: Button groups, form controls, card content

## Browser Support

Both technologies have excellent browser support in modern browsers, with Grid being supported since 2017.`,
    description: 'Understanding the strengths of CSS Grid and Flexbox to choose the right tool for your layout needs.',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    author: 'David Kim',
    published_at: '2024-01-05T16:30:00Z',
    domain: 'css-tricks.com',
    is_read: true,
    is_favorite: true,
    tags: ['CSS', 'Web Development', 'Layout', 'Frontend'],
    reading_time: 7,
    user_id: DEMO_USER_ID,
    created_at: '2024-01-05T17:00:00Z',
    updated_at: '2024-01-05T17:00:00Z'
  },
  {
    id: '5',
    title: 'Supabase vs Firebase: The Complete Comparison',
    url: 'https://example.com/supabase-vs-firebase-2024',
    content: `As backend-as-a-service platforms continue to evolve, the choice between Supabase and Firebase has become increasingly important for developers.

## Overview

Both platforms offer similar core features but take different approaches to implementation and philosophy.

### Firebase Strengths:
- Mature ecosystem with extensive documentation
- Strong integration with Google Cloud Platform
- Excellent real-time database performance
- Comprehensive analytics and crash reporting

### Supabase Strengths:
- Open-source foundation
- PostgreSQL-based (SQL familiar to many developers)
- Built-in authentication with multiple providers
- Real-time capabilities with row-level security

## Feature Comparison

| Feature | Firebase | Supabase |
|---------|----------|----------|
| Database | NoSQL | PostgreSQL (SQL) |
| Authentication | ✅ Excellent | ✅ Great |
| Real-time | ✅ Excellent | ✅ Very Good |
| File Storage | ✅ Good | ✅ Good |
| Edge Functions | ✅ Good | ✅ Excellent |

## Pricing Considerations

Firebase uses a pay-as-you-go model, while Supabase offers more predictable pricing tiers.

## Making the Choice

Your decision should be based on:
- Team's SQL vs NoSQL preference
- Open-source requirements
- Integration needs
- Pricing sensitivity
- Feature requirements

## Conclusion

Both platforms are excellent choices. Firebase might be better for Google ecosystem integration, while Supabase excels for teams preferring SQL and open-source solutions.`,
    description: 'A detailed comparison between Supabase and Firebase to help you choose the right backend platform.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    author: 'Alex Thompson',
    published_at: '2024-01-03T13:15:00Z',
    domain: 'backend-weekly.dev',
    is_read: false,
    is_favorite: false,
    tags: ['Supabase', 'Firebase', 'Backend', 'BaaS', 'Database'],
    reading_time: 12,
    user_id: DEMO_USER_ID,
    created_at: '2024-01-03T14:00:00Z',
    updated_at: '2024-01-03T14:00:00Z'
  }
];

export const demoTags = [
  'React Native',
  'TypeScript',
  'JavaScript',
  'CSS',
  'Web Development',
  'Mobile Development',
  'Performance',
  'Accessibility',
  'UX Design',
  'Backend',
  'Database',
  'Firebase',
  'Supabase',
  'Frontend',
  'Programming Languages',
  'WCAG',
  'BaaS',
  'Layout'
];

export { DEMO_USER_ID };