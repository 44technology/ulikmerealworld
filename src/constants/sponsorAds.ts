/**
 * Sponsor ad content for Stories, Posts, and Reels.
 * Shown between organic content when user has not purchased ad-free.
 */

export interface SponsorStory {
  id: string;
  type: 'sponsor';
  name: string;
  avatar: string;
  label?: string;
  link?: string;
  category?: string;
}

export interface SponsorPost {
  id: string;
  type: 'sponsor';
  name: string;
  avatar: string;
  content: string;
  image: string;
  link?: string;
  category?: string;
  time: string;
}

/** For story rings (Home, Social) – short label */
export const SPONSOR_STORIES: SponsorStory[] = [
  {
    id: 'sponsor-story-1',
    type: 'sponsor',
    name: 'Panther Coffee',
    avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
    label: 'Sponsored',
    link: 'https://panthercoffee.com',
    category: 'Café',
  },
  {
    id: 'sponsor-story-2',
    type: 'sponsor',
    name: 'Nike',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
    label: 'Sponsored',
    link: 'https://nike.com',
    category: 'Sportswear',
  },
  {
    id: 'sponsor-story-3',
    type: 'sponsor',
    name: 'Zuma Miami',
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150',
    label: 'Sponsored',
    link: 'https://zumarestaurant.com',
    category: 'Restaurant',
  },
];

/** For feed posts (Social, Life) – post card format */
export const SPONSOR_POSTS: SponsorPost[] = [
  {
    id: 'sponsor-post-1',
    type: 'sponsor',
    name: 'Coca-Cola',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Coca-Cola-Logo.png',
    content: 'Taste the Feeling! 🥤',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    link: 'https://coca-cola.com',
    category: 'Beverage',
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-2',
    type: 'sponsor',
    name: 'Equinox South Beach',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150',
    content: 'Transform your body and mind! 💪',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    link: 'https://equinox.com',
    category: 'Fitness',
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-3',
    type: 'sponsor',
    name: 'Adidas',
    avatar: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
    content: 'Impossible is Nothing. 🏃‍♀️',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    link: 'https://adidas.com',
    category: 'Sportswear',
    time: 'Sponsored',
  },
  {
    id: 'sponsor-post-4',
    type: 'sponsor',
    name: 'Wynwood Walls',
    avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150',
    content: "Explore Miami's vibrant street art! 🎨",
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    link: 'https://wynwoodwalls.com',
    category: 'Art & Culture',
    time: 'Sponsored',
  },
];
