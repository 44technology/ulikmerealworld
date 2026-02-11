# Developer Features Specification
## New Features Implementation Guide

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Target Audience:** Development Team, Backend Engineers, Frontend Engineers

---

## Table of Contents

1. [1-on-1 Chat Auto-Deletion Feature](#1-on-1-chat-auto-deletion-feature)
2. [Dice Random Selection Feature](#dice-random-selection-feature)
3. [Stories 24-Hour Expiration](#stories-24-hour-expiration)
4. [Sponsored Ads in Life Feed](#sponsored-ads-in-life-feed)
5. [Payment Processing System](#payment-processing-system)
6. [QR Code Generation & Check-In](#qr-code-generation--check-in)
7. [Follow System for Creators](#follow-system-for-creators)

---

## 1-on-1 Chat Auto-Deletion Feature

### Overview

**Feature:** Automatically delete 1-on-1 chat conversations if no message is received from the other party within 48 hours after the second message exchange.

**Purpose:** Clean up inactive conversations and encourage active engagement.

**Scope:** Applies only to 1-on-1 chats (not group chats).

---

### Business Rules

1. **Trigger Condition:**
   - Both users have sent at least 2 messages each (total 4+ messages)
   - Last message was sent by User A
   - 48 hours pass without User B responding

2. **Deletion Behavior:**
   - Chat is deleted from User B's perspective (the non-responder)
   - Chat remains visible to User A (the last sender) until User A sends another message
   - If User A sends another message after 48 hours, chat remains for both users

3. **Notification:**
   - User B receives notification: "Your conversation with [User A] was deleted due to inactivity"
   - User A does not receive notification (chat still visible to them)

4. **Exceptions:**
   - Group chats are not affected
   - Chats with less than 4 total messages are not affected
   - If User B responds within 48 hours, deletion is cancelled

---

### Technical Implementation

#### Database Schema Changes

**Add to `Chat` table:**

```prisma
model Chat {
  id            String   @id @default(uuid())
  participants  User[]   @relation("ChatParticipants")
  messages      Message[]
  isGroupChat   Boolean  @default(false)
  
  // New fields for auto-deletion
  lastMessageAt         DateTime?
  lastMessageSenderId   String?
  messageCount          Int       @default(0)
  deletionScheduledAt   DateTime? // When to check for deletion
  deletedForUserIds     String[]  @default([]) // Users for whom chat is deleted
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Add to `Message` table:**

```prisma
model Message {
  id          String   @id @default(uuid())
  chatId      String
  chat        Chat     @relation(fields: [chatId], references: [id])
  senderId    String
  sender      User     @relation(fields: [senderId], references: [id])
  content     String
  messageType String   @default("text") // text, image, video, etc.
  
  createdAt   DateTime @default(now())
  
  @@index([chatId, createdAt])
}
```

---

#### Backend Implementation

**1. Message Creation Handler**

```typescript
// server/src/controllers/chatController.ts

async createMessage(req: Request, res: Response) {
  const { chatId, content, messageType } = req.body;
  const senderId = req.user.id;

  // Create message
  const message = await prisma.message.create({
    data: {
      chatId,
      senderId,
      content,
      messageType: messageType || 'text',
    },
    include: {
      sender: true,
      chat: {
        include: {
          participants: true,
        },
      },
    },
  });

  // Update chat metadata
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: true,
      participants: true,
    },
  });

  const messageCount = chat.messages.length;
  const isGroupChat = chat.isGroupChat;

  // Only apply auto-deletion logic to 1-on-1 chats
  if (!isGroupChat && chat.participants.length === 2) {
    // Check if both users have sent at least 2 messages
    const senderMessageCount = chat.messages.filter(
      (m) => m.senderId === senderId
    ).length;
    
    const otherParticipantId = chat.participants.find(
      (p) => p.id !== senderId
    )?.id;

    const otherMessageCount = chat.messages.filter(
      (m) => m.senderId === otherParticipantId
    ).length;

    // Update chat with last message info
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date(),
        lastMessageSenderId: senderId,
        messageCount: messageCount,
        // Schedule deletion check if both have sent 2+ messages
        deletionScheduledAt:
          senderMessageCount >= 2 && otherMessageCount >= 2
            ? new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
            : null,
        // Clear deletedForUserIds if chat becomes active again
        deletedForUserIds: [],
      },
    });
  }

  // Emit real-time event
  io.to(chatId).emit('newMessage', message);

  res.json(message);
}
```

---

**2. Scheduled Deletion Job**

```typescript
// server/src/jobs/chatDeletionJob.ts

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Runs every hour to check for chats that need deletion
 */
export function startChatDeletionJob() {
  cron.schedule('0 * * * *', async () => {
    // Find chats scheduled for deletion check
    const chatsToCheck = await prisma.chat.findMany({
      where: {
        isGroupChat: false,
        deletionScheduledAt: {
          lte: new Date(), // Scheduled time has passed
        },
        deletedForUserIds: {
          isEmpty: true, // Not already deleted
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get last message
        },
      },
    });

    for (const chat of chatsToCheck) {
      const lastMessage = chat.messages[0];
      const lastMessageTime = lastMessage?.createdAt || chat.lastMessageAt;
      const hoursSinceLastMessage =
        (Date.now() - lastMessageTime.getTime()) / (1000 * 60 * 60);

      // Check if 48 hours have passed
      if (hoursSinceLastMessage >= 48) {
        // Get the non-responder (user who didn't send last message)
        const nonResponderId = chat.participants.find(
          (p) => p.id !== chat.lastMessageSenderId
        )?.id;

        if (nonResponderId) {
          // Mark chat as deleted for non-responder
          await prisma.chat.update({
            where: { id: chat.id },
            data: {
              deletedForUserIds: {
                push: nonResponderId,
              },
            },
          });

          // Send notification to non-responder
          await sendNotification(nonResponderId, {
            type: 'CHAT_DELETED',
            title: 'Conversation Deleted',
            message: `Your conversation with ${chat.participants.find(p => p.id !== nonResponderId)?.name} was deleted due to inactivity`,
            chatId: chat.id,
          });

          // Emit real-time event
          io.to(`user:${nonResponderId}`).emit('chatDeleted', {
            chatId: chat.id,
          });
        }
      }
    }
  });
}
```

---

**3. Chat List Query (Filter Deleted Chats)**

```typescript
// server/src/controllers/chatController.ts

async getChats(req: Request, res: Response) {
  const userId = req.user.id;

  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          id: userId,
        },
      },
      // Exclude chats deleted for this user
      deletedForUserIds: {
        not: {
          has: userId,
        },
      },
    },
    include: {
      participants: {
        where: {
          id: {
            not: userId,
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  res.json(chats);
}
```

---

#### Frontend Implementation

**1. Chat List Component**

```typescript
// src/components/ChatList.tsx

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function ChatList() {
  const { data: chats, refetch } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await fetch('/api/chats');
      return response.json();
    },
  });

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL);

    // Listen for chat deletion events
    socket.on('chatDeleted', ({ chatId }) => {
      // Remove deleted chat from list
      refetch();
      
      // Show notification
      toast.info('A conversation was deleted due to inactivity');
    });

    return () => {
      socket.off('chatDeleted');
    };
  }, [refetch]);

  return (
    <div>
      {chats?.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}
```

---

**2. Message Input Component**

```typescript
// src/components/MessageInput.tsx

export function MessageInput({ chatId }: { chatId: string }) {
  const sendMessage = async (content: string) => {
    await fetch('/api/chats/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        content,
        messageType: 'text',
      }),
    });

    // If chat was deleted for other user, it will be restored
    // by the backend when this message is sent
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

### Testing Requirements

**Unit Tests:**

```typescript
describe('Chat Auto-Deletion', () => {
  it('should schedule deletion after 2 messages from each user', async () => {
    // Create chat with 2 messages from each user
    // Verify deletionScheduledAt is set to 48 hours from now
  });

  it('should not delete chat if response received within 48 hours', async () => {
    // Create chat, wait 47 hours, send message
    // Verify chat is not deleted
  });

  it('should delete chat for non-responder after 48 hours', async () => {
    // Create chat, wait 48+ hours
    // Verify chat is deleted for non-responder only
  });

  it('should not affect group chats', async () => {
    // Create group chat, verify deletion logic doesn't apply
  });
});
```

---

### API Endpoints

**POST `/api/chats/messages`**
- Create new message
- Updates chat metadata for auto-deletion

**GET `/api/chats`**
- Returns chats excluding deleted ones for current user

**GET `/api/chats/:id`**
- Returns chat details (excludes if deleted for user)

---

## Dice Random Selection Feature

### Overview

**Feature:** After rolling dice, show a 10-second video, then randomly select a class or activity for the user. Available once per day.

**Purpose:** Gamification and discovery of new content.

**Scope:** Available on Discover page or dedicated Surprise Me page.

---

### Business Rules

1. **Dice Roll:**
   - User clicks dice button
   - 10-second promotional/entertainment video plays
   - After video, random class or activity is selected

2. **Random Selection:**
   - Randomly selects from available classes OR activities
   - Selection based on:
     - User's interests (preferred)
     - Location proximity (if available)
     - Popular/trending content
     - Excludes already enrolled/joined items

3. **Daily Limit:**
   - One dice roll per day per user
   - Resets at midnight (user's timezone)
   - Counter displayed: "Rolls remaining today: 1"

4. **Video Content:**
   - 10-second promotional video
   - Can be:
     - Platform promotional video
     - Featured instructor/venue video
     - Sponsored content (if applicable)

---

### Technical Implementation

#### Database Schema

**Add to `User` table:**

```prisma
model User {
  id                String   @id @default(uuid())
  // ... existing fields
  
  // Dice roll tracking
  lastDiceRollAt    DateTime?
  diceRollsToday    Int      @default(0)
  diceRollResetDate DateTime? // Date when counter resets
}
```

**Create `DiceRoll` table:**

```prisma
model DiceRoll {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  selectedType  String   // "class" or "activity"
  selectedId    String   // ID of selected class/activity
  rolledAt      DateTime @default(now())
  
  @@index([userId, rolledAt])
}
```

---

#### Backend Implementation

**1. Dice Roll Endpoint**

```typescript
// server/src/controllers/discoverController.ts

async rollDice(req: Request, res: Response) {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Check daily limit
  const now = new Date();
  const userTimezone = user.timezone || 'UTC';
  const today = getStartOfDay(now, userTimezone);
  const lastRollDate = user.lastDiceRollAt
    ? getStartOfDay(user.lastDiceRollAt, userTimezone)
    : null;

  // Reset counter if new day
  if (!lastRollDate || lastRollDate < today) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        diceRollsToday: 0,
        diceRollResetDate: today,
      },
    });
  }

  // Check if user has rolls remaining
  if (user.diceRollsToday >= 1) {
    return res.status(429).json({
      error: 'Daily limit reached',
      message: 'You can roll the dice once per day. Try again tomorrow!',
      nextRollAt: getNextMidnight(userTimezone),
    });
  }

  // Get random video (can be from database or static)
  const video = await getRandomDiceVideo();

  // Select random class or activity
  const selectedItem = await selectRandomClassOrActivity(userId);

  // Record dice roll
  await prisma.diceRoll.create({
    data: {
      userId,
      selectedType: selectedItem.type, // "class" or "activity"
      selectedId: selectedItem.id,
    },
  });

  // Update user's roll count
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastDiceRollAt: now,
      diceRollsToday: {
        increment: 1,
      },
    },
  });

  res.json({
    video: {
      url: video.url,
      duration: 10, // seconds
      type: video.type, // "promotional" | "sponsored" | "featured"
    },
    selectedItem: {
      type: selectedItem.type,
      id: selectedItem.id,
      name: selectedItem.name,
      image: selectedItem.image,
      // ... other relevant fields
    },
  });
}

async function selectRandomClassOrActivity(userId: string) {
  // Get user's interests and preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: true,
      enrolledClasses: {
        select: { id: true },
      },
      joinedActivities: {
        select: { id: true },
      },
    },
  });

  // Randomly choose between class and activity
  const selectType = Math.random() < 0.5 ? 'class' : 'activity';

  if (selectType === 'class') {
    // Get available classes
    const classes = await prisma.class.findMany({
      where: {
        // Exclude enrolled classes
        id: {
          notIn: user.enrolledClasses.map((c) => c.id),
        },
        // Match user interests (if available)
        category: {
          in: user.interests.map((i) => i.name),
        },
        // Only active/future classes
        startDate: {
          gte: new Date(),
        },
      },
      take: 100, // Limit for randomization
    });

    if (classes.length === 0) {
      // Fallback: get any available class
      const fallbackClasses = await prisma.class.findMany({
        where: {
          id: {
            notIn: user.enrolledClasses.map((c) => c.id),
          },
          startDate: {
            gte: new Date(),
          },
        },
        take: 100,
      });

      const randomClass =
        fallbackClasses[Math.floor(Math.random() * fallbackClasses.length)];

      return {
        type: 'class',
        id: randomClass.id,
        name: randomClass.title,
        image: randomClass.image,
        // ... other fields
      };
    }

    const randomClass = classes[Math.floor(Math.random() * classes.length)];

    return {
      type: 'class',
      id: randomClass.id,
      name: randomClass.title,
      image: randomClass.image,
      // ... other fields
    };
  } else {
    // Similar logic for activities
    const activities = await prisma.activity.findMany({
      where: {
        id: {
          notIn: user.joinedActivities.map((a) => a.id),
        },
        date: {
          gte: new Date(),
        },
      },
      take: 100,
    });

    if (activities.length === 0) {
      const fallbackActivities = await prisma.activity.findMany({
        where: {
          id: {
            notIn: user.joinedActivities.map((a) => a.id),
          },
          date: {
            gte: new Date(),
          },
        },
        take: 100,
      });

      const randomActivity =
        fallbackActivities[Math.floor(Math.random() * fallbackActivities.length)];

      return {
        type: 'activity',
        id: randomActivity.id,
        name: randomActivity.title,
        image: randomActivity.image,
        // ... other fields
      };
    }

    const randomActivity =
      activities[Math.floor(Math.random() * activities.length)];

    return {
      type: 'activity',
      id: randomActivity.id,
      name: randomActivity.title,
      image: randomActivity.image,
      // ... other fields
    };
  }
}

async function getRandomDiceVideo() {
  // Can be from database or static list
  const videos = await prisma.diceVideo.findMany({
    where: {
      isActive: true,
    },
  });

  if (videos.length === 0) {
    // Fallback to default video
    return {
      url: '/videos/dice-default.mp4',
      type: 'promotional',
    };
  }

  const randomVideo =
    videos[Math.floor(Math.random() * videos.length)];

  return {
    url: randomVideo.url,
    type: randomVideo.type,
  };
}
```

---

#### Frontend Implementation

**1. Dice Roll Component**

```typescript
// src/components/DiceRoll.tsx

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { VideoPlayer } from './VideoPlayer';
import { useNavigate } from 'react-router-dom';

export function DiceRoll() {
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();

  const { data: rollStatus } = useQuery({
    queryKey: ['diceRollStatus'],
    queryFn: async () => {
      const response = await fetch('/api/discover/dice/status');
      return response.json();
    },
  });

  const rollDiceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/discover/dice/roll', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setVideoUrl(data.video.url);
      setShowVideo(true);
      setSelectedItem(data.selectedItem);
    },
  });

  const handleVideoEnd = () => {
    setShowVideo(false);
    // Navigate to selected item
    if (selectedItem.type === 'class') {
      navigate(`/classes/${selectedItem.id}`);
    } else {
      navigate(`/activities/${selectedItem.id}`);
    }
  };

  if (showVideo && videoUrl) {
    return (
      <VideoPlayer
        src={videoUrl}
        duration={10}
        onEnd={handleVideoEnd}
        onSkip={() => handleVideoEnd()}
      />
    );
  }

  return (
    <div className="dice-roll-container">
      <button
        onClick={() => rollDiceMutation.mutate()}
        disabled={rollStatus?.rollsRemaining === 0 || rollDiceMutation.isPending}
        className="dice-button"
      >
        <DiceIcon />
        <span>Roll the Dice</span>
      </button>

      {rollStatus && (
        <p className="rolls-remaining">
          Rolls remaining today: {rollStatus.rollsRemaining}
        </p>
      )}

      {rollDiceMutation.isError && (
        <div className="error-message">
          {rollDiceMutation.error.message}
        </div>
      )}
    </div>
  );
}
```

---

**2. Video Player Component**

```typescript
// src/components/VideoPlayer.tsx

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  duration: number; // seconds
  onEnd: () => void;
  onSkip?: () => void;
}

export function VideoPlayer({ src, duration, onEnd, onSkip }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play();

    // Allow skip after 5 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Handle video end
    video.addEventListener('ended', () => {
      clearInterval(countdownInterval);
      clearTimeout(skipTimer);
      onEnd();
    });

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(skipTimer);
    };
  }, [src, duration, onEnd]);

  return (
    <div className="video-player-overlay">
      <video
        ref={videoRef}
        src={src}
        className="dice-video"
        autoPlay
        muted={false}
      />
      
      <div className="video-controls">
        {canSkip && onSkip && (
          <button onClick={onSkip} className="skip-button">
            Skip ({timeRemaining}s)
          </button>
        )}
        
        {!canSkip && (
          <div className="countdown">
            {timeRemaining}s
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### API Endpoints

**POST `/api/discover/dice/roll`**
- Rolls dice, returns video URL and selected item
- Returns 429 if daily limit reached

**GET `/api/discover/dice/status`**
- Returns remaining rolls for today
- Returns next roll availability time

---

## Stories 24-Hour Expiration

### Overview

**Feature:** Stories automatically expire and disappear after 24 hours.

**Purpose:** Create urgency and keep content fresh.

**Scope:** All story types (image, video, text).

---

### Technical Implementation

#### Database Schema

**Update `Story` table:**

```prisma
model Story {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  mediaUrl    String?  // Image or video URL
  text        String?
  storyType   String   // "image" | "video" | "text"
  expiresAt   DateTime // Calculated: createdAt + 24 hours
  isExpired   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  
  @@index([userId, expiresAt])
  @@index([expiresAt, isExpired])
}
```

---

#### Backend Implementation

**1. Story Creation**

```typescript
// server/src/controllers/storyController.ts

async createStory(req: Request, res: Response) {
  const { mediaUrl, text, storyType } = req.body;
  const userId = req.user.id;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const story = await prisma.story.create({
    data: {
      userId,
      mediaUrl,
      text,
      storyType,
      expiresAt,
      isExpired: false,
    },
  });

  res.json(story);
}
```

---

**2. Expiration Job**

```typescript
// server/src/jobs/storyExpirationJob.ts

import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';

const prisma = new PrismaClient();

/**
 * Runs every 15 minutes to expire stories
 */
export function startStoryExpirationJob() {
  cron.schedule('*/15 * * * *', async () => {
    const expiredStories = await prisma.story.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });

    console.log(`Expired ${expiredStories.count} stories`);

    // Optionally delete expired stories after 7 days
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - 7);

    await prisma.story.deleteMany({
      where: {
        isExpired: true,
        expiresAt: {
          lte: deleteDate,
        },
      },
    });
  });
}
```

---

**3. Story List Query**

```typescript
// server/src/controllers/storyController.ts

async getStories(req: Request, res: Response) {
  const userId = req.user.id; // Optional: filter by user

  const stories = await prisma.story.findMany({
    where: {
      isExpired: false,
      expiresAt: {
        gt: new Date(), // Only non-expired stories
      },
      // Optional: filter by user or following
      ...(userId && {
        OR: [
          { userId },
          {
            user: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate time remaining for each story
  const storiesWithTimeRemaining = stories.map((story) => {
    const timeRemaining = story.expiresAt.getTime() - Date.now();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );

    return {
      ...story,
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        total: timeRemaining,
      },
    };
  });

  res.json(storiesWithTimeRemaining);
}
```

---

#### Frontend Implementation

**1. Story Component with Timer**

```typescript
// src/components/Story.tsx

import { useEffect, useState } from 'react';

interface StoryProps {
  story: {
    id: string;
    mediaUrl?: string;
    text?: string;
    storyType: string;
    expiresAt: string;
    timeRemaining?: {
      hours: number;
      minutes: number;
      total: number;
    };
  };
}

export function Story({ story }: StoryProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    story.timeRemaining?.total || 0
  );

  useEffect(() => {
    if (timeRemaining <= 0) {
      // Story expired, remove from view
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  if (timeRemaining <= 0) {
    return null; // Story expired
  }

  return (
    <div className="story-container">
      {story.storyType === 'image' && (
        <img src={story.mediaUrl} alt="Story" />
      )}
      {story.storyType === 'video' && (
        <video src={story.mediaUrl} autoPlay loop />
      )}
      {story.storyType === 'text' && (
        <div className="story-text">{story.text}</div>
      )}

      <div className="story-timer">
        {hours > 0 ? `${hours}h ` : ''}
        {minutes}m remaining
      </div>
    </div>
  );
}
```

---

### API Endpoints

**POST `/api/stories`**
- Create new story (auto-sets expiresAt to 24 hours)

**GET `/api/stories`**
- Returns non-expired stories only

**GET `/api/stories/:id`**
- Returns story details (404 if expired)

---

## Sponsored Ads in Life Feed

### Overview

**Feature:** Display sponsored ads (reels and posts format) between organic content in the Life feed.

**Purpose:** Monetization through advertising.

**Scope:** Life page feed (reels and posts).

---

### Business Rules

1. **Ad Frequency:**
   - Maximum 1 ad per 5 organic posts/reels
   - Ads distributed evenly throughout feed
   - Premium users see fewer or no ads

2. **Ad Format:**
   - Reels format: Vertical video (9:16 aspect ratio)
   - Post format: Image or video post (1:1 or 4:5 aspect ratio)

3. **Ad Display:**
   - Clearly labeled as "Sponsored"
   - Same UI as regular content (seamless integration)
   - User can dismiss/hide ads

4. **Ad Placement:**
   - Not as first item in feed
   - Not as last item in feed
   - Distributed evenly (e.g., after every 5th item)

---

### Technical Implementation

#### Database Schema

**Create `SponsoredAd` table:**

```prisma
model SponsoredAd {
  id            String   @id @default(uuid())
  advertiserId  String
  advertiser    User     @relation(fields: [advertiserId], references: [id])
  
  title         String
  description   String?
  mediaUrl      String   // Image or video URL
  adType        String   // "reel" | "post"
  ctaText       String   // "Learn More", "Sign Up", etc.
  ctaUrl        String   // Link to advertiser page or website
  
  targetAudience JSON?   // Targeting criteria (interests, location, etc.)
  maxImpressions Int?    // Maximum number of impressions
  currentImpressions Int @default(0)
  
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([isActive, startDate, endDate])
  @@index([adType])
}
```

**Create `AdImpression` table:**

```prisma
model AdImpression {
  id        String   @id @default(uuid())
  adId      String
  ad        SponsoredAd @relation(fields: [adId], references: [id])
  userId    String?  // Null if anonymous
  viewedAt  DateTime @default(now())
  
  @@index([adId, viewedAt])
  @@index([userId, viewedAt])
}
```

---

#### Backend Implementation

**1. Feed with Ads**

```typescript
// server/src/controllers/feedController.ts

async getLifeFeed(req: Request, res: Response) {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interests: true,
      blockedAds: {
        select: { adId: true },
      },
    },
  });

  // Check if user is premium (fewer/no ads)
  const isPremium = user.subscriptionType === 'premium';
  const adFrequency = isPremium ? 10 : 5; // 1 ad per 10 posts for premium, 1 per 5 for free

  // Get organic content (reels and posts)
  const organicContent = await getOrganicContent(userId, page, limit);

  // Get sponsored ads if not premium or if premium with reduced frequency
  const ads = isPremium
    ? await getSponsoredAds(userId, Math.floor(limit / adFrequency), user)
    : await getSponsoredAds(userId, Math.floor(limit / adFrequency), user);

  // Merge ads into feed
  const feed = mergeAdsIntoFeed(organicContent, ads, adFrequency);

  res.json({
    feed,
    hasMore: organicContent.length === limit,
    nextPage: page + 1,
  });
}

async function getOrganicContent(userId: string, page: number, limit: number) {
  // Get reels
  const reels = await prisma.reel.findMany({
    where: {
      // Filter based on user's following, interests, etc.
    },
    take: limit / 2, // Half reels, half posts
    skip: (page - 1) * (limit / 2),
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get posts
  const posts = await prisma.post.findMany({
    where: {
      // Filter based on user's following, interests, etc.
    },
    take: limit / 2,
    skip: (page - 1) * (limit / 2),
    orderBy: {
      createdAt: 'desc',
    },
  });

  return [
    ...reels.map((r) => ({ ...r, type: 'reel' })),
    ...posts.map((p) => ({ ...p, type: 'post' })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

async function getSponsoredAds(
  userId: string,
  count: number,
  user: any
) {
  const ads = await prisma.sponsoredAd.findMany({
    where: {
      isActive: true,
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
      // Exclude blocked ads
      id: {
        notIn: user.blockedAds.map((b) => b.adId),
      },
      // Check max impressions
      OR: [
        { maxImpressions: null },
        {
          currentImpressions: {
            lt: prisma.sponsoredAd.fields.maxImpressions,
          },
        },
      ],
    },
    // Target audience matching (simplified)
    // In production, implement more sophisticated targeting
    take: count * 2, // Get more than needed for randomization
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Randomly select ads
  const selectedAds = ads
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((ad) => ({
      ...ad,
      type: 'ad',
      adType: ad.adType,
    }));

  return selectedAds;
}

function mergeAdsIntoFeed(
  organicContent: any[],
  ads: any[],
  adFrequency: number
) {
  const feed: any[] = [];
  let adIndex = 0;

  for (let i = 0; i < organicContent.length; i++) {
    feed.push(organicContent[i]);

    // Insert ad after every adFrequency items (but not first or last)
    if ((i + 1) % adFrequency === 0 && i > 0 && i < organicContent.length - 1) {
      if (adIndex < ads.length) {
        feed.push(ads[adIndex]);
        adIndex++;
      }
    }
  }

  return feed;
}
```

---

**2. Ad Impression Tracking**

```typescript
// server/src/controllers/adController.ts

async trackAdImpression(req: Request, res: Response) {
  const { adId } = req.body;
  const userId = req.user?.id;

  // Record impression
  await prisma.adImpression.create({
    data: {
      adId,
      userId: userId || null,
    },
  });

  // Update ad's current impressions count
  await prisma.sponsoredAd.update({
    where: { id: adId },
    data: {
      currentImpressions: {
        increment: 1,
      },
    },
  });

  res.json({ success: true });
}
```

---

**3. Hide/Dismiss Ad**

```typescript
// server/src/controllers/adController.ts

async hideAd(req: Request, res: Response) {
  const { adId } = req.body;
  const userId = req.user.id;

  // Add to user's blocked ads
  await prisma.user.update({
    where: { id: userId },
    data: {
      blockedAds: {
        create: {
          adId,
        },
      },
    },
  });

  res.json({ success: true });
}
```

---

#### Frontend Implementation

**1. Life Feed Component**

```typescript
// src/pages/LifePage.tsx

import { useInfiniteQuery } from '@tanstack/react-query';
import { AdReel } from '../components/AdReel';
import { AdPost } from '../components/AdPost';
import { Reel } from '../components/Reel';
import { Post } from '../components/Post';

export function LifePage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['lifeFeed'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `/api/feed/life?page=${pageParam}&limit=20`
      );
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const feed = data?.pages.flatMap((page) => page.feed) || [];

  return (
    <div className="life-feed">
      {feed.map((item: any) => {
        if (item.type === 'ad') {
          if (item.adType === 'reel') {
            return <AdReel key={item.id} ad={item} />;
          } else {
            return <AdPost key={item.id} ad={item} />;
          }
        } else if (item.type === 'reel') {
          return <Reel key={item.id} reel={item} />;
        } else {
          return <Post key={item.id} post={item} />;
        }
      })}

      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          Load More
        </button>
      )}
    </div>
  );
}
```

---

**2. Ad Reel Component**

```typescript
// src/components/AdReel.tsx

import { useEffect } from 'react';

interface AdReelProps {
  ad: {
    id: string;
    title: string;
    mediaUrl: string;
    ctaText: string;
    ctaUrl: string;
  };
}

export function AdReel({ ad }: AdReelProps) {
  useEffect(() => {
    // Track impression when ad comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId: ad.id }),
          });
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`ad-${ad.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [ad.id]);

  const handleHide = async () => {
    await fetch('/api/ads/hide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad.id }),
    });
    // Remove from feed (client-side)
  };

  return (
    <div id={`ad-${ad.id}`} className="ad-reel">
      <div className="sponsored-badge">Sponsored</div>
      <video src={ad.mediaUrl} className="reel-video" />
      <div className="ad-content">
        <h3>{ad.title}</h3>
        <a href={ad.ctaUrl} className="cta-button">
          {ad.ctaText}
        </a>
        <button onClick={handleHide} className="hide-ad-button">
          Hide Ad
        </button>
      </div>
    </div>
  );
}
```

---

**3. Ad Post Component**

```typescript
// src/components/AdPost.tsx

export function AdPost({ ad }: AdReelProps) {
  // Similar implementation to AdReel but for post format
  return (
    <div className="ad-post">
      <div className="sponsored-badge">Sponsored</div>
      <img src={ad.mediaUrl} alt={ad.title} />
      <div className="ad-content">
        <p>{ad.description}</p>
        <a href={ad.ctaUrl} className="cta-button">
          {ad.ctaText}
        </a>
        <button onClick={handleHide}>Hide Ad</button>
      </div>
    </div>
  );
}
```

---

### API Endpoints

**GET `/api/feed/life`**
- Returns feed with ads interspersed

**POST `/api/ads/impression`**
- Tracks ad impression

**POST `/api/ads/hide`**
- Hides ad for user

---

## Payment Processing System

### Overview

**Feature:** Process payments with 4% platform fee. Remaining 96% goes to creator (teacher, venue, etc.). Support debit and credit cards.

**Purpose:** Monetization and revenue distribution.

---

### Business Rules

1. **Payment Methods:**
   - Debit Card
   - Credit Card
   - Cash (for onsite classes/activities, paid before first session)

2. **Fee Structure:**
   - Platform fee: 4% of gross payment
   - Creator receives: 96% of gross payment
   - Example: $100 payment → $4 fee → $96 to creator

3. **Payment Flow:**
   - User enrolls/joins paid class/activity
   - Payment dialog opens
   - User selects payment method (card or cash)
   - If card: Process payment immediately
   - If cash: Mark as pending, confirm after payment received

4. **Revenue Distribution:**
   - For Classes: 96% to instructor
   - For Activities: 96% to activity host
   - For Venue Events: 96% to venue

---

### Technical Implementation

#### Database Schema

**Update `Enrollment` table:**

```prisma
model Enrollment {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  classId         String
  class           Class    @relation(fields: [classId], references: [id])
  
  // Payment fields
  amount          Decimal
  platformFee     Decimal  // 4% of amount
  creatorAmount   Decimal  // 96% of amount
  paymentMethod   String   // "card" | "cash"
  paymentStatus   String   @default("pending") // "pending" | "completed" | "failed" | "refunded"
  paymentIntentId String?  // Stripe payment intent ID
  transactionId   String?
  
  qrCodeId        String?  // If physical location
  qrCode          QRCode?  @relation(fields: [qrCodeId], references: [id])
  
  enrolledAt      DateTime @default(now())
  paidAt          DateTime?
  
  @@index([userId])
  @@index([classId])
  @@index([paymentStatus])
}
```

**Create `Payment` table:**

```prisma
model Payment {
  id              String   @id @default(uuid())
  enrollmentId    String?
  enrollment      Enrollment? @relation(fields: [enrollmentId], references: [id])
  
  amount          Decimal
  platformFee     Decimal
  creatorAmount   Decimal
  paymentMethod   String   // "card" | "cash"
  paymentStatus   String   @default("pending")
  paymentIntentId String?  // Stripe
  transactionId   String?
  
  // For revenue tracking
  creatorId       String   // Instructor, venue, etc.
  creatorType     String   // "instructor" | "venue" | "host"
  
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  
  @@index([creatorId, creatorType])
  @@index([paymentStatus])
}
```

---

#### Backend Implementation

**1. Payment Processing**

```typescript
// server/src/controllers/paymentController.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const PLATFORM_FEE_PERCENTAGE = 0.04; // 4%

async function processPayment(req: Request, res: Response) {
  const { enrollmentId, paymentMethod, cardDetails } = req.body;
  const userId = req.user.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      class: {
        include: {
          instructor: true,
        },
      },
    },
  });

  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  if (enrollment.paymentStatus === 'completed') {
    return res.status(400).json({ error: 'Already paid' });
  }

  const grossAmount = enrollment.amount.toNumber();
  const platformFee = grossAmount * PLATFORM_FEE_PERCENTAGE;
  const creatorAmount = grossAmount - platformFee;

  if (paymentMethod === 'card') {
    // Process card payment via Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(grossAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          enrollmentId,
          userId,
          creatorId: enrollment.class.instructorId,
          creatorType: 'instructor',
        },
      });

      // Confirm payment with card details
      await stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: {
          card: {
            number: cardDetails.number,
            exp_month: cardDetails.expMonth,
            exp_year: cardDetails.expYear,
            cvc: cardDetails.cvc,
          },
        },
      });

      // Update enrollment
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          paymentStatus: 'completed',
          paymentMethod: 'card',
          paymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id,
          paidAt: new Date(),
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          enrollmentId,
          amount: grossAmount,
          platformFee,
          creatorAmount,
          paymentMethod: 'card',
          paymentStatus: 'completed',
          paymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id,
          creatorId: enrollment.class.instructorId,
          creatorType: 'instructor',
          paidAt: new Date(),
        },
      });

      // Generate QR code if physical location
      if (enrollment.class.locationType === 'onsite' || enrollment.class.locationType === 'hybrid') {
        const qrCode = await generateQRCode(enrollmentId, enrollment.classId, userId);
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: { qrCodeId: qrCode.id },
        });
      }

      res.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        qrCodeId: enrollment.qrCodeId,
      });
    } catch (error: any) {
      // Handle Stripe errors
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          paymentStatus: 'failed',
        },
      });

      res.status(400).json({
        error: 'Payment failed',
        message: error.message,
      });
    }
  } else if (paymentMethod === 'cash') {
    // Mark as pending cash payment
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        paymentMethod: 'cash',
        paymentStatus: 'pending',
      },
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        enrollmentId,
        amount: grossAmount,
        platformFee,
        creatorAmount,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        creatorId: enrollment.class.instructorId,
        creatorType: 'instructor',
      },
    });

    res.json({
      success: true,
      message: 'Payment marked as pending. Please pay in cash before the first session.',
      paymentStatus: 'pending',
    });
  }
}
```

---

**2. Confirm Cash Payment**

```typescript
// server/src/controllers/paymentController.ts

async confirmCashPayment(req: Request, res: Response) {
  const { enrollmentId } = req.body;
  // This endpoint is called by instructor/venue after receiving cash

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      class: true,
    },
  });

  if (enrollment.paymentMethod !== 'cash') {
    return res.status(400).json({ error: 'Not a cash payment' });
  }

  // Update enrollment
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      paymentStatus: 'completed',
      paidAt: new Date(),
    },
  });

  // Update payment record
  await prisma.payment.updateMany({
    where: { enrollmentId },
    data: {
      paymentStatus: 'completed',
      paidAt: new Date(),
    },
  });

  // Generate QR code if needed
  if (enrollment.class.locationType === 'onsite' || enrollment.class.locationType === 'hybrid') {
    const qrCode = await generateQRCode(enrollmentId, enrollment.classId, enrollment.userId);
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { qrCodeId: qrCode.id },
    });
  }

  res.json({ success: true });
}
```

---

**3. Revenue Dashboard**

```typescript
// server/src/controllers/revenueController.ts

async getRevenue(req: Request, res: Response) {
  const creatorId = req.user.id;
  const creatorType = req.query.type as string; // "instructor" | "venue" | "host"

  const payments = await prisma.payment.findMany({
    where: {
      creatorId,
      creatorType,
      paymentStatus: 'completed',
    },
  });

  const totalRevenue = payments.reduce(
    (sum, p) => sum + p.creatorAmount.toNumber(),
    0
  );

  const totalPlatformFees = payments.reduce(
    (sum, p) => sum + p.platformFee.toNumber(),
    0
  );

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthPayments = payments.filter(
    (p) => p.paidAt && p.paidAt >= thisMonth
  );

  const thisMonthRevenue = thisMonthPayments.reduce(
    (sum, p) => sum + p.creatorAmount.toNumber(),
    0
  );

  res.json({
    totalRevenue,
    totalPlatformFees,
    thisMonthRevenue,
    paymentCount: payments.length,
    thisMonthPaymentCount: thisMonthPayments.length,
    breakdown: {
      platformFeePercentage: 4,
      creatorPercentage: 96,
    },
  });
}
```

---

### API Endpoints

**POST `/api/payments/process`**
- Process payment (card or cash)

**POST `/api/payments/confirm-cash`**
- Confirm cash payment received

**GET `/api/revenue`**
- Get revenue dashboard data

---

## QR Code Generation & Check-In

### Overview

**Feature:** Generate QR codes for enrollments in classes/activities with physical locations. QR codes used for check-in at venues.

**Purpose:** Streamline entry and verify attendance.

---

### Business Rules

1. **QR Code Generation:**
   - Generated automatically after enrollment/payment
   - Only for classes/activities with physical locations (onsite or hybrid)
   - Unique QR code per enrollment

2. **QR Code Content:**
   - Enrollment ID
   - User ID
   - Class/Activity ID
   - Timestamp
   - Validation hash

3. **Check-In Process:**
   - Venue/instructor scans QR code
   - System validates QR code
   - Marks user as checked in
   - Records check-in time

---

### Technical Implementation

#### Database Schema

**Create `QRCode` table:**

```prisma
model QRCode {
  id            String   @id @default(uuid())
  enrollmentId  String
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id])
  
  code          String   @unique // Unique QR code string
  qrData        String   // Encoded data (JSON string)
  validationHash String  // Security hash
  
  isUsed        Boolean  @default(false)
  checkedInAt   DateTime?
  checkedInBy   String?  // Venue/instructor ID
  
  createdAt     DateTime @default(now())
  expiresAt     DateTime // Event/class end date + buffer
  
  @@index([code])
  @@index([enrollmentId])
}
```

---

#### Backend Implementation

**1. Generate QR Code**

```typescript
// server/src/utils/qrCodeGenerator.ts

import QRCode from 'qrcode';
import crypto from 'crypto';

export async function generateQRCode(
  enrollmentId: string,
  classId: string,
  userId: string
) {
  // Create QR code data
  const qrData = {
    enrollmentId,
    classId,
    userId,
    timestamp: Date.now(),
  };

  // Generate validation hash
  const secret = process.env.QR_CODE_SECRET!;
  const dataString = JSON.stringify(qrData);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('hex');

  const qrCodeData = {
    ...qrData,
    hash,
  };

  // Generate unique code
  const code = `${enrollmentId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Generate QR code image
  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
  });

  // Get class/activity end date for expiration
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: { endDate: true },
  });

  const expiresAt = classData?.endDate
    ? new Date(classData.endDate.getTime() + 24 * 60 * 60 * 1000) // 24 hours after end
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

  // Save QR code to database
  const qrCode = await prisma.qRCode.create({
    data: {
      enrollmentId,
      code,
      qrData: JSON.stringify(qrCodeData),
      validationHash: hash,
      expiresAt,
    },
  });

  return {
    ...qrCode,
    qrCodeImage, // Base64 image data
  };
}
```

---

**2. Validate and Check-In**

```typescript
// server/src/controllers/checkInController.ts

async scanQRCode(req: Request, res: Response) {
  const { qrCodeData } = req.body; // Scanned QR code data
  const scannerId = req.user.id; // Venue/instructor ID

  try {
    // Parse QR code data
    const data = JSON.parse(qrCodeData);

    // Validate hash
    const secret = process.env.QR_CODE_SECRET!;
    const dataString = JSON.stringify({
      enrollmentId: data.enrollmentId,
      classId: data.classId,
      userId: data.userId,
      timestamp: data.timestamp,
    });
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(dataString)
      .digest('hex');

    if (data.hash !== expectedHash) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    // Find QR code in database
    const qrCode = await prisma.qRCode.findUnique({
      where: { code: data.enrollmentId + '-' }, // Partial match, need full code lookup
      include: {
        enrollment: {
          include: {
            class: true,
            user: true,
          },
        },
      },
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Validate QR code
    if (qrCode.isUsed) {
      return res.status(400).json({
        error: 'QR code already used',
        checkedInAt: qrCode.checkedInAt,
      });
    }

    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: 'QR code expired' });
    }

    // Check if scanner has permission (is instructor/venue for this class)
    const classData = qrCode.enrollment.class;
    const hasPermission =
      classData.instructorId === scannerId ||
      classData.venueId === scannerId;

    if (!hasPermission) {
      return res.status(403).json({ error: 'Unauthorized to check in' });
    }

    // Mark as checked in
    await prisma.qRCode.update({
      where: { id: qrCode.id },
      data: {
        isUsed: true,
        checkedInAt: new Date(),
        checkedInBy: scannerId,
      },
    });

    res.json({
      success: true,
      user: {
        name: qrCode.enrollment.user.name,
        email: qrCode.enrollment.user.email,
      },
      checkedInAt: new Date(),
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid QR code format' });
  }
}
```

---

**3. Get QR Code for User**

```typescript
// server/src/controllers/qrCodeController.ts

async getQRCode(req: Request, res: Response) {
  const { enrollmentId } = req.params;
  const userId = req.user.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      qrCode: true,
      class: true,
    },
  });

  if (!enrollment || enrollment.userId !== userId) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  if (!enrollment.qrCode) {
    return res.status(404).json({ error: 'QR code not generated' });
  }

  // Generate QR code image if not cached
  const qrCodeImage = await QRCode.toDataURL(enrollment.qrCode.qrData, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
  });

  res.json({
    qrCode: enrollment.qrCode,
    qrCodeImage,
    enrollment: {
      class: enrollment.class.title,
      date: enrollment.class.startDate,
      location: enrollment.class.location,
    },
  });
}
```

---

### API Endpoints

**GET `/api/qr-codes/:enrollmentId`**
- Get QR code for enrollment

**POST `/api/check-in/scan`**
- Scan and validate QR code for check-in

**GET `/api/check-in/:classId`**
- Get check-in list for class/activity

---

## Follow System for Creators

### Overview

**Feature:** Users can follow entrepreneurs, influencers, instructors, teachers, and other creators.

**Purpose:** Build creator communities and enable content discovery.

---

### Business Rules

1. **Followable User Types:**
   - Entrepreneur
   - Influencer
   - Instructor
   - Teacher
   - Venue
   - Regular users (all users can be followed)

2. **Follow Features:**
   - Follow/unfollow toggle
   - See followers count
   - See following count
   - Mutual follow indicator
   - Follow notifications

3. **Feed Integration:**
   - Content from followed creators appears in feed
   - Stories from followed users appear in stories feed

---

### Technical Implementation

#### Database Schema

**Create `Follow` table:**

```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String
  follower    User     @relation("Followers", fields: [followerId], references: [id])
  followingId String
  following   User     @relation("Following", fields: [followingId], references: [id])
  
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

**Update `User` table:**

```prisma
model User {
  id          String   @id @default(uuid())
  // ... existing fields
  
  userType    String?  // "entrepreneur" | "influencer" | "instructor" | "teacher" | "venue" | "regular"
  
  followers   Follow[] @relation("Following")
  following   Follow[] @relation("Followers")
  
  // ... other relations
}
```

---

#### Backend Implementation

**1. Follow/Unfollow**

```typescript
// server/src/controllers/followController.ts

async followUser(req: Request, res: Response) {
  const { userId } = req.params; // User to follow
  const followerId = req.user.id;

  if (userId === followerId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  if (existingFollow) {
    return res.status(400).json({ error: 'Already following' });
  }

  // Create follow relationship
  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          userType: true,
        },
      },
    },
  });

  // Send notification to followed user
  await sendNotification(userId, {
    type: 'NEW_FOLLOWER',
    title: 'New Follower',
    message: `${req.user.name} started following you`,
    userId: followerId,
  });

  res.json(follow);
}

async unfollowUser(req: Request, res: Response) {
  const { userId } = req.params;
  const followerId = req.user.id;

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  res.json({ success: true });
}
```

---

**2. Get Followers/Following**

```typescript
// server/src/controllers/followController.ts

async getFollowers(req: Request, res: Response) {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  const followers = await prisma.follow.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          avatar: true,
          userType: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Check mutual follows
  const mutualFollows = await prisma.follow.findMany({
    where: {
      followerId: currentUserId,
      followingId: {
        in: followers.map((f) => f.followerId),
      },
    },
    select: {
      followingId: true,
    },
  });

  const mutualIds = new Set(mutualFollows.map((f) => f.followingId));

  const followersWithMutual = followers.map((follow) => ({
    ...follow.follower,
    isMutual: mutualIds.has(follow.followerId),
    followedAt: follow.createdAt,
  }));

  res.json(followersWithMutual);
}

async getFollowing(req: Request, res: Response) {
  const { userId } = req.params;

  const following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          userType: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(following.map((f) => f.following));
}
```

---

**3. Check Follow Status**

```typescript
// server/src/controllers/followController.ts

async getFollowStatus(req: Request, res: Response) {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userId,
      },
    },
  });

  // Check if mutual
  const mutualFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: currentUserId,
      },
    },
  });

  // Get counts
  const followerCount = await prisma.follow.count({
    where: { followingId: userId },
  });

  const followingCount = await prisma.follow.count({
    where: { followerId: userId },
  });

  res.json({
    isFollowing: !!follow,
    isMutual: !!mutualFollow,
    followerCount,
    followingCount,
  });
}
```

---

### API Endpoints

**POST `/api/users/:userId/follow`**
- Follow a user

**DELETE `/api/users/:userId/follow`**
- Unfollow a user

**GET `/api/users/:userId/followers`**
- Get user's followers

**GET `/api/users/:userId/following`**
- Get users that user is following

**GET `/api/users/:userId/follow-status`**
- Get follow status (isFollowing, isMutual, counts)

---

## Summary

### Implementation Priority

1. **High Priority:**
   - Payment Processing System (core monetization)
   - QR Code Generation & Check-In (core functionality)
   - Follow System (social features)

2. **Medium Priority:**
   - Stories 24-Hour Expiration
   - Sponsored Ads in Life Feed

3. **Lower Priority:**
   - 1-on-1 Chat Auto-Deletion
   - Dice Random Selection (gamification)

### Testing Requirements

Each feature should have:
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for user flows
- Performance tests for scheduled jobs

### Deployment Considerations

- Scheduled jobs (chat deletion, story expiration) require cron setup
- Payment processing requires Stripe account and webhook handling
- QR code generation requires image storage (S3 or similar)
- Ad serving requires caching and CDN for performance

---

**Document Owner:** Development Team  
**Last Updated:** January 24, 2026  
**Next Review:** As features are implemented
